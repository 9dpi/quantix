/**
 * 📢 BROADCAST MARKET PULSE
 * Purpose: Gửi nhận định thị trường định kỳ vào group Telegram
 * Trigger: Scheduler (mỗi 4 giờ)
 */

import TelegramBot from 'node-telegram-bot-api';
import { askQuantix } from '../backend/ai_processor.js'; // Import logic AI core
import dotenv from 'dotenv';

dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!BOT_TOKEN || !CHAT_ID) {
    console.error("❌ Missing TELEGRAM_TOKEN or TELEGRAM_CHAT_ID");
    process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: false });

async function broadcast() {
    console.log("📡 Generating Market Pulse...");

    try {
        // Hỏi AI một câu tổng hợp để tạo content hấp dẫn cho cộng đồng
        const prompt = "Analyze the current EUR/USD market trend based on the latest data. Give a short, engaging summary for my Telegram community of traders. Mention key levels and current sentiment. Keep it under 200 words. Use emojis.";

        const aiResponse = await askQuantix(prompt);

        const message = `
🔔 **QUANTIX MARKET PULSE**

${aiResponse}

_Next update in 4 hours_ ⏳
        `;

        await bot.sendMessage(CHAT_ID, message, { parse_mode: 'Markdown' });
        console.log("✅ Market Pulse sent to Telegram!");

    } catch (error) {
        console.error("❌ Broadcast Error:", error.message);
    } finally {
        process.exit(0);
    }
}

broadcast();
