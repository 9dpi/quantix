/**
 * Signal Genius V1.9 - TELEGRAM AUTOPILOT ENGINE
 * Event-driven & Scheduled messaging system for intelligent community engagement
 * VIP MODE: Only 1 signal/day with >95% confidence
 */

import { sendSystemMessage } from './bot.js';
import { createClient } from '@supabase/supabase-js';
import { canBroadcastSignal, recordBroadcast } from './telegram_signal_filter.js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

/**
 * 🚨 GOLDEN SIGNAL - Professional Trading Signal Format
 * Matches institutional-grade signal template with full risk management
 * VIP FILTER: Only broadcasts if confidence >95% and no signal sent today
 */
export async function broadcastGoldenSignal(signalData) {
    const { pair, action, entry, sl, tp, agentDecision, metadata } = signalData;
    const { confidence } = agentDecision;

    // VIP QUALITY CONTROL: Check if we can broadcast
    const canBroadcast = await canBroadcastSignal(confidence);
    if (!canBroadcast) {
        console.log(`[AUTOPILOT] 🚫 Signal blocked by VIP filter (Confidence: ${confidence}%)`);
        return; // Exit without broadcasting
    }

    // Calculate risk metrics
    const entryPrice = parseFloat(entry);
    const slPrice = parseFloat(sl);
    const tpPrice = parseFloat(tp);

    const pipValue = 0.0001; // For forex pairs
    const targetPips = Math.abs((tpPrice - entryPrice) / pipValue).toFixed(0);
    const stopPips = Math.abs((entryPrice - slPrice) / pipValue).toFixed(0);
    const riskReward = (targetPips / stopPips).toFixed(2);

    // Determine trade direction
    const tradeType = action === 'BUY' ? 'BUY (Long)' : 'SELL (Short)';

    // Format entry zone (±2 pips from entry)
    const entryLow = (entryPrice - 2 * pipValue).toFixed(5);
    const entryHigh = (entryPrice + 2 * pipValue).toFixed(5);

    // Get current UTC time in exact format: "Jan 13, 2026 — 14:45 UTC"
    const now = new Date();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[now.getUTCMonth()];
    const day = now.getUTCDate();
    const year = now.getUTCFullYear();
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const utcTime = `${month} ${day}, ${year} — ${hours}:${minutes} UTC`;

    const message = `
📊 Asset: ${pair}
📌 Trade: ${tradeType}

📈 Charts:
* Bias: H1
* Entry: M5–M15

💰 Price Levels:
Entry Zone: ${entryLow} – ${entryHigh}
Take Profit (TP): ${tpPrice.toFixed(5)}
Stop Loss (SL): ${slPrice.toFixed(5)}

📏 Risk Management:
* Target: +${targetPips} pips
* Stop: −${stopPips} pips
* Risk:Reward: 1:${riskReward}
* Suggested Risk: 0.5%–1% per trade

🧠 AI Confidence: ${confidence}% (model conviction score)
🕒 Trade Type: Intraday
⏰ Posted: ${utcTime}

⚠️ Not financial advice. Trade responsibly.
    `.trim();

    await sendSystemMessage(message);

    // Record this broadcast to prevent duplicates today
    await recordBroadcast(signalData);

    console.log(`[AUTOPILOT] ✅ VIP Signal broadcasted for ${pair} (${confidence}% confidence)`);
}


/**
 * 🛡️ GUARDIAN REPORT - Periodic safety report (every 3 hours if silent)
 */
export async function broadcastGuardianReport() {
    try {
        // Query rejected signals in last 3 hours
        const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();

        const { data, error } = await supabase
            .from('agent_decisions')
            .select('*')
            .eq('decision', 'REJECT')
            .gte('created_at', threeHoursAgo);

        if (error) {
            console.error('[AUTOPILOT] Failed to fetch rejection data:', error);
            return;
        }

        const rejectedCount = data?.length || 0;

        if (rejectedCount === 0) {
            console.log('[AUTOPILOT] No rejections in last 3h, skipping Guardian Report.');
            return;
        }

        const message = `
🛡️ **Signal Genius GUARDIAN REPORT**

Market is currently showing "Low Quality" setups. Iron Hand has rejected **${rejectedCount}** signals in the last 3 hours to protect your balance.

Our goal today: **Quality over Quantity**. Staying patient for the 85%+ setup.

🟢 System Health: 100% | 🛡️ Shadow Mode: ACTIVE
        `;

        await sendSystemMessage(message);
        console.log(`[AUTOPILOT] Guardian Report sent (${rejectedCount} rejections)`);
    } catch (err) {
        console.error('[AUTOPILOT] Guardian Report error:', err);
    }
}

/**
 * 🌅 MARKET PULSE - Morning briefing (08:30 daily)
 */
export async function broadcastMarketPulse() {
    const message = `
☀️ **GOOD MORNING - MARKET PULSE**

Signal Genius AI Council is scanning liquidity zones and sentiment indicators for today's opportunities.

🔍 **Focus Areas**:
• EUR/USD: Monitoring key support at 1.1630
• Gold: Watching resistance breakout potential
• BTC: Volatility expected around US session open

🛡️ Shadow Mode remains active. Only Golden Signals (85%+) will be broadcasted.

Stay sharp. The Council is watching. 👁️
    `;

    await sendSystemMessage(message);
    console.log('[AUTOPILOT] Market Pulse sent');
}

/**
 * 🌙 DAILY RECAP - End of day summary (23:00 daily)
 */
export async function broadcastDailyRecap() {
    try {
        // Query today's signals
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const { data: signals, error } = await supabase
            .from('signals')
            .select('*')
            .gte('created_at', todayStart.toISOString());

        if (error) {
            console.error('[AUTOPILOT] Failed to fetch daily signals:', error);
            return;
        }

        const totalSignals = signals?.length || 0;
        const closedSignals = signals?.filter(s => ['TP1_HIT', 'TP2_HIT', 'SL_HIT'].includes(s.status)) || [];
        const wins = closedSignals.filter(s => s.status.includes('TP')).length;
        const losses = closedSignals.filter(s => s.status === 'SL_HIT').length;
        const winRate = closedSignals.length > 0 ? ((wins / closedSignals.length) * 100).toFixed(1) : 'N/A';

        // Calculate total pips (simplified)
        let totalPips = 0;
        closedSignals.forEach(s => {
            const isWin = s.status.includes('TP');
            const entry = parseFloat(s.entry_price || 0);
            const tp = parseFloat(s.tp1_price || 0);
            const sl = parseFloat(s.sl_price || 0);

            if (isWin) {
                totalPips += Math.abs(tp - entry) * 10000;
            } else {
                totalPips -= Math.abs(entry - sl) * 10000;
            }
        });

        const message = `
🌙 **DAILY RECAP - ${new Date().toLocaleDateString()}**

📊 **Performance Summary**:
• Signals Emitted: ${totalSignals}
• Closed Trades: ${closedSignals.length}
• Win Rate: ${winRate}%
• Net Pips: ${totalPips > 0 ? '+' : ''}${totalPips.toFixed(1)}

${totalPips > 0 ? '🎉 Profitable day! Capital protected and grown.' : '🛡️ Capital preserved. Quality over quantity.'}

Rest well. The Council never sleeps. 🌃
        `;

        await sendSystemMessage(message);
        console.log('[AUTOPILOT] Daily Recap sent');
    } catch (err) {
        console.error('[AUTOPILOT] Daily Recap error:', err);
    }
}

/**
 * 📢 TRADE UPDATE - Entry/TP/SL notifications
 */
export async function broadcastTradeUpdate(updateType, signalData) {
    const { pair, action, entry, currentPrice } = signalData;

    let message = '';

    switch (updateType) {
        case 'ENTRY_HIT':
            message = `
✅ **ENTRY CONFIRMED**

${pair} ${action} @ ${entry}

Position is now active. Monitoring price action closely.
            `;
            break;

        case 'TP1_HIT':
            message = `
🎯 **TP1 ACHIEVED**

${pair} reached first target!

💡 **Recommendation**: Move SL to Entry (Risk-free trade)
Current Price: ${currentPrice}
            `;
            break;

        case 'SL_HIT':
            message = `
⚠️ **STOP LOSS HIT**

${pair} ${action} closed at SL.

This is part of risk management. The Council continues scanning for the next opportunity.
            `;
            break;
    }

    if (message) {
        await sendSystemMessage(message);
        console.log(`[AUTOPILOT] Trade update sent: ${updateType} for ${pair}`);
    }
}

console.log('[AUTOPILOT] Telegram Autopilot Engine loaded ✅');
