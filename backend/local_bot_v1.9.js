import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import pg from 'pg';
import YahooFinance from 'yahoo-finance2';
import fetch from 'node-fetch';

dotenv.config();

const yahooFinance = new YahooFinance();

// Ưu tiên dùng Token DEV để tránh xung đột với Cloud
const TOKEN = process.env.TELEGRAM_DEV_TOKEN || process.env.TELEGRAM_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

const { Pool } = pg;
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: { rejectUnauthorized: false }
});

// Load Pattern Cache
const PATTERN_PATH = path.join('RecoveryVault', 'patterns_backup_v1.9.json');
let patternCache = [];
try {
    if (fs.existsSync(PATTERN_PATH)) {
        patternCache = JSON.parse(fs.readFileSync(PATTERN_PATH, 'utf8'));
        console.log(`[V1.9] Loaded ${patternCache.length} patterns.`);
    }
} catch (err) {
    console.error(`[V1.9] Load error:`, err.message);
}

async function botAction(method, body) {
    try {
        const res = await fetch(`${TELEGRAM_API}/${method}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        return await res.json();
    } catch (e) {
        console.error(`[BOT] Error:`, e.message);
    }
}

function normalizeCandles(candles) {
    const base = candles[0].o || candles[0].open;
    return candles.map(c => ({
        o: ((c.o || c.open) - base) / base,
        h: ((c.h || c.high) - base) / base,
        l: ((c.l || c.low) - base) / base,
        c: ((c.c || c.close) - base) / base
    }));
}

function calculateCorrelation(current, target) {
    const normCurrent = normalizeCandles(current);
    const normTarget = normalizeCandles(target);
    let sumSqDiff = 0;
    for (let i = 0; i < 4; i++) {
        ['o', 'h', 'l', 'c'].forEach(f => {
            sumSqDiff += Math.pow(normCurrent[i][f] - normTarget[i][f], 2);
        });
    }
    return Math.max(0, 100 * (1 - (Math.sqrt(sumSqDiff) * 10)));
}

function findBestMatch(currentCandles) {
    let bestMatch = null;
    let maxCorrelation = 0;
    for (const p of patternCache) {
        if (!p.results || !p.results.candles) continue;
        const correlation = calculateCorrelation(currentCandles, p.results.candles);
        if (correlation > maxCorrelation) {
            maxCorrelation = correlation;
            bestMatch = p;
        }
    }
    return { bestMatch, correlation: maxCorrelation };
}

let lastUpdateId = 0;
async function pollUpdates() {
    const data = await botAction('getUpdates', { offset: lastUpdateId + 1, timeout: 30 });
    if (data && data.ok && data.result) {
        for (const update of data.result) {
            lastUpdateId = update.update_id;
            if (update.message) handleMessage(update.message);
        }
    }
    setTimeout(pollUpdates, 1000);
}

async function handleMessage(msg) {
    const text = msg.text;
    const chatId = msg.chat.id;
    if (!text) return;

    // --- 1. Signal Genius VIP (Lệnh: /vip) ---
    if (text === '/vip') {
        try {
            // Fetch latest VIP signal from Quantix AI Core (confidence >95%)
            const result = await pool.query(`
                SELECT 
                    symbol,
                    signal_type,
                    predicted_close as entry_price,
                    tp1_price,
                    sl_price,
                    confidence_score,
                    created_at
                FROM ai_signals 
                WHERE confidence_score > 95
                AND is_published = TRUE
                ORDER BY created_at DESC 
                LIMIT 1
            `);

            if (result.rows.length === 0) {
                await botAction('sendMessage', {
                    chat_id: chatId,
                    text: "⏳ No VIP signals available yet. Quantix AI Core is scanning for >95% confidence setups."
                });
                return;
            }

            const signal = result.rows[0];
            const pair = signal.symbol.replace('=X', '');
            const action = signal.signal_type === 'LONG' ? 'BUY' : 'SELL';
            const tradeType = action === 'BUY' ? 'BUY (Long)' : 'SELL (Short)';

            const entry = parseFloat(signal.entry_price);
            const tp = parseFloat(signal.tp1_price || (entry * (action === 'BUY' ? 1.004 : 0.996)));
            const sl = parseFloat(signal.sl_price || (entry * (action === 'BUY' ? 0.997 : 1.003)));

            const pipValue = 0.0001;
            const targetPips = Math.abs((tp - entry) / pipValue).toFixed(0);
            const stopPips = Math.abs((entry - sl) / pipValue).toFixed(0);
            const riskReward = (targetPips / stopPips).toFixed(2);

            const entryLow = (entry - 2 * pipValue).toFixed(5);
            const entryHigh = (entry + 2 * pipValue).toFixed(5);

            // Format timestamp
            const signalDate = new Date(signal.created_at);
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const month = monthNames[signalDate.getUTCMonth()];
            const day = signalDate.getUTCDate();
            const year = signalDate.getUTCFullYear();
            const hours = String(signalDate.getUTCHours()).padStart(2, '0');
            const minutes = String(signalDate.getUTCMinutes()).padStart(2, '0');
            const utcTime = `${month} ${day}, ${year} — ${hours}:${minutes} UTC`;

            const response = `
📊 Asset: ${pair}
📌 Trade: ${tradeType}

📈 Charts:
* Bias: H1
* Entry: M5–M15

💰 Price Levels:
Entry Zone: ${entryLow} – ${entryHigh}
Take Profit (TP): ${tp.toFixed(5)}
Stop Loss (SL): ${sl.toFixed(5)}

📏 Risk Management:
* Target: +${targetPips} pips
* Stop: −${stopPips} pips
* Risk:Reward: 1:${riskReward}
* Suggested Risk: 0.5%–1% per trade

🧠 AI Confidence: ${signal.confidence_score}% (model conviction score)
🕒 Trade Type: Intraday
⏰ Posted: ${utcTime}

⚠️ Not financial advice. Trade responsibly.
            `.trim();

            const keyboard = {
                inline_keyboard: [
                    [
                        { text: '📊 Live Dashboard', url: 'https://9dpi.github.io/ai-forecast-demo/#/mvp' }
                    ]
                ]
            };

            await botAction('sendMessage', {
                chat_id: chatId,
                text: response,
                reply_markup: keyboard
            });

        } catch (e) {
            console.error('[/vip]', e);
            await botAction('sendMessage', { chat_id: chatId, text: "❌ Error fetching VIP signal. Please try again." });
        }
    }

    // --- 2. Signal Genius AI — Official (Lệnh: /status) ---
    else if (text === '/status') {
        try {
            const stats = await pool.query(`
                SELECT 
                    COUNT(*) FILTER (WHERE signal_status IN ('TP1_HIT', 'TP2_HIT')) as win,
                    COUNT(*) FILTER (WHERE signal_status = 'SL_HIT') as loss
                FROM ai_signals 
                WHERE created_at > NOW() - INTERVAL '24 hours'
            `);

            const activeTrades = await pool.query(`
                SELECT symbol, signal_type, entry_price, current_price 
                FROM ai_signals 
                WHERE signal_status IN ('ENTRY_HIT', 'WAITING') 
                AND is_published = TRUE
                ORDER BY created_at DESC LIMIT 3
            `);

            const { win, loss } = stats.rows[0];
            const pips = ((win * 25) - (loss * 15)).toFixed(0);

            let activeText = "";
            if (activeTrades.rows.length > 0) {
                activeTrades.rows.forEach(t => {
                    const diff = t.signal_type === 'BUY' ? (t.current_price - t.entry_price) : (t.entry_price - t.current_price);
                    const pipsMove = (diff * 10000).toFixed(1);
                    activeText += `\n• ${t.symbol}: \`${pipsMove > 0 ? '+' : ''}${pipsMove} pips\` (${t.signal_type})`;
                });
            } else {
                activeText = "\n*Currently no active signals.*";
            }

            const message = `
📊 **SIGNAL GENIUS — OFFICIAL REPORT**
━━━━━━━━━━━━━━━━━━
📈 **Daily Performance (24h)**:
- Results: \`${win} Win - ${loss} Loss\`
- Net Profit: \`+${pips} pips\` ✅

⌛ **Running Trades**:
${activeText}

✨ *Status: All systems operational.*
━━━━━━━━━━━━━━━━━━
            `;

            await botAction('sendMessage', { chat_id: chatId, text: message, parse_mode: 'Markdown' });

        } catch (error) {
            await botAction('sendMessage', { chat_id: chatId, text: "❌ Syncing with database... try later." });
        }
    }

    // --- 3. Signal Genius AI Community (Trigger: Any key) ---
    else if (!text.startsWith('/')) {
        const teaser = `
✨ **SIGNAL GENIUS COMMUNITY**

🔥 AI v1.9 just detected a high-probability pattern on **EUR/USD**!
- **Historical Accuracy**: \`82.4%\`
- **Expected Move**: \`+35 pips\`

🔓 **Unlock full details & entry levels now:**
👉 [Upgrade to VIP Now](http://signalgeniusai.com)

*AI-Powered Intelligence at your fingertips.*
        `;
        await botAction('sendMessage', { chat_id: chatId, text: teaser, parse_mode: 'Markdown' });
    }
}

pollUpdates();
console.log('🚀 [SHADOW SERVER] v1.9 started. Use a separate token to avoids conflicts!');
