/**
 * QUANTIX CORE V1.8 - MULTI-AGENT ORCHESTRATOR
 * Replaces old single-agent logic with Multi-Agent Consensus System
 * Shadow Mode: Only emit signals with Consensus >= 85% (first 24h)
 */

import { technicalAgent } from './tech_agent.js';
import { sentinelAgent } from './sentinel_agent.js';
import { criticAgent } from './critic_agent.js';
import { agentBus, CHANNELS } from './bus.js';
import { sendSystemMessage } from '../bot.js';

class MultiAgentOrchestrator {
    constructor() {
        this.name = 'ORCHESTRATOR';
        this.shadowMode = true; // Enable shadow mode for first 24h
        this.shadowModeThreshold = 85; // Only emit signals >= 85% confidence
        this.shadowModeStartTime = new Date();
        this.signalHistory = [];
        this.rejectedCounter = 0;
        this.lastSignalTime = Date.now();

        this._initializeListeners();
        this._scheduleShadowModeDisable();
        this._startGuardianReportScheduler();
    }

    /**
     * Main entry point: Analyze market data and decide if signal should be emitted
     */
    async analyzeAndDecide(marketData) {
        const startTime = Date.now();
        console.log(`\n${'='.repeat(60)}`);
        console.log(`[${this.name}] 🧠 MULTI-AGENT ANALYSIS INITIATED`);
        console.log(`${'='.repeat(60)}`);

        try {
            // Step 1: Run Technical and Sentinel agents in parallel
            console.log(`[${this.name}] Running parallel analysis...`);

            const [techResult, sentinelResult] = await Promise.all([
                technicalAgent.analyze(marketData),
                sentinelAgent.analyze(marketData)
            ]);

            // Step 2: Critic makes final consensus decision
            console.log(`[${this.name}] Requesting consensus from Critic Agent...`);
            const consensusResult = await criticAgent.decide([techResult, sentinelResult]);

            // Step 3: Apply Shadow Mode filter if enabled
            const finalDecision = this._applyShadowModeFilter(consensusResult);

            // Step 4: Log decision
            this._logDecision(finalDecision, Date.now() - startTime);

            // Step 5: Return result
            return {
                shouldEmitSignal: finalDecision.decision === 'APPROVE' && finalDecision.passedShadowMode,
                confidence: finalDecision.compositeConfidence || 0,
                reasoning: finalDecision.reasoning,
                votes: finalDecision.votes,
                shadowMode: this.shadowMode,
                processingTime: Date.now() - startTime
            };

        } catch (error) {
            console.error(`[${this.name}] ❌ Analysis failed:`, error);
            return {
                shouldEmitSignal: false,
                confidence: 0,
                reasoning: `System error: ${error.message}`,
                error: true
            };
        }
    }

    /**
     * Apply Shadow Mode filter (first 24h: only emit if confidence >= 85%)
     */
    _applyShadowModeFilter(consensusResult) {
        if (!this.shadowMode) {
            return { ...consensusResult, passedShadowMode: true };
        }

        const confidence = consensusResult.compositeConfidence || 0;
        const passedShadowMode = confidence >= this.shadowModeThreshold;

        if (consensusResult.decision === 'APPROVE' && !passedShadowMode) {
            console.log(`\n🛡️  [SHADOW MODE] Signal confidence ${confidence}% < ${this.shadowModeThreshold}%`);
            console.log(`   ⚠️  Signal SUPPRESSED for safety (Shadow Mode active)`);

            return {
                ...consensusResult,
                decision: 'REJECT',
                passedShadowMode: false,
                reason: 'SHADOW_MODE_FILTER',
                reasoning: `Shadow Mode: Confidence ${confidence}% below ${this.shadowModeThreshold}% threshold`
            };
        }

        if (passedShadowMode) {
            console.log(`\n✅ [SHADOW MODE] Signal confidence ${confidence}% >= ${this.shadowModeThreshold}%`);
            console.log(`   🚀 Signal APPROVED for emission`);
        }

        return { ...consensusResult, passedShadowMode };
    }

    /**
     * Log decision to history
     */
    _logDecision(decision, processingTime) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            decision: decision.decision,
            confidence: decision.confidence || 0,
            passedShadowMode: decision.passedShadowMode,
            reasoning: decision.reasoning,
            processingTime: `${processingTime}ms`
        };

        this.signalHistory.push(logEntry);

        if (decision.decision === 'REJECT') {
            this.rejectedCounter++;
        } else if (decision.passedShadowMode) {
            this.lastSignalTime = Date.now();
            this.rejectedCounter = 0; // Reset after a successful signal
        }

        console.log(`\n${'='.repeat(60)}`);
        console.log(`[${this.name}] 📊 FINAL DECISION: ${decision.decision}`);
        console.log(`   Confidence: ${decision.compositeConfidence || 0}%`);
        console.log(`   Shadow Mode: ${this.shadowMode ? 'ACTIVE' : 'DISABLED'}`);
        console.log(`   Emit Signal: ${decision.passedShadowMode ? 'YES ✅' : 'NO ❌'}`);
        console.log(`   Processing Time: ${processingTime}ms`);
        console.log(`${'='.repeat(60)}\n`);
    }

    /**
     * Disable Shadow Mode after 24 hours
     */
    _scheduleShadowModeDisable() {
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

        setTimeout(() => {
            this.shadowMode = false;
            console.log(`\n${'🎉'.repeat(20)}`);
            console.log(`[${this.name}] 🎉 SHADOW MODE DISABLED!`);
            console.log(`   Multi-Agent System now running at full capacity`);
            console.log(`   Confidence threshold: 70% (standard mode)`);
            console.log(`${'🎉'.repeat(20)}\n`);
        }, TWENTY_FOUR_HOURS);

        console.log(`\n🛡️  [${this.name}] Shadow Mode ACTIVE for next 24 hours`);
        console.log(`   Only signals with confidence >= ${this.shadowModeThreshold}% will be emitted`);
        console.log(`   Shadow Mode will auto-disable at: ${new Date(Date.now() + TWENTY_FOUR_HOURS).toLocaleString()}\n`);
    }

    /**
     * Manually disable Shadow Mode (for testing or emergency)
     */
    disableShadowMode() {
        this.shadowMode = false;
        console.log(`[${this.name}] Shadow Mode manually disabled`);
    }

    /**
     * Get orchestrator statistics
     */
    getStats() {
        const totalDecisions = this.signalHistory.length;
        const approvedSignals = this.signalHistory.filter(d => d.decision === 'APPROVE' && d.passedShadowMode).length;
        const rejectedSignals = totalDecisions - approvedSignals;
        const avgConfidence = totalDecisions > 0
            ? this.signalHistory.reduce((sum, d) => sum + d.confidence, 0) / totalDecisions
            : 0;

        return {
            shadowMode: this.shadowMode,
            shadowModeThreshold: this.shadowModeThreshold,
            shadowModeStartTime: this.shadowModeStartTime,
            totalDecisions,
            approvedSignals,
            rejectedSignals,
            approvalRate: totalDecisions > 0 ? (approvedSignals / totalDecisions * 100).toFixed(1) + '%' : '0%',
            avgConfidence: avgConfidence.toFixed(1) + '%',
            recentDecisions: this.signalHistory.slice(-10)
        };
    }

    /**
     * Initialize event listeners
     */
    _initializeListeners() {
        // Listen for approved signals
        agentBus.subscribe(CHANNELS.SIGNAL_APPROVED, (message) => {
            console.log(`[${this.name}] ✅ Received APPROVED signal from Critic`);
        });

        // Listen for rejected signals
        agentBus.subscribe(CHANNELS.SIGNAL_REJECTED, (message) => {
            console.log(`[${this.name}] ❌ Received REJECTED signal from Critic`);
        });
    }

    /**
     * Send Welcome Message on startup
     */
    async _sendWelcomeMessage() {
        const msg = `
🛡️ **SYSTEM UPGRADE: QUANTIX v1.8 "IRON HAND" IS LIVE**

• **Multi-Agent Council**: Tech, Sentinel, and Critic Agents activated.
• **Shadow Mode**: ON (Threshold: ${this.shadowModeThreshold}% Confidence).
• **Status**: High-precision hunting mode engaged.

Only "Golden Signals" will be broadcasted today to safeguard capital.

👉 [Open Live Dashboard](${process.env.VITE_APP_URL || 'https://quantix.ai'})
        `;
        await sendSystemMessage(msg);
    }

    /**
     * Start the Guardian Report scheduler (check every 3 hours)
     */
    _startGuardianReportScheduler() {
        setInterval(async () => {
            const idleTimeSeconds = (Date.now() - this.lastSignalTime) / 1000;

            // If no signal for 3 hours AND we have rejected signals
            if (idleTimeSeconds >= 3 * 60 * 60 && this.rejectedCounter > 0) {
                const msg = `
🛡️ **QUANTIX GUARDIAN REPORT**

Market is currently showing "Low Quality" setups. Iron Hand has rejected **${this.rejectedCounter}** signals in the last 3 hours to protect your balance.

Our goal today: **Quality over Quantity**. Staying patient for the ${this.shadowModeThreshold}%+ setup.

| 🟢 System Health: 100% | 🛡️ Shadow Mode: ${this.shadowMode ? 'ACTIVE' : 'OFF'}
                `;
                await sendSystemMessage(msg);
                this.rejectedCounter = 0; // Reset after report
            }
        }, 3 * 60 * 60 * 1000); // 3 hours
    }
}

// Export singleton instance
export const orchestrator = new MultiAgentOrchestrator();

console.log('[ORCHESTRATOR] Multi-Agent Orchestrator initialized ✅');
console.log(`[ORCHESTRATOR] Shadow Mode: ${orchestrator.shadowMode ? 'ACTIVE 🛡️' : 'DISABLED'}`);
