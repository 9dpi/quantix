/**
 * 🎯 QUANTIX CORE V3.1 - TECHNICAL ANALYSIS AGENT (PATTERN RECOGNITION PRIORITY)
 * GIAI ĐOẠN 1: Brain Surgery - Tái cấu trúc với Pattern Recognition Module
 * 
 * Specialization: 
 * - Pin Bar Detection (Tail-Ratio >= 2.5)
 * - Supply/Demand Override Logic
 * - Dynamic Confidence Boost (+20 for Elite Patterns)
 * - RSI, EMA, Volume Analysis (Fallback)
 */

import { agentBus, CHANNELS } from './bus.js';
import { supabase } from '../supabaseClient.js';

class TechnicalAgentV31 {
    constructor() {
        this.name = 'TECH_AGENT_V3.1';
        this.weights = {
            // Standard Indicators
            rsi_threshold: 70,
            ema_sensitivity: 0.8,
            wick_ratio_max: 1.0,
            volume_threshold: 1.2,

            // v3.1 PATTERN RECOGNITION (HIGH PRIORITY)
            pin_bar_tail_ratio: 2.5,  // Tail must be >= 2.5x body
            pattern_confidence_boost: 20,  // +20 points for elite patterns at key levels
            supply_demand_zone_pips: 10,  // 10 pips threshold for S/D zones
            supply_demand_lookback: 500  // Candles to scan for peaks/valleys
        };

        this._initializeListeners();
        this._loadDynamicWeights();
    }

    /**
     * === MAIN ANALYSIS FUNCTION (v3.1 - PATTERN PRIORITY) ===
     */
    async analyze(marketData) {
        const startTime = Date.now();
        console.log(`[${this.name}] Starting technical analysis...`);

        try {
            // === PHASE 1: PATTERN RECOGNITION (HIGHEST PRIORITY) ===
            const patternResult = this._detectElitePattern(marketData);

            if (patternResult.isElite) {
                console.log(`[${this.name}] 🎯 ELITE PATTERN: ${patternResult.type} @ ${patternResult.location}`);
                // Supply/Demand Override: Bypass EMA check for reversal patterns
                return this._approvePatternSignal(patternResult, marketData, startTime);
            }

            // === PHASE 2: STANDARD TECHNICAL INDICATORS (FALLBACK) ===
            const rsi = this._calculateRSI(marketData.prices);
            const emaSignal = this._checkEMACrossover(marketData.prices);
            const wickRatio = this._calculateWickRatio(marketData.currentCandle);
            const volumeScore = this._analyzeVolume(marketData.volume);

            // Anti-Wick Detection
            const isWickFakeout = wickRatio > this.weights.wick_ratio_max;
            console.log(`[${this.name}] Wick Analysis: ratio=${wickRatio.toFixed(3)}, threshold=${this.weights.wick_ratio_max}, isFakeout=${isWickFakeout}`);

            if (isWickFakeout) {
                return this._rejectSignal('WICK_FAKEOUT', {
                    wickRatio,
                    reason: `Wick ratio ${(wickRatio * 100).toFixed(1)}% exceeds threshold ${(this.weights.wick_ratio_max * 100)}%`
                });
            }

            // RSI Scoring
            const rsiScore = this._scoreRSI(rsi, marketData.direction);

            // EMA Alignment
            const prices = marketData.prices || [];
            const ema20 = this._calculateEMA(prices, 20);
            const currentPrice = marketData.currentPrice;
            const isTrendBullish = currentPrice > ema20;
            const isTrendBearish = currentPrice < ema20;
            const isEMAMatch = (marketData.direction === 'LONG' && isTrendBullish) || (marketData.direction === 'SHORT' && isTrendBearish);
            const emaScore = isEMAMatch ? 90 : 30;

            // Composite Score
            let technicalScore = Math.round(
                (rsiScore * 0.4) +
                (emaScore * 0.3) +
                (volumeScore * 0.3)
            );

            // Convergence Boost
            if (rsiScore >= 85 && emaScore >= 90 && volumeScore >= 90) {
                technicalScore = 100;
            }

            const decision = technicalScore >= 60 ? 'APPROVE' : 'REJECT';

            const result = {
                agent: this.name,
                decision,
                score: technicalScore,
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
            agentBus.publish(CHANNELS.TECH_ANALYSIS, result);
            return result;

        } catch (error) {
            console.error(`[${this.name}] Analysis error:`, error);
            return this._rejectSignal('ANALYSIS_ERROR', { error: error.message });
        }
    }

    /**
     * 🕵️ DETECT ELITE PATTERN (Pin Bar + Supply/Demand Confirmation)
     */
    _detectElitePattern(marketData) {
        const candle = marketData.currentCandle;
        if (!candle) return { isElite: false };

        const body = Math.abs(candle.close - candle.open) || 0.00001;
        const upperWick = candle.high - Math.max(candle.open, candle.close);
        const lowerWick = Math.min(candle.open, candle.close) - candle.low;

        // Pin Bar Detection (Tail-Ratio >= 2.5)
        const isBullishPinBar = (lowerWick / body) >= this.weights.pin_bar_tail_ratio;
        const isBearishPinBar = (upperWick / body) >= this.weights.pin_bar_tail_ratio;

        if (!isBullishPinBar && !isBearishPinBar) {
            return { isElite: false };
        }

        // Supply/Demand Zone Confirmation
        const atKeyLevel = this._checkSupplyDemandZone(marketData.currentPrice, marketData.prices || []);

        if (!atKeyLevel) {
            console.log(`[${this.name}] Pin Bar detected but NOT at Key Level. Skipping override.`);
            return { isElite: false };
        }

        return {
            isElite: true,
            type: isBullishPinBar ? 'BULLISH_PIN_BAR' : 'BEARISH_PIN_BAR',
            direction: isBullishPinBar ? 'BUY' : 'SELL',
            location: atKeyLevel.type,  // 'SUPPORT' or 'RESISTANCE'
            tailRatio: isBullishPinBar ? (lowerWick / body).toFixed(2) : (upperWick / body).toFixed(2)
        };
    }

    /**
     * 🗺️ CHECK SUPPLY/DEMAND ZONE (500 Candle Peak/Valley)
     */
    _checkSupplyDemandZone(currentPrice, history) {
        if (history.length < 50) return false;

        const lookback = history.slice(-this.weights.supply_demand_lookback);
        const maxHigh = Math.max(...lookback);
        const minLow = Math.min(...lookback);

        const zoneThreshold = this.weights.supply_demand_zone_pips * 0.0001; // Convert pips to price
        const nearSupport = Math.abs(currentPrice - minLow) <= zoneThreshold;
        const nearResistance = Math.abs(currentPrice - maxHigh) <= zoneThreshold;

        if (nearSupport) return { type: 'SUPPORT', level: minLow };
        if (nearResistance) return { type: 'RESISTANCE', level: maxHigh };

        return false;
    }

    /**
     * ✅ APPROVE PATTERN SIGNAL (Supply/Demand Override Active)
     */
    _approvePatternSignal(patternResult, marketData, startTime) {
        // Dynamic Confidence Boost: Base 80 + Pattern Boost 20 = 100
        const baseScore = 80;
        const boostedScore = baseScore + this.weights.pattern_confidence_boost;

        const result = {
            agent: this.name,
            decision: 'APPROVE',
            score: boostedScore,
            pattern: patternResult,
            details: {
                patternType: patternResult.type,
                tailRatio: patternResult.tailRatio,
                keyLevel: patternResult.location,
                supplyDemandOverride: true,  // EMA check bypassed
                processingTime: `${Date.now() - startTime}ms`
            },
            reasoning: `🎯 ELITE ${patternResult.type} detected at ${patternResult.location} zone. Tail-Ratio: ${patternResult.tailRatio}. Supply/Demand Override ACTIVE.`
        };

        console.log(`[${this.name}] Analysis complete: APPROVE (Score: ${boostedScore}) - PATTERN OVERRIDE`);
        agentBus.publish(CHANNELS.TECH_ANALYSIS, result);
        return result;
    }

    // ========== STANDARD INDICATOR METHODS (Unchanged from v1.8) ==========

    _calculateRSI(prices, period = 14) {
        if (prices.length < period + 1) return 50;
        const changes = [];
        for (let i = 1; i < prices.length; i++) changes.push(prices[i] - prices[i - 1]);
        const gains = changes.slice(-period).map(c => c > 0 ? c : 0);
        const losses = changes.slice(-period).map(c => c < 0 ? Math.abs(c) : 0);
        const avgGain = gains.reduce((a, b) => a + b, 0) / period;
        const avgLoss = losses.reduce((a, b) => a + b, 0) / period;
        if (avgLoss === 0) return 100;
        return 100 - (100 / (1 + (avgGain / avgLoss)));
    }

    _scoreRSI(rsi, direction) {
        if (direction === 'LONG') {
            if (rsi < 30) return 100;
            if (rsi < 50) return 80;
            if (rsi < 70) return 50;
            return 20;
        } else {
            if (rsi > 70) return 100;
            if (rsi > 50) return 80;
            if (rsi > 30) return 50;
            return 20;
        }
    }

    _checkEMACrossover(prices) {
        const ema12 = this._calculateEMA(prices, 12);
        const ema26 = this._calculateEMA(prices, 26);
        return {
            signal: ema12 > ema26 ? 'BULLISH' : 'BEARISH',
            ema12: ema12.toFixed(5),
            ema26: ema26.toFixed(5)
        };
    }

    _calculateEMA(prices, period) {
        if (prices.length < period) return prices[prices.length - 1];
        const multiplier = 2 / (period + 1);
        let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
        for (let i = period; i < prices.length; i++) ema = (prices[i] - ema) * multiplier + ema;
        return ema;
    }

    _calculateWickRatio(candle) {
        if (!candle || typeof candle !== 'object') return 0;
        const { open, high, low, close } = candle;
        const bodySize = Math.abs(close - open);
        const upperWick = high - Math.max(open, close);
        const lowerWick = Math.min(open, close) - low;
        const totalWick = upperWick + lowerWick;

        if (bodySize < 0.0001) {
            const totalRange = high - low;
            if (totalRange === 0) return 0;
            return totalWick / totalRange;
        }
        return totalWick / bodySize;
    }

    _analyzeVolume(volumeData) {
        if (!volumeData || volumeData.length < 2) return 50;
        const currentVolume = volumeData[volumeData.length - 1];
        const avgVolume = volumeData.slice(-10).reduce((a, b) => a + b, 0) / Math.min(10, volumeData.length);
        const volumeRatio = currentVolume / avgVolume;
        if (volumeRatio >= this.weights.volume_threshold) return 90;
        if (volumeRatio >= 1.0) return 70;
        return 40;
    }

    _generateReasoning(decision, score, rsi, emaSignal, wickRatio) {
        if (decision === 'REJECT') {
            return `Technical score ${score} below threshold. RSI: ${rsi.toFixed(1)}, EMA: ${emaSignal.signal}`;
        }
        return `Strong technical convergence. RSI: ${rsi.toFixed(1)}, EMA: ${emaSignal.signal}, Score: ${score}`;
    }

    _rejectSignal(reason, details) {
        return {
            agent: this.name,
            decision: 'REJECT',
            score: 0,
            reason,
            details
        };
    }

    async _loadDynamicWeights() {
        try {
            const { data, error } = await supabase
                .from('agent_config')
                .select('weights')
                .eq('agent_name', this.name)
                .single();

            if (data && data.weights) {
                this.weights = { ...this.weights, ...data.weights };
                console.log(`[${this.name}] Dynamic weights loaded from database`);
            }
        } catch (error) {
            console.log(`[${this.name}] Using default weights (DB not available)`);
        }
    }

    _initializeListeners() {
        agentBus.subscribe(CHANNELS.MARKET_DATA, async (data) => {
            await this.analyze(data);
        });
        console.log(`[${this.name}] Agent subscribed to channel: ${CHANNELS.MARKET_DATA}`);
    }
}

// Export singleton instance
export const technicalAgent = new TechnicalAgentV31();
console.log('[TECH_AGENT] Technical Analysis Agent v3.1 initialized ✅');
