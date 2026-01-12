import cron from 'node-cron';
import dotenv from 'dotenv';
import { broadcastMarketPulse, broadcastGuardianReport, broadcastDailyRecap } from './telegram_autopilot.js';

dotenv.config();

console.log('[SCHEDULER] Initializing Telegram Autopilot Scheduler...');

/**
 * 🌅 Market Pulse - Every day at 08:30 (Vietnam Time)
 */
cron.schedule('30 8 * * *', async () => {
    console.log('[SCHEDULER] Triggering Market Pulse...');
    await broadcastMarketPulse();
}, {
    timezone: 'Asia/Ho_Chi_Minh'
});

/**
 * 🛡️ Guardian Report - Every 3 hours (if system is silent)
 */
cron.schedule('0 */3 * * *', async () => {
    console.log('[SCHEDULER] Triggering Guardian Report...');
    await broadcastGuardianReport();
}, {
    timezone: 'Asia/Ho_Chi_Minh'
});

/**
 * 🌙 Daily Recap - Every day at 23:00 (Vietnam Time)
 */
cron.schedule('0 23 * * *', async () => {
    console.log('[SCHEDULER] Triggering Daily Recap...');
    await broadcastDailyRecap();
}, {
    timezone: 'Asia/Ho_Chi_Minh'
});

console.log('[SCHEDULER] ✅ All scheduled tasks registered:');
console.log('  - Market Pulse: 08:30 daily');
console.log('  - Guardian Report: Every 3 hours');
console.log('  - Daily Recap: 23:00 daily');
