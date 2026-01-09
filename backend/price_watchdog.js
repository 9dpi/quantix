import dotenv from 'dotenv';
import pg from 'pg';
import fetch from 'node-fetch';
import TelegramBot from 'node-telegram-bot-api';

dotenv.config();

const { Pool } = pg;

// --- DATABASE CONFIG ---
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '6543'),
    ssl: { rejectUnauthorized: false }
});

// --- TELEGRAM BOT (Optional) ---
const bot = process.env.TELEGRAM_TOKEN ? new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: false }) : null;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// --- ALPHA VANTAGE API CONFIG ---
const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_KEY || 'Z9JGV0STF4PE6C61';

/**
 * Lấy giá EUR/USD từ Alpha Vantage (Real-time Forex)
 */
async function getAlphaVantagePrice() {
    try {
        if (!ALPHA_VANTAGE_KEY) {
            console.warn("⚠️ Alpha Vantage API Key not configured, using Yahoo Finance fallback");
            return await getYahooPrice();
        }

        const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=EUR&to_currency=USD&apikey=${ALPHA_VANTAGE_KEY}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Alpha Vantage API Error: ${response.status}`);
        }

        const data = await response.json();

        // Check for rate limit or error
        if (data.Note || data['Error Message']) {
            console.warn("⚠️ Alpha Vantage rate limit or error, using fallback");
            return await getYahooPrice();
        }

        const price = parseFloat(data['Realtime Currency Exchange Rate']['5. Exchange Rate']);
        console.log(`📊 Alpha Vantage EUR/USD: ${price}`);
        return price;

    } catch (error) {
        console.error("❌ Alpha Vantage Fetch Error:", error.message);
        return await getYahooPrice(); // Fallback
    }
}

/**
 * Fallback: Lấy giá từ Yahoo Finance
 */
async function getYahooPrice() {
    try {
        const response = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/EURUSD=X?interval=1m&range=1d');
        const data = await response.json();
        const price = data.chart.result[0].meta.regularMarketPrice;
        console.log(`📊 Yahoo EUR/USD (Fallback): ${price}`);
        return price;
    } catch (error) {
        console.error("❌ Yahoo Fetch Error:", error.message);
        return null;
    }
}

/**
 * Gửi Alert qua Telegram
 */
async function sendTelegramAlert(message) {
    if (!bot || !CHAT_ID) {
        console.log("📢 Telegram Alert (Not configured):", message);
        return;
    }

    try {
        await bot.sendMessage(CHAT_ID, message, { parse_mode: 'Markdown' });
        console.log("✅ Telegram Alert Sent");
    } catch (error) {
        console.error("❌ Telegram Error:", error.message);
    }
}

/**
 * Cập nhật trạng thái Signal trong Database
 */
async function updateSignalStatus(signalId, newStatus, currentPrice) {
    const client = await pool.connect();
    try {
        // Lưu trạng thái vào một cột metadata (JSON) hoặc tạo bảng riêng
        // Tạm thời update vào model_version để demo
        await client.query(
            `UPDATE ai_signals SET model_version = $1 WHERE id = $2`,
            [newStatus, signalId]
        );
        console.log(`✅ Updated Signal ${signalId} → ${newStatus}`);
    } catch (error) {
        console.error("❌ DB Update Error:", error.message);
    } finally {
        client.release();
    }
}

/**
 * CORE LOGIC: Price Watchdog
 */
async function watchSignals() {
    const client = await pool.connect();

    try {
        // Lấy tất cả signals đang ACTIVE (chưa hit SL hoặc TP2)
        const result = await client.query(`
            SELECT id, symbol, signal_type, predicted_close, confidence_score, model_version, created_at
            FROM ai_signals
            WHERE symbol = 'EURUSD=X'
            AND is_published = TRUE
            AND (model_version IS NULL OR model_version NOT IN ('SL_HIT', 'TP2_HIT'))
            ORDER BY created_at DESC
            LIMIT 10
        `);

        const signals = result.rows;

        if (signals.length === 0) {
            console.log("⏳ No active signals to watch.");
            return;
        }

        // Lấy giá hiện tại từ Alpha Vantage
        const currentPrice = await getAlphaVantagePrice();
        if (!currentPrice) {
            console.error("❌ Cannot fetch current price, skipping this cycle.");
            return;
        }

        console.log(`\n🔍 Watching ${signals.length} signals | Current Price: ${currentPrice}`);

        for (const signal of signals) {
            const entry = parseFloat(signal.predicted_close);
            const signalType = signal.signal_type; // 'LONG' or 'SHORT'
            const currentStatus = signal.model_version || 'WAITING';

            // Tính SL & TP (giống logic Frontend)
            const sl = signalType === 'LONG' ? entry * 0.997 : entry * 1.003;
            const tp1 = signalType === 'LONG' ? entry * 1.004 : entry * 0.996;
            const tp2 = signalType === 'LONG' ? entry * 1.008 : entry * 0.992;

            let newStatus = currentStatus;
            let alertMessage = null;

            // --- LOGIC TREE ---
            if (currentStatus === 'WAITING') {
                // Chưa vào lệnh, check xem giá có chạm Entry chưa
                const entryHit = signalType === 'LONG'
                    ? currentPrice <= entry
                    : currentPrice >= entry;

                if (entryHit) {
                    newStatus = 'ENTRY_HIT';
                    alertMessage = `🎯 *ENTRY HIT*\n${signalType} EUR/USD @ ${entry}\nCurrent: ${currentPrice}\nSL: ${sl.toFixed(4)} | TP1: ${tp1.toFixed(4)} | TP2: ${tp2.toFixed(4)}`;
                }
            }
            else if (currentStatus === 'ENTRY_HIT' || currentStatus === 'TP1_HIT') {
                // Đã vào lệnh, check SL và TP
                const slHit = signalType === 'LONG'
                    ? currentPrice <= sl
                    : currentPrice >= sl;

                const tp1Hit = signalType === 'LONG'
                    ? currentPrice >= tp1
                    : currentPrice <= tp1;

                const tp2Hit = signalType === 'LONG'
                    ? currentPrice >= tp2
                    : currentPrice <= tp2;

                if (slHit) {
                    newStatus = 'SL_HIT';
                    alertMessage = `🛑 *STOP LOSS HIT*\n${signalType} EUR/USD\nEntry: ${entry} → SL: ${sl.toFixed(4)}\nCurrent: ${currentPrice}`;
                } else if (tp2Hit) {
                    newStatus = 'TP2_HIT';
                    alertMessage = `💰💰 *TP2 HIT - FULL PROFIT!*\n${signalType} EUR/USD\nEntry: ${entry} → TP2: ${tp2.toFixed(4)}\nCurrent: ${currentPrice}`;
                } else if (tp1Hit && currentStatus === 'ENTRY_HIT') {
                    newStatus = 'TP1_HIT';
                    alertMessage = `💰 *TP1 HIT*\n${signalType} EUR/USD\nEntry: ${entry} → TP1: ${tp1.toFixed(4)}\nCurrent: ${currentPrice}\n_Moving SL to breakeven recommended._`;
                }
            }

            // Nếu có thay đổi trạng thái
            if (newStatus !== currentStatus) {
                await updateSignalStatus(signal.id, newStatus, currentPrice);
                if (alertMessage) {
                    await sendTelegramAlert(alertMessage);
                }
            }
        }

    } catch (error) {
        console.error("❌ Watchdog Error:", error.message);
    } finally {
        client.release();
    }
}

/**
 * MAIN LOOP
 */
async function startWatchdog() {
    console.log("🚀 Starting Price Watchdog for EUR/USD...");
    console.log("   Data Source: Alpha Vantage (Real-time Forex)");
    console.log("   Fallback: Yahoo Finance");
    console.log("   Check Interval: Every 10 seconds");
    console.log("-----------------------------------\n");

    // Chạy ngay lần đầu
    await watchSignals();

    // Sau đó lặp lại mỗi 10 giây
    setInterval(async () => {
        await watchSignals();
    }, 10000); // 10 seconds
}

// Start
startWatchdog();
