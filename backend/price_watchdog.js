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

// --- PRICE CONFIRMATION BUFFER (Anti-Wick) ---
const priceConfirmationBuffer = new Map(); // signalId -> { price, count, timestamp }
const CONFIRMATION_THRESHOLD = 2; // Cần 2 lần check liên tiếp để xác nhận

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
        const response = await fetch(url, { timeout: 5000 }); // 5s timeout

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
        const response = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/EURUSD=X?interval=1m&range=1d', { timeout: 5000 });
        const data = await response.json();
        const price = data.chart.result[0].meta.regularMarketPrice;
        console.log(`📊 Yahoo EUR/USD (Fallback): ${price}`);
        return price;
    } catch (error) {
        console.error("❌ Yahoo Fetch Error:", error.message);
        // Last resort: Return null and skip this cycle
        return null;
    }
}

/**
 * TELEGRAM MESSAGE TEMPLATES
 */
const TelegramTemplates = {
    newSignal: (signal, entry, sl, tp1, tp2) => `
🚨 *NEW SIGNAL DETECTED*

📊 *Pair:* EUR/USD
🎯 *Action:* ${signal.signal_type === 'LONG' ? '🟢 BUY' : '🔴 SELL'}
💰 *Entry:* ${entry}
🛑 *Stop Loss:* ${sl}
🎯 *TP1:* ${tp1}
🎯 *TP2:* ${tp2}
📈 *AI Confidence:* ${signal.confidence_score}%

⏰ _${new Date().toLocaleString('en-GB', { timeZone: 'Asia/Ho_Chi_Minh' })}_
`,

    entryHit: (signalType, entry, currentPrice, sl, tp1, tp2) => `
✅ *ENTRY HIT - POSITION OPENED*

📊 *EUR/USD ${signalType === 'LONG' ? '🟢 BUY' : '🔴 SELL'}*
💰 *Entry Price:* ${entry}
📍 *Current Price:* ${currentPrice}

🛑 *Stop Loss:* ${sl}
🎯 *TP1:* ${tp1}
🎯 *TP2:* ${tp2}

⚡ _Trade is now ACTIVE. Monitoring in progress..._
`,

    tp1Hit: (signalType, entry, tp1, currentPrice) => `
💰 *TP1 HIT - PARTIAL PROFIT!*

📊 *EUR/USD ${signalType === 'LONG' ? '🟢 BUY' : '🔴 SELL'}*
💰 *Entry:* ${entry} → *TP1:* ${tp1}
📍 *Current:* ${currentPrice}

✅ *Recommendation:* Move SL to breakeven
🎯 *Next Target:* TP2

⏰ _${new Date().toLocaleString('en-GB', { timeZone: 'Asia/Ho_Chi_Minh' })}_
`,

    tp2Hit: (signalType, entry, tp2, currentPrice) => `
💰💰 *TP2 HIT - FULL PROFIT SECURED!*

📊 *EUR/USD ${signalType === 'LONG' ? '🟢 BUY' : '🔴 SELL'}*
💰 *Entry:* ${entry} → *TP2:* ${tp2}
📍 *Current:* ${currentPrice}

🎉 *Status:* Trade completed successfully!
✅ *Action:* Close all positions

⏰ _${new Date().toLocaleString('en-GB', { timeZone: 'Asia/Ho_Chi_Minh' })}_
`,

    slHit: (signalType, entry, sl, currentPrice) => `
❌ *STOP LOSS HIT*

📊 *EUR/USD ${signalType === 'LONG' ? '🟢 BUY' : '🔴 SELL'}*
💰 *Entry:* ${entry} → *SL:* ${sl}
📍 *Current:* ${currentPrice}

⚠️ *Status:* Position closed with loss
🔄 *Next:* Wait for new signal

⏰ _${new Date().toLocaleString('en-GB', { timeZone: 'Asia/Ho_Chi_Minh' })}_
`
};

/**
 * Gửi Alert qua Telegram với Template
 */
async function sendTelegramAlert(message) {
    if (!bot || !CHAT_ID) {
        console.log("📢 Telegram Alert (Not configured):", message.replace(/\*/g, '').substring(0, 100) + '...');
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
 * Xác nhận giá với Anti-Wick Logic
 */
function confirmPriceLevel(signalId, currentPrice, targetPrice, tolerance = 0.0005) {
    const key = `${signalId}_${targetPrice}`;
    const isHit = Math.abs(currentPrice - targetPrice) <= tolerance;

    if (!isHit) {
        // Giá không chạm, reset buffer
        priceConfirmationBuffer.delete(key);
        return false;
    }

    // Giá chạm, tăng counter
    const existing = priceConfirmationBuffer.get(key) || { count: 0, timestamp: Date.now() };
    existing.count += 1;
    existing.timestamp = Date.now();
    priceConfirmationBuffer.set(key, existing);

    // Xác nhận nếu đủ số lần
    if (existing.count >= CONFIRMATION_THRESHOLD) {
        priceConfirmationBuffer.delete(key); // Clear sau khi confirm
        return true;
    }

    console.log(`⏳ Price confirmation ${existing.count}/${CONFIRMATION_THRESHOLD} for ${key}`);
    return false;
}

/**
 * Cập nhật trạng thái Signal trong Database
 */
async function updateSignalStatus(signalId, newStatus, currentPrice) {
    const client = await pool.connect();
    try {
        await client.query(
            `UPDATE ai_signals 
             SET signal_status = $1, 
                 current_price = $2, 
                 last_checked_at = NOW() 
             WHERE id = $3`,
            [newStatus, currentPrice, signalId]
        );
        console.log(`✅ Updated Signal ${signalId} → ${newStatus} (Price: ${currentPrice})`);
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
            SELECT id, symbol, signal_type, predicted_close, confidence_score, 
                   signal_status, entry_price, sl_price, tp1_price, tp2_price, 
                   current_price, created_at
            FROM ai_signals
            WHERE symbol = 'EURUSD=X'
            AND is_published = TRUE
            AND (signal_status IS NULL OR signal_status NOT IN ('SL_HIT', 'TP2_HIT'))
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
            const currentStatus = signal.signal_status || 'WAITING';

            // Tính SL & TP (giống logic Frontend)
            const sl = signalType === 'LONG' ? entry * 0.997 : entry * 1.003;
            const tp1 = signalType === 'LONG' ? entry * 1.004 : entry * 0.996;
            const tp2 = signalType === 'LONG' ? entry * 1.008 : entry * 0.992;

            let newStatus = currentStatus;
            let alertMessage = null;

            // --- LOGIC TREE với Anti-Wick ---
            if (currentStatus === 'WAITING') {
                // Chưa vào lệnh, check xem giá có chạm Entry chưa
                const entryHit = signalType === 'LONG'
                    ? currentPrice <= entry
                    : currentPrice >= entry;

                if (entryHit && confirmPriceLevel(signal.id, currentPrice, entry)) {
                    newStatus = 'ENTRY_HIT';
                    alertMessage = TelegramTemplates.entryHit(signalType, entry.toFixed(4), currentPrice.toFixed(4), sl.toFixed(4), tp1.toFixed(4), tp2.toFixed(4));
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

                if (slHit && confirmPriceLevel(signal.id, currentPrice, sl)) {
                    newStatus = 'SL_HIT';
                    alertMessage = TelegramTemplates.slHit(signalType, entry.toFixed(4), sl.toFixed(4), currentPrice.toFixed(4));
                } else if (tp2Hit && confirmPriceLevel(signal.id, currentPrice, tp2)) {
                    newStatus = 'TP2_HIT';
                    alertMessage = TelegramTemplates.tp2Hit(signalType, entry.toFixed(4), tp2.toFixed(4), currentPrice.toFixed(4));
                } else if (tp1Hit && currentStatus === 'ENTRY_HIT' && confirmPriceLevel(signal.id, currentPrice, tp1)) {
                    newStatus = 'TP1_HIT';
                    alertMessage = TelegramTemplates.tp1Hit(signalType, entry.toFixed(4), tp1.toFixed(4), currentPrice.toFixed(4));
                }
            }

            // Nếu có thay đổi trạng thái
            if (newStatus !== currentStatus) {
                await updateSignalStatus(signal.id, newStatus, currentPrice);
                if (alertMessage) {
                    await sendTelegramAlert(alertMessage);
                }
            } else {
                // CRITICAL: Always update current_price even if status unchanged
                // This ensures frontend displays REAL-TIME prices matching TradingView
                const client = await pool.connect();
                try {
                    await client.query(
                        `UPDATE ai_signals 
                         SET current_price = $1, 
                             last_checked_at = NOW() 
                         WHERE id = $2`,
                        [currentPrice, signal.id]
                    );
                    console.log(`📍 Updated price for Signal ${signal.id}: ${currentPrice}`);
                } catch (error) {
                    console.error("❌ Price Update Error:", error.message);
                } finally {
                    client.release();
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
    console.log("   Anti-Wick: 2x confirmation required");
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
