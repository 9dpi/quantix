/**
 * QUANTIX CORE V1.8 - CRITIC AGENT (CONSENSUS ARBITER)
 * Specialization: Multi-Agent Consensus, Final Decision Making
 * Decision Output: FINAL APPROVE/REJECT + Composite Confidence Score
 */

import { agentBus, CHANNELS } from './bus.js';

class CriticAgent {
    constructor() {
        this.name = 'CRITIC_AGENT';
        this.consensusRules = {
            minTechScore: 65,
            minSentimentScore: -20, // Can tolerate slight negative sentiment
            requireBothApprove: true, // Both agents must approve
            minCompositeConfidence: 60 // Lowered from 70 to allow more realistic signals
        };

        this._initializeListeners();
    }

    /**
     * Main consensus decision function
     */
    async decide(votes) {
        const startTime = Date.now();
        console.log(`[${this.name}] Evaluating consensus from ${votes.length} agents...`);

        try {
            // Extract votes
            const techVote = votes.find(v => v.agent === 'TECH_AGENT');
            const sentinelVote = votes.find(v => v.agent === 'SENTINEL_AGENT');

            if (!techVote || !sentinelVote) {
                return this._rejectSignal('INCOMPLETE_VOTES', {
                    reason: 'Missing votes from required agents',
                    receivedVotes: votes.map(v => v.agent)
                });
            }

            // 1. Check individual agent decisions
            const techApproved = techVote.decision === 'APPROVE';
            const sentinelApproved = sentinelVote.decision === 'APPROVE';

            // 2. Enforce consensus rule: BOTH must approve
            if (this.consensusRules.requireBothApprove && (!techApproved || !sentinelApproved)) {
                const rejectingAgent = !techApproved ? 'Technical Agent' : 'Sentinel Agent';
                const rejectReason = !techApproved ? techVote.reasoning : sentinelVote.reasoning;

                return this._rejectSignal('CONSENSUS_FAILED', {
                    rejectingAgent,
                    techDecision: techVote.decision,
                    sentinelDecision: sentinelVote.decision,
                    reason: `${rejectingAgent} rejected: ${rejectReason}`
                });
            }

            // 3. Calculate composite confidence score (v2.5.1 Dynamic Weighting)
            const techScore = techVote.technicalScore || 0;
            const sentimentScore = sentinelVote.sentimentScore || 0;

            // Normalize sentiment score from -50/+50 to 0-100 scale
            const normalizedSentiment = ((sentimentScore + 50) / 100) * 100;

            let compositeConfidence;
            if (techScore >= 95) {
                // Pillar 3: Elite Tech dominates (80/20)
                compositeConfidence = Math.round((techScore * 0.8) + (normalizedSentiment * 0.2));
            } else {
                // Standard weighting (60/40)
                compositeConfidence = Math.round((techScore * 0.6) + (normalizedSentiment * 0.4));
            }

            // 4. Final threshold check
            if (compositeConfidence < this.consensusRules.minCompositeConfidence) {
                return this._rejectSignal('LOW_CONFIDENCE', {
                    compositeConfidence,
                    threshold: this.consensusRules.minCompositeConfidence,
                    reason: `Composite confidence ${compositeConfidence}% below threshold ${this.consensusRules.minCompositeConfidence}%`
                });
            }

            // 5. CONSENSUS APPROVED ✅
            const result = {
                agent: this.name,
                decision: 'APPROVE',
                compositeConfidence,
                votes: {
                    technical: {
                        decision: techVote.decision,
                        score: techScore,
                        reasoning: techVote.reasoning
                    },
                    sentinel: {
                        decision: sentinelVote.decision,
                        score: sentimentScore,
                        reasoning: sentinelVote.reasoning
                    }
                },
                details: {
                    techScore,
                    sentimentScore,
                    normalizedSentiment: normalizedSentiment.toFixed(1),
                    compositeConfidence,
                    processingTime: `${Date.now() - startTime}ms`
                },
                reasoning: this._generateApprovalReasoning(techScore, sentimentScore, compositeConfidence),
                timestamp: new Date().toISOString()
            };

            console.log(`[${this.name}] ✅ CONSENSUS APPROVED (Confidence: ${compositeConfidence}%)`);

            // Publish approval to bus
            agentBus.publish(CHANNELS.SIGNAL_APPROVED, result);

            return result;

        } catch (error) {
            console.error(`[${this.name}] Consensus error:`, error);
            return this._rejectSignal('CONSENSUS_ERROR', { error: error.message });
        }
    }

    /**
     * Generate approval reasoning message
     */
    _generateApprovalReasoning(techScore, sentimentScore, compositeConfidence) {
        const lines = [
            `✅ Multi-Agent Consensus APPROVED`,
            `├─ Technical Agent: APPROVE (Score: ${techScore})`,
            `├─ Sentinel Agent: APPROVE (Sentiment: ${sentimentScore > 0 ? '+' : ''}${sentimentScore})`,
            `└─ Final Confidence: ${compositeConfidence}%`
        ];

        return lines.join('\n');
    }

    /**
     * Reject signal helper
     */
    _rejectSignal(reason, details) {
        const result = {
            agent: this.name,
            decision: 'REJECT',
            compositeConfidence: 0,
            reason,
            details,
            reasoning: `❌ Signal REJECTED: ${reason}`,
            timestamp: new Date().toISOString()
        };

        console.log(`[${this.name}] ❌ CONSENSUS REJECTED: ${reason}`);

        // Publish rejection to bus
        agentBus.publish(CHANNELS.SIGNAL_REJECTED, result);

        return result;
    }

    /**
     * Update consensus rules dynamically
     */
    updateRules(newRules) {
        this.consensusRules = { ...this.consensusRules, ...newRules };
        console.log(`[${this.name}] Consensus rules updated:`, this.consensusRules);
    }

    /**
     * Get current consensus rules
     */
    getRules() {
        return { ...this.consensusRules };
    }

    /**
     * Initialize event listeners
     */
    _initializeListeners() {
        agentBus.subscribe(CHANNELS.CONSENSUS_REQUEST, async (message) => {
            const votes = message.data.votes;
            await this.decide(votes);
        });
    }

    /**
     * Simulate a consensus vote (for testing)
     */
    async simulateVote(techDecision, techScore, sentinelDecision, sentimentScore) {
        const mockVotes = [
            {
                agent: 'TECH_AGENT',
                decision: techDecision,
                technicalScore: techScore,
                reasoning: `Mock technical analysis: ${techDecision}`
            },
            {
                agent: 'SENTINEL_AGENT',
                decision: sentinelDecision,
                sentimentScore: sentimentScore,
                reasoning: `Mock sentiment analysis: ${sentinelDecision}`
            }
        ];

        return await this.decide(mockVotes);
    }
}

// Export singleton instance
export const criticAgent = new CriticAgent();
console.log('[CRITIC_AGENT] Consensus Critic Agent initialized ✅');
