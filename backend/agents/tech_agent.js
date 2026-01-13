/**
 * QUANTIX CORE V1.8 - TECHNICAL ANALYSIS AGENT
 * Specialization: RSI, EMA, Price Action, Anti-Wick Detection
 * Decision Output: APPROVE/REJECT + Technical Score (0-100)
 */

import { agentBus, CHANNELS } from './bus.js';
import { supabase } from '../supabaseClient.js';

class TechnicalAgent {
    constructor() {
        this.name = 'TECH_AGENT';
        this.weights = {
            rsi_threshold: 70,
            ema_sensitivity: 0.8,
            wick_ratio_max: 1.0, // Allow up to 100% wick ratio (1:1 wick to body)
            volume_multiplier: 1.2
        };

        this._initializeListeners();
        this._loadDynamicWeights();
    }

    /**
     * Main analysis function
     */
    async analyze(marketData) {
        const startTime = Date.now();
        console.log(`[${this.name}] Starting technical analysis...`);

        try {
            // 1. Calculate technical indicators
            const rsi = this._calculateRSI(marketData.prices);
            const emaSignal = this._checkEMACrossover(marketData.prices);
            const wickRatio = this._calculateWickRatio(marketData.currentCandle);
            const volumeScore = this._analyzeVolume(marketData.volume);

            // 2. Anti-Wick Detection (Critical Filter)
            const isWickFakeout = wickRatio > this.weights.wick_ratio_max;

            console.log(`[${this.name}] Wick Analysis: ratio=${wickRatio.toFixed(3)}, threshold=${this.weights.wick_ratio_max}, isFakeout=${isWickFakeout}`);

            if (isWickFakeout) {
                return this._rejectSignal('WICK_FAKEOUT', {
                    wickRatio,
                    reason: `Wick ratio ${(wickRatio * 100).toFixed(1)}% exceeds threshold ${(this.weights.wick_ratio_max * 100)}%`
                });
            }

            // 3. RSI Overbought/Oversold Check
            const rsiScore = this._scoreRSI(rsi, marketData.direction);

            // 4. EMA Alignment Check (v2.5.1 Enhanced)
            const prices = marketData.prices || [];
            const ema20 = this._calculateEMA(prices, 20);
            const currentPrice = marketData.currentPrice;

            // Check trend alignment
            const isTrendBullish = currentPrice > ema20;
            const isTrendBearish = currentPrice < ema20;
            const isEMAMatch = (marketData.direction === 'LONG' && isTrendBullish) || (marketData.direction === 'SHORT' && isTrendBearish);

            const emaScore = isEMAMatch ? 90 : 30;

            // 5. Calculate composite technical score (v2.5.1 Decapped)
            let technicalScore = Math.round(
                (rsiScore * 0.4) +
                (emaScore * 0.3) +
                (volumeScore * 0.3)
            );

            // THE CONVERGENCE: If RSI, EMA, and Volume are elite -> 100%
            if (rsiScore >= 85 && emaScore >= 90 && volumeScore >= 90) {
                technicalScore = 100;
            }

            // 6. Decision threshold
            const decision = technicalScore >= 60 ? 'APPROVE' : 'REJECT';

            const result = {
                agent: this.name,
                decision,
                technicalScore,
                details: {
                    rsi: rsi.toFixed(2),
                    rsiScore,
                    emaSignal: emaSignal.signal,
                    emaScore,
                    wickRatio: (wickRatio * 100).toFixed(1) + '%',
                    volumeScore,
                    processingTime: `${Date.now() - startTime}ms`
                },
                reasoning: this._generateReasoning(decision, technicalScore, rsi, emaSignal, wickRatio)
            };

            console.log(`[${this.name}] Analysis complete: ${decision} (Score: ${technicalScore})`);

            // Publish result to bus
            agentBus.publish(CHANNELS.TECH_ANALYSIS, result);

            return result;

        } catch (error) {
            console.error(`[${this.name}] Analysis error:`, error);
            return this._rejectSignal('ANALYSIS_ERROR', { error: error.message });
        }
    }

    /**
     * Calculate RSI (Relative Strength Index)
     */
    _calculateRSI(prices, period = 14) {
        if (prices.length < period + 1) return 50; // Neutral if insufficient data

        const changes = [];
        for (let i = 1; i < prices.length; i++) {
            changes.push(prices[i] - prices[i - 1]);
        }

        const gains = changes.slice(-period).map(c => c > 0 ? c : 0);
        const losses = changes.slice(-period).map(c => c < 0 ? Math.abs(c) : 0);

        const avgGain = gains.reduce((a, b) => a + b, 0) / period;
        const avgLoss = losses.reduce((a, b) => a + b, 0) / period;

        if (avgLoss === 0) return 100;

        const rs = avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));

        return rsi;
    }

    /**
     * Score RSI based on signal direction
     */
    _scoreRSI(rsi, direction) {
        // v2.5.1 Elite Scoring Ranges
        if (direction === 'LONG') {
            // Perfect LONG: RSI 40-60 (Rising momentum)
            if (rsi >= 40 && rsi <= 60) return 95;
            if (rsi >= 30 && rsi < 40) return 85;
            if (rsi > 60 && rsi <= 70) return 75;
            if (rsi > 70) return 30; // Overbought
            return 50;
        } else {
            // Perfect SHORT: RSI 40-60 (Falling momentum)
            if (rsi >= 40 && rsi <= 60) return 95;
            if (rsi > 60 && rsi <= 70) return 85;
            if (rsi >= 30 && rsi < 40) return 75;
            if (rsi < 30) return 30; // Oversold
            return 50;
        }
    }

    /**
     * Check EMA Crossover (Fast EMA vs Slow EMA)
     */
    _checkEMACrossover(prices) {
        const ema12 = this._calculateEMA(prices, 12);
        const ema26 = this._calculateEMA(prices, 26);

        const aligned = ema12 > ema26;
        const signal = aligned ? 'BULLISH' : 'BEARISH';

        return { aligned, signal, ema12, ema26 };
    }

    /**
     * Calculate EMA (Exponential Moving Average)
     */
    _calculateEMA(prices, period) {
        if (prices.length < period) return prices[prices.length - 1];

        const multiplier = 2 / (period + 1);
        let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;

        for (let i = period; i < prices.length; i++) {
            ema = (prices[i] - ema) * multiplier + ema;
        }

        return ema;
    }

    /**
     * Calculate Wick Ratio (Wick Length / Body Length)
     * High ratio = potential fakeout
     */
    _calculateWickRatio(candle) {
        if (!candle || typeof candle !== 'object') return 0;
        const { open, high, low, close } = candle;
        const bodySize = Math.abs(close - open);
        const upperWick = high - Math.max(open, close);
        const lowerWick = Math.min(open, close) - low;
        const totalWick = upperWick + lowerWick;

        // If body is very small (< 0.0001), use total candle range instead
        if (bodySize < 0.0001) {
            const totalRange = high - low;
            if (totalRange === 0) return 0; // Perfect doji
            return totalWick / totalRange;
        }

        return totalWick / bodySize;
    }

    /**
     * Analyze volume
     */
    _analyzeVolume(volumeData) {
        if (!volumeData || volumeData.length < 2) return 70; // Neutral if no data

        const currentVolume = volumeData[volumeData.length - 1];
        const avgVolume = volumeData.slice(-20).reduce((a, b) => a + b, 0) / 20;

        const volumeRatio = currentVolume / avgVolume;

        if (volumeRatio >= this.weights.volume_multiplier) return 90; // Strong volume
        if (volumeRatio >= 0.8) return 70; // Normal volume
        return 50; // Weak volume
    }

    /**
     * Generate human-readable reasoning
     */
    _generateReasoning(decision, score, rsi, emaSignal, wickRatio) {
        if (decision === 'REJECT') {
            if (wickRatio > this.weights.wick_ratio_max) {
                return `Rejected: Wick fakeout detected (${(wickRatio * 100).toFixed(1)}% ratio)`;
            }
            return `Rejected: Technical score ${score} below threshold (65)`;
        }

        return `Approved: Strong technical setup (RSI: ${rsi.toFixed(1)}, EMA: ${emaSignal.signal}, Score: ${score})`;
    }

    /**
     * Reject signal helper
     */
    _rejectSignal(reason, details) {
        return {
            agent: this.name,
            decision: 'REJECT',
            technicalScore: 0,
            reason,
            details
        };
    }

    /**
     * Load dynamic weights from database
     */
    async _loadDynamicWeights() {
        try {
            const { data, error } = await supabase
                .from('dynamic_weights')
                .select('*');

            if (data && !error) {
                data.forEach(row => {
                    if (this.weights.hasOwnProperty(row.weight_key)) {
                        this.weights[row.weight_key] = row.weight_value;
                    }
                });
                console.log(`[${this.name}] Dynamic weights loaded:`, this.weights);
            }
        } catch (error) {
            console.warn(`[${this.name}] Could not load dynamic weights, using defaults`);
        }
    }

    /**
     * Initialize event listeners
     */
    _initializeListeners() {
        agentBus.subscribe(CHANNELS.MARKET_DATA, async (message) => {
            if (message.data.requestAnalysis) {
                await this.analyze(message.data);
            }
        });
    }
}

// Export singleton instance
export const technicalAgent = new TechnicalAgent();
console.log('[TECH_AGENT] Technical Analysis Agent initialized ✅');
