import { healthCheck } from '../backend/quantix_core_v1.8.js';
import { sendSystemMessage } from '../backend/bot.js';
import dotenv from 'dotenv';
dotenv.config();

async function runVerification() {
    console.log('🚀 Starting Quantix V1.8 Verification...');

    try {
        // 1. Run Health Check
        const status = await healthCheck();

        if (status.healthy) {
            console.log('✅ System is HEALTHY.');
            console.log(`🛡️ Shadow Mode: ${status.shadowMode ? 'ACTIVE' : 'OFF'}`);

            // 2. Prepare the Message
            const welcomeMsg = `
🛡️ **SYSTEM UPGRADE: QUANTIX v1.8 "IRON HAND" IS LIVE**

• **Multi-Agent Council**: Tech, Sentinel, and Critic Agents activated.
• **Shadow Mode**: ON (Threshold: 85% Confidence).
• **Status**: High-precision hunting mode engaged.

Only "Golden Signals" will be broadcasted today to safeguard capital.

👉 [Open Live Dashboard](https://9dpi.github.io/quantix/dashboard)
            `;

            console.log('📤 Sending Telegram Notification...');
            const sent = await sendSystemMessage(welcomeMsg);

            if (sent) {
                console.log('✨ Telegram notification sent successfully!');
            } else {
                console.log('❌ Failed to send Telegram notification.');
            }
        } else {
            console.log('❌ System Health Check FAILED.');
        }
    } catch (error) {
        console.error('💥 Verification process crashed:', error);
    }
}

runVerification();
