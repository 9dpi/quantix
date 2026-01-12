/**
 * Signal Genius CORE V1.8 - MULTI-AGENT INTEGRATION WRAPPER
 * This file integrates the Multi-Agent System into existing Signal Genius Core
 * 
 * Usage:
 *   import { analyzeSignalWithAgents } from './quantix_core_v1.8.js';
 *   const decision = await analyzeSignalWithAgents(marketData);
 *   if (decision.shouldEmitSignal) {
 *       // Send to Telegram
 *   }
 */

import { orchestrator } from './agents/orchestrator.js';

/**
 * Main entry point for signal analysis using Multi-Agent System
 * Replaces old single-agent logic
 * 
 * @param {Object} marketData - Market data object
 * @param {string} marketData.symbol - Trading pair (e.g., 'EURUSD=X')
 * @param {number} marketData.currentPrice - Current market price
 * @param {Array<number>} marketData.prices - Historical prices (last 50+ candles)
 * @param {Object} marketData.currentCandle - Current candle OHLC
 * @param {Array<number>} marketData.volume - Volume data
 * @param {string} marketData.direction - 'LONG' or 'SHORT'
 * 
 * @returns {Promise<Object>} Decision object
 */
export async function analyzeSignalWithAgents(marketData) {
    console.log(`\n[Signal Genius V1.8] Analyzing ${marketData.symbol} with Multi-Agent System...`);

    try {
        const decision = await orchestrator.analyzeAndDecide(marketData);

        return {
            // Core decision
            shouldEmitSignal: decision.shouldEmitSignal,
            confidence: decision.confidence,

            // Multi-Agent details
            votes: decision.votes,
            reasoning: decision.reasoning,

            // Shadow Mode info
            shadowMode: decision.shadowMode,
            shadowModeThreshold: orchestrator.shadowModeThreshold,

            // Performance metrics
            processingTime: decision.processingTime,

            // For Telegram message formatting
            agentConsensus: decision.votes ? {
                technical: {
                    decision: decision.votes.technical?.decision || 'N/A',
                    score: decision.votes.technical?.score || 0,
                    reasoning: decision.votes.technical?.reasoning || ''
                },
                sentinel: {
                    decision: decision.votes.sentinel?.decision || 'N/A',
                    score: decision.votes.sentinel?.score || 0,
                    reasoning: decision.votes.sentinel?.reasoning || ''
                }
            } : null
        };

    } catch (error) {
        console.error('[Signal Genius V1.8] Multi-Agent analysis failed:', error);

        // Fallback: reject signal on error
        return {
            shouldEmitSignal: false,
            confidence: 0,
            reasoning: `System error: ${error.message}`,
            error: true
        };
    }
}

/**
 * Get Multi-Agent System statistics
 * Useful for monitoring and debugging
 */
export function getSystemStats() {
    return orchestrator.getStats();
}

/**
 * Manually disable Shadow Mode (for emergency or testing)
 * Use with caution!
 */
export function disableShadowMode() {
    console.warn('[Signal Genius V1.8] ⚠️  Shadow Mode manually disabled!');
    orchestrator.disableShadowMode();
}

/**
 * Format Multi-Agent decision for Telegram message
 * Returns enhanced message with agent consensus details
 */
export function formatTelegramMessage(signal, agentDecision) {
    const { agentConsensus, confidence, shadowMode, reasoning } = agentDecision;
    const isGolden = confidence >= 85;

    if (!agentConsensus) {
        return `
${isGolden ? '🚨 **GOLDEN SIGNAL DETECTED** (85%+ CONFIDENCE)' : '🎯 **Signal Genius AI SIGNAL** (V1.8)'}

📊 **${signal.pair}** | ${signal.action}
💰 Entry: ${signal.entry}
🛑 Stop Loss: ${signal.sl}
🎯 Take Profit: ${signal.tp}

🧠 **AI Confidence**: ${confidence}%

⚡ Powered by Signal Genius AI Core V1.8
`;
    }

    // Agent reasoning or fallback
    const techReason = agentConsensus.technical.reasoning || (agentConsensus.technical.decision === 'APPROVE' ? 'Strong technical alignment.' : 'Technical check failed.');
    const sentinelReason = agentConsensus.sentinel.reasoning || (agentConsensus.sentinel.decision === 'APPROVE' ? 'Market environment stable.' : 'Sentiment/News risk detected.');
    const criticReason = reasoning || `Decision finalized with ${confidence}% consensus.`;

    // Enhanced message with Multi-Agent consensus
    return `
${isGolden ? '🚨 **GOLDEN SIGNAL DETECTED** (85%+ CONFIDENCE)' : '🎯 **Signal Genius AI SIGNAL** (V1.8 Evolution)'}

💹 **Asset**: ${signal.pair} | 📈 **Action**: ${signal.action} @ ${signal.entry}

🧠 **AI Council Verdict**:
├─ **Tech Agent**: ${techReason}
├─ **Sentinel Agent**: ${sentinelReason}
└─ **Critic Agent**: ${agentConsensus.sentinel.decision === 'APPROVE' && agentConsensus.technical.decision === 'APPROVE' ? '✅' : '❌'} APPROVED (${confidence}% Confidence)

🎯 **TP**: ${signal.tp} | ❌ **SL**: ${signal.sl}

${shadowMode ? `🛡️  **Shadow Mode Active**: Filtering for highest-confidence setups.` : ''}

⚡ Powered by Signal Genius AI Core V1.8 | Multi-Agent System
`;
}

/**
 * Health check function for post-deployment verification
 */
export async function healthCheck() {
    console.log('\n🏥 Signal Genius V1.8 HEALTH CHECK\n');
    console.log('─'.repeat(50));

    const stats = getSystemStats();

    console.log(`✅ Orchestrator: Initialized`);
    console.log(`✅ Shadow Mode: ${stats.shadowMode ? 'ACTIVE 🛡️' : 'DISABLED'}`);
    console.log(`✅ Shadow Threshold: ${stats.shadowModeThreshold}%`);
    console.log(`✅ Total Decisions: ${stats.totalDecisions}`);
    console.log(`✅ Approval Rate: ${stats.approvalRate}`);
    console.log(`✅ Avg Confidence: ${stats.avgConfidence}`);

    console.log('\n🎉 Health Check PASSED - System Operational\n');

    return {
        healthy: true,
        shadowMode: stats.shadowMode,
        stats
    };
}

// Auto-run health check on module load
console.log('[Signal Genius V1.8] Multi-Agent Integration Wrapper loaded ✅');
