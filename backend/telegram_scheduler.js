/**
 * ⚡ Signal Genius MASTER BOT SERVICE
 * Combined Scheduler & Command Handler for Railway Deployment
 */

import cron from 'node-cron';
import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import pg from 'pg';
import { broadcastMarketPulse, broadcastGuardianReport, broadcastDailyRecap } from './telegram_autopilot.js';

dotenv.config();

// --- CONFIGURATION ---
const TOKEN = process.env.TELEGRAM_TOKEN;
if (!TOKEN) {
    console.error("❌ [CRITICAL] No TELEGRAM_TOKEN found!");
    process.exit(1);
}

// Database Connection
const { Pool } = pg;
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: { rejectUnauthorized: false }
});

// Initialize Bot for command handling
const bot = new TelegramBot(TOKEN, { polling: true });

console.log('[MASTER_BOT] Initializing Master Bot Service (Scheduler + Commands)...');

// --- A. SCHEDULER (node-cron) ---

/**
 * 🌅 Market Pulse - Every day at 08:30 (Vietnam Time)
 */
cron.schedule('30 8 * * *', async () => {
    console.log('[SCHEDULER] Triggering Market Pulse...');
    await broadcastMarketPulse();
}, {
    timezone: 'Asia/Ho_Chi_Minh'
});

/**
 * 🛡️ Guardian Report - Every 3 hours
 */
cron.schedule('0 */3 * * *', async () => {
    console.log('[SCHEDULER] Triggering Guardian Report...');
    await broadcastGuardianReport();
}, {
    timezone: 'Asia/Ho_Chi_Minh'
});

/**
 * 🌙 Daily Recap - Every day at 23:00 (Vietnam Time)
 */
cron.schedule('0 23 * * *', async () => {
    console.log('[SCHEDULER] Triggering Daily Recap...');
    await broadcastDailyRecap();
}, {
    timezone: 'Asia/Ho_Chi_Minh'
});

// --- B. COMMAND HANDLER (node-telegram-bot-api) ---

bot.on('message', async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;
    if (!text) return;

    // --- 1. /vip Command ---
    if (text === '/vip') {
        console.log(`[MASTER_BOT] Received /vip command from ${chatId}`);
        try {
            // Fetch latest VIP signal (>95% confidence)
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
                await bot.sendMessage(chatId, "⏳ No VIP signals available yet. Quantix AI Core is scanning for >95% confidence setups.");
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
                reply_markup: {
                    inline_keyboard: [[{ text: '📊 Live Dashboard', url: 'https://9dpi.github.io/ai-forecast-demo/#/mvp' }]]
                }
            };

            await bot.sendMessage(chatId, response, keyboard);

        } catch (e) {
            console.error('[MASTER_BOT] /vip Error:', e);
            await bot.sendMessage(chatId, "❌ Error fetching VIP signal. Please try again.");
        }
    }
});

console.log('[MASTER_BOT] ✅ Master Service Operational:');
console.log('  - Scheduled tasks active (Market Pulse, Guardian, Recap)');
console.log('  - Command /vip active (Fetching from AI Core)');
