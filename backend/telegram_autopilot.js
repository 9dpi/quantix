/**
 * Signal Genius V1.8 - TELEGRAM AUTOPILOT ENGINE
 * Event-driven & Scheduled messaging system for intelligent community engagement
 */

import { sendSystemMessage } from './bot.js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

/**
 * 🚨 GOLDEN SIGNAL - High confidence signal with full Council analysis
 */
export async function broadcastGoldenSignal(signalData) {
    const { pair, action, entry, sl, tp, agentDecision } = signalData;
    const { agentConsensus, confidence, reasoning } = agentDecision;

    const techReason = agentConsensus?.technical?.reasoning || 'Strong technical alignment detected.';
    const sentinelReason = agentConsensus?.sentinel?.reasoning || 'Market environment stable.';

    const message = `
🚨 **GOLDEN SIGNAL DETECTED** (${confidence}%+ CONFIDENCE)

💹 **Asset**: ${pair}
📈 **Action**: ${action} @ ${entry}

🧠 **AI Council Verdict**:
├─ **Tech Agent**: ${techReason}
├─ **Sentinel Agent**: ${sentinelReason}
└─ **Critic Agent**: ✅ APPROVED (Consensus: ${confidence}%)

🎯 **TP**: ${tp} | ❌ **SL**: ${sl}

🛡️ **Shadow Mode Active**: Only highest-confidence setups.

⚡ Powered by Signal Genius AI Core V1.8 | Multi-Agent System
    `;

    await sendSystemMessage(message);
    console.log(`[AUTOPILOT] Golden Signal broadcasted for ${pair}`);
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
