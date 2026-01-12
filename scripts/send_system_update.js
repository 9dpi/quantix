import { sendSystemMessage } from '../backend/bot.js';
import dotenv from 'dotenv';
dotenv.config();

async function sendUpdateMessage() {
    console.log("📤 Sending System Update to Telegram...");
    const message = `
⚡ **[SYSTEM UPDATE] SIGNAL GENIUS AI V1.8**

The system has been fully upgraded to Institutional Standard. Here is what’s new:

1. ⏱️ **5s Precision Sync**: The data pipeline is now strictly synchronized at 5-second intervals. You can verify the "Live Heartbeat" by checking the Last Update timestamp on your dashboard.

2. 🎯 **The 85% Gold Rule**: To protect your capital, the Bot will only push signals when the AI Score Card ≥ 85%. If it's quiet, it means the AI Council is rejecting low-probability setups to keep your win rate high.

3. ⚡ **Instant Pulse (On-Demand)**: Need an update right now? Just send any character (e.g., "1", "hi", or even a ".") to this bot. I will instantly reply with the latest Market Pulse & System Status.

🛡️ Powered by **Quantix Core AI V1.8**
Status: All Systems Nominal. 
Hunting Mode: **Active**.
    `;

    const success = await sendSystemMessage(message);
    if (success) {
        console.log("✅ Update message broadcasted successfully.");
    } else {
        console.log("❌ Failed to send update message.");
    }
    process.exit();
}

sendUpdateMessage();
