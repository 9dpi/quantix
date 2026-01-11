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
 * Handle all text messages (Market Data Query)
 */
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userMessage = msg.text;

    if (!userMessage || userMessage.startsWith('/')) return;

    bot.sendChatAction(chatId, 'typing');

    try {
        const dataResponse = await askQuantix();
        bot.sendMessage(chatId, dataResponse, { parse_mode: 'Markdown' });
    } catch (error) {
        bot.sendMessage(chatId, "⚠️ System busy. Please try again later.");
    }
});

/**
 * Error Handling
 */
bot.on('polling_error', (error) => {
    console.error("❌ Telegram Polling Error:", error.message);
});

console.log("✅ Bot is ready to serve international clients.");
