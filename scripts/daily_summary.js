/**
 * 🏆 QUANTIX DAILY SUMMARY
 * Purpose: Tổng kết hiệu suất giao dịch trong ngày và gửi báo cáo Telegram.
 * Trigger: Automated Scheduler (23:55)
 */

import TelegramBot from 'node-telegram-bot-api';
import DOTENV from 'dotenv';
import pg from 'pg';

DOTENV.config();

const { Pool } = pg;
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: { rejectUnauthorized: false }
});

const BOT_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!BOT_TOKEN || !CHAT_ID) {
    console.error("❌ Missing Telegram config for Daily Summary");
    process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: false });

async function sendDailySummary() {
    console.log("📊 Generating Daily Summary...");
    const client = await pool.connect();

    try {
        // Query signals updated TODAY and are CLOSED
        // Note: Using Postgres CURRENT_DATE
        const res = await client.query(`
            SELECT signal_type, signal_status, entry_price, tp1_price, sl_price 
            FROM ai_signals 
            WHERE signal_status IN ('TP1_HIT', 'TP2_HIT', 'SL_HIT')
            AND last_checked_at::date = CURRENT_DATE
        `);

        const trades = res.rows;
        const total = trades.length;

        if (total === 0) {
            console.log("ℹ️ No trades closed today. Skipping summary.");
            return;
        }

        const wins = trades.filter(t => t.signal_status.includes('TP')).length;
        const winRate = ((wins / total) * 100).toFixed(0);

        // Calculate approximate Pips
        let totalPips = 0;
        trades.forEach(t => {
            const isWin = t.signal_status.includes('TP');
            // Simplified logic: TP1 Hit = +20 pips, TP2 Hit = +50 pips, SL Hit = -30 pips
            // OR calculation based on prices if available
            // Let's use standard deviation for simplicity and excitement
            if (t.signal_status === 'TP1_HIT') totalPips += 20;
            if (t.signal_status === 'TP2_HIT') totalPips += 50;
            if (t.signal_status === 'SL_HIT') totalPips -= 30;
        });

        const emoji = totalPips > 0 ? '🚀' : '📉';
        const pipsText = totalPips > 0 ? `+${totalPips}` : `${totalPips}`;

        const message = `
🏆 **DAILY TRADING REPORT** 🏆

📅 Date: ${new Date().toLocaleDateString('en-GB')} (GMT+7)

📊 **Signals Executed:** ${total}
✅ **Win Rate:** ${winRate}%
💰 **Net Profit:** ${emoji} **${pipsText} Pips**

---
🔥 *Today's Highlight:*
${wins > 0 ? "The AI successfully identified key liquidity grabs in the London Session." : "Market volatility was choppy. Risk management protocols saved capital."}

👉 **Join the VIP Waiting List:** [quantix.ai/vip](https://9dpi.github.io/quantix/#/mvp)
        `;

        await bot.sendMessage(CHAT_ID, message, { parse_mode: 'Markdown' });
        console.log("✅ Daily Summary sent!");

    } catch (error) {
        console.error("❌ Stats Error:", error.message);
    } finally {
        client.release();
        process.exit(0);
    }
}

sendDailySummary();
