import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
dotenv.config();

const token = process.env.TELEGRAM_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

async function testTelegram() {
    console.log("🧪 Testing Telegram connectivity...");
    console.log(`   Token: ${token ? '✅ Present' : '❌ Missing'}`);
    console.log(`   Chat ID: ${chatId ? '✅ Present' : '❌ Missing'}`);

    if (!token || !chatId) {
        console.error("❌ ERROR: TELEGRAM_TOKEN or TELEGRAM_CHAT_ID is missing in .env");
        return;
    }

    try {
        const bot = new TelegramBot(token, { polling: false });
        const res = await bot.sendMessage(chatId, "🔔 *Quantix AI Connectivity Test*\nThis is a manual test message from the development environment.", { parse_mode: 'Markdown' });
        console.log("✅ SUCCESS: Telegram message sent!");
        console.log("   Message ID:", res.message_id);
    } catch (error) {
        console.error("❌ FAIL: Telegram error:", error.message);
        if (error.message.includes('401')) console.log("   💡 Suggestion: The BOT TOKEN might be invalid.");
        if (error.message.includes('400')) console.log("   💡 Suggestion: The CHAT ID might be invalid.");
    }
}

testTelegram();
