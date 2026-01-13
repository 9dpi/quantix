/**
 * ⚡ Signal Genius TELEGRAM BOT (LIBRARY MODE)
 * Purpose: Provides messaging utilities to other components without starting polling.
 */

import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const TELEGRAM_TOKEN = process.env.TELEGRAM_DEV_TOKEN || process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Initialize bot without polling to avoid conflicts
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: false });

/**
 * Exported function to send messages to a default channel or admin
 */
export const sendSystemMessage = async (message, options = {}) => {
    if (!TELEGRAM_TOKEN || !CHAT_ID) {
        console.warn("⚠️ TELEGRAM_TOKEN or TELEGRAM_CHAT_ID not found, skipping message.");
        return false;
    }

    try {
        await bot.sendMessage(CHAT_ID, message, { parse_mode: 'Markdown', ...options });
        return true;
    } catch (error) {
        console.error("❌ sendSystemMessage Error:", error.message);
        return false;
    }
};

console.log("📨 Telegram Messaging Library (v1.9) loaded in Sender-Only mode.");
