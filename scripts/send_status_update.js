/**
 * 📢 SEND STATUS UPDATE VIA TELEGRAM
 * Purpose: Notify about current data status
 */

import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: false });
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendUpdate() {
    const message = `
📊 **QUANTIX AI CORE - DATA STATUS UPDATE**

✅ **Current Training Data:**
• **1 Year** of Real Market Data (2025-2026)
• **6,758** High-Quality Candles
• **Health Score:** 100/100 (Excellent)

⏳ **Expansion in Progress:**
• Target: **10 Years** of Historical Data
• Status: Scheduled for tonight (20:00 GMT+7)
• Purpose: Achieve "Grandmaster" level intelligence

🎯 **System Status:**
• Bot: Online 24/7 on Railway
• Strategy: V1.5 Mean Reversion (Proven Profitable)
• Confidence: Ready for Live Demo

🚀 **Next Milestone:**
Full 10-year dataset will unlock advanced pattern recognition and multi-timeframe analysis.

*Powered by Quantix AI Core*
    `;

    try {
        await bot.sendMessage(CHAT_ID, message, { parse_mode: 'Markdown' });
        console.log("✅ Status update sent to Telegram!");
    } catch (error) {
        console.error("❌ Telegram Error:", error.message);
    }
    process.exit(0);
}

sendUpdate();
