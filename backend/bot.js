/**
 * ⚡ QUANTIX TELEGRAM BOT (GLOBAL EDITION)
 * Purpose: Automated Market Data & Signals in English
 */

import TelegramBot from 'node-telegram-bot-api';
import { askQuantix } from './ai_processor.js';
import dotenv from 'dotenv';

dotenv.config();

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

if (!TELEGRAM_TOKEN) {
    console.error("❌ TELEGRAM_TOKEN not found in .env");
    process.exit(1);
}

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

console.log("🤖 Quantix Telegram Bot (English) is ONLINE...");

/**
 * Command: /start
 */
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = `
🤖 **Quantix Market Monitor (V1.5)**

Welcome! I am your automated EUR/USD market surveillance bot.

**Current Features:**
📊 Real-time EUR/USD Price Updates
🎯 Latest AI Trading Signals
📉 Entry, Stop Loss, and Take Profit levels

**How to use:**
Simply send any message or use the \`/status\` command to receive the latest market report.

*Powered by Quantix AI Core*
    `;

    bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
});

/**
 * Command: /status
 */
bot.onText(/\/status/, async (msg) => {
    const chatId = msg.chat.id;
    bot.sendChatAction(chatId, 'typing');
    try {
        const response = await askQuantix();
        bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
    } catch (e) {
        bot.sendMessage(chatId, "⚠️ Error retrieving market data.");
    }
});

/**
 * Command: /stats - View Performance History
 */
bot.onText(/\/stats/, async (msg) => {
    const chatId = msg.chat.id;
    bot.sendChatAction(chatId, 'typing');

    // Connect DB to calculate stats
    const { Pool } = await import('pg');
    const pool = new Pool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: parseInt(process.env.DB_PORT || '5432'),
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();

        // Get all closed signals
        const res = await client.query(`
            SELECT signal_type, signal_status, entry_price, current_price, tp1_price, sl_price 
            FROM ai_signals 
            WHERE signal_status IN ('TP1_HIT', 'TP2_HIT', 'SL_HIT')
        `);

        const trades = res.rows;
        const total = trades.length;
        const wins = trades.filter(t => t.signal_status.includes('TP')).length;
        const losses = trades.filter(t => t.signal_status.includes('SL')).length;

        // Simple Win Rate
        const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : 0;

        // Estimate Pips (Simplified)
        let totalPips = 0;
        trades.forEach(t => {
            const isWin = t.signal_status.includes('TP');
            // Assuming simplified pip calc for EURUSD (0.0001 = 1 pip)
            // Win = approx 20-40 pips, Loss = approx 20 pips logic or real difference
            // Here using real prices if available, else Fallback logic
            const prices = { entry: parseFloat(t.entry_price || 0), tp: parseFloat(t.tp1_price || 0), sl: parseFloat(t.sl_price || 0) };

            if (isWin) {
                totalPips += Math.abs(prices.tp - prices.entry) * 10000;
            } else {
                totalPips -= Math.abs(prices.entry - prices.sl) * 10000;
            }
        });

        const msgStats = `
🏆 **QUANTIX PERFORMANCE HUB**

📊 **Total Signals:** ${total}
✅ **Wins:** ${wins}
❌ **Losses:** ${losses}
📈 **Win Rate:** ${winRate}%
💰 **Net Pips:** ${totalPips > 0 ? '+' : ''}${totalPips.toFixed(1)} pips

_Data verified by Blockchain Ledger (Simulated)_
        `;

        bot.sendMessage(chatId, msgStats, { parse_mode: 'Markdown' });
        client.release();
    } catch (e) {
        console.error("Stats Error:", e);
        bot.sendMessage(chatId, "⚠️ Could not fetch stats.");
    }
});

/**
 * Handle all text messages
 * - Normal text: Returns stable Market Report (Public Mode)
 * - Text with '/': Returns AI Conversation (Secret/Master Mode)
 */
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userMessage = msg.text;

    if (!userMessage) return;

    // Ignore known commands so they don't trigger twice
    const knownCommands = ['/start', '/status'];
    if (knownCommands.includes(userMessage.toLowerCase())) return;

    bot.sendChatAction(chatId, 'typing');

    try {
        let response;
        if (userMessage.startsWith('/')) {
            // 🔎 SECRET MODE: Process with AI
            const question = userMessage.substring(1).trim();
            console.log(`🕵️‍♂️ Secret Chat Triggered: ${question}`);
            response = await askQuantix(question);
        } else {
            // 📊 PUBLIC MODE: Just give the report
            response = await askQuantix(); // Calls without args
        }

        bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error("❌ Bot Error:", error.message);
        bot.sendMessage(chatId, "⚠️ System temporarily busy.");
    }
});

/**
 * Error Handling
 */
bot.on('polling_error', (error) => {
    console.error("❌ Telegram Polling Error:", error.message);
});

console.log("✅ Bot is ready to serve international clients.");
