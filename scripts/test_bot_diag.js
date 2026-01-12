import { sendSystemMessage } from '../backend/bot.js';
import dotenv from 'dotenv';
dotenv.config();

async function testBot() {
    console.log("🤖 Testing Telegram Bot connection...");
    const message = `
🧪 **E2E DIAGNOSTIC: BOT CONNECTIVITY TEST**
Status: ONLINE
Agent: Quantix Diagnostic Engine
Time: ${new Date().toISOString()}

✅ Connection to Telegram API: SUCCESS
✅ Identity: Signal Genius AI Bot
⚡ Powered by Quantix Core AI
    `;

    const success = await sendSystemMessage(message);
    if (success) {
        console.log("✅ Diagnostic message sent to Telegram.");
    } else {
        console.log("❌ Failed to send diagnostic message.");
    }
    process.exit();
}

testBot();
