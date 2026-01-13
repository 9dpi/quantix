/**
 * 🎯 QUANTIX AI CORE V2.5.3 - THE FINAL EVOLUTION
 * Integrated with Universe Logic: Session Intelligence, Anti-FOMO Guard, and Auto-Expiry.
 */

import { orchestrator } from './agents/orchestrator.js';

/**
 * Main entry point for signal analysis - v2.5.3 FINAL
 */
export async function analyzeSignalWithAgents(marketData) {
    const now = new Date();
    const hr = now.getUTCHours();
    const min = now.getUTCMinutes();

    // --- 1. TIME UNIVERSE VALIDATOR ---
    const timeUni = timeUniverseValidator(hr, min);

    // --- 2. ANTI-FOMO GUARD (Price Chasing Check) ---
    const fomoGuard = chasingGuard(marketData);

    console.log(`\n[Quantix Core v2.5.3] Session: ${timeUni.market_session} | Liquidity: ${timeUni.liquidity_status}`);

    try {
        // --- 3. PRICE ACTION INJECTION (v3.1) ---
        const lastCandle = marketData.currentCandle || {
            open: marketData.prices[marketData.prices.length - 2],
            close: marketData.prices[marketData.prices.length - 1],
            high: Math.max(marketData.prices[marketData.prices.length - 1], marketData.prices[marketData.prices.length - 2]),
            low: Math.min(marketData.prices[marketData.prices.length - 1], marketData.prices[marketData.prices.length - 2])
        };

        const pinBar = detectPinBar(lastCandle);
        const atKeyLevel = checkSupportResistance(marketData.currentPrice, marketData.prices || []);

        let paDecision = null;
        if (pinBar.isElite && atKeyLevel) {
            console.log(`[Quantix Core v3.1] 🎯 ELITE PATTERN: ${pinBar.direction} Pin Bar @ Key Level. OVERRIDE ACTIVE.`);
            paDecision = {
                confidence: 92,
                strategy: "REVERSAL_SNIPER",
                tp_logic: "TRAILING_STOP",
                action: pinBar.direction === 'BULLISH' ? 'BUY' : 'SELL',
                reasoning: `Elite ${pinBar.direction} Pin Bar detected at historical Supply/Demand zone.`
            };
        }

        const rawDecision = paDecision || await orchestrator.analyzeAndDecide(marketData);

        let tunedTechScore = paDecision ? 92 : (rawDecision.votes?.technical?.score || 0);
        let sentimentScore = paDecision ? 12 : (rawDecision.votes?.sentinel?.score || 0); // Neutral-positive if sentiment skipped

        const rsi = calculateRSI(marketData.prices);
        const ema20 = calculateEMA(marketData.prices, 20);
        const currentPrice = marketData.currentPrice;

        // Technical Performance Tuning (Skip if PA override)
        if (!paDecision) {
            const isBullishPerfect = currentPrice > ema20 && rsi > 48 && rsi < 62;
            const isBearishPerfect = currentPrice < ema20 && rsi > 38 && rsi < 52;
            if (tunedTechScore >= 80 && (isBullishPerfect || isBearishPerfect)) tunedTechScore = 100;
        }

        // Confidence Calculation (v2.5.3 Injection: Support TECHNICAL_ONLY mode)
        let compositeConfidence = 0;
        if (paDecision) {
            compositeConfidence = 92;
        } else if (marketData.mode === 'TECHNICAL_ONLY') {
            compositeConfidence = tunedTechScore;
            console.log(`[Quantix Core] TECHNICAL_ONLY Mode Active. Composite Confidence: ${compositeConfidence}%`);
        } else {
            const normalizedSentiment = ((sentimentScore + 50) / 100) * 100;
            if (tunedTechScore >= 95) {
                compositeConfidence = Math.round((tunedTechScore * 0.95) + (normalizedSentiment * 0.05));
            } else {
                compositeConfidence = Math.round((tunedTechScore * 0.70) + (normalizedSentiment * 0.30));
            }
        }

        // --- FINAL SNIPER VALIDATOR & LOGIC INJECTION ---
        const pipValue = 0.0001;
        const stopPips = 25;
        const targetPips = paDecision ? 40 : Math.round(stopPips * 1.4); // Longer TP for Reversal Sniper
        const action = paDecision ? paDecision.action : ((tunedTechScore === 100) ? (marketData.direction === 'LONG' ? 'BUY' : 'SELL') : rawDecision.action);

        const tpPrice = action === 'BUY' ? (currentPrice + targetPips * pipValue) : (currentPrice - targetPips * pipValue);
        const slPrice = action === 'BUY' ? (currentPrice - stopPips * pipValue) : (currentPrice + stopPips * pipValue);

        const mockDecision = { ...rawDecision, confidence: compositeConfidence, action: action };
        const sniperResult = sniperTechnicalValidator(marketData, mockDecision);

        // --- ELITE REJECTION LOGIC ---
        let shouldEmit = sniperResult.isSniperSafe;
        let rejectReason = sniperResult.rejectReason;

        // Session Check: Reject if outside 7:00 - 18:00 UTC (Skip if PA override is requested for all-hours)
        if (!timeUni.is_trading_window) {
            shouldEmit = false;
            rejectReason = `🛡️ REJECT_SESSION: Outside Active Trading Window (7:00-18:00 UTC)`;
        }

        // NY Close Expiry Check: If signal comes after 21:00 UTC, reject (Too close to NY Close)
        if (hr === 21 && min >= 0) {
            shouldEmit = false;
            rejectReason = "Signal too close to NY Close (Insufficient time to hit TP)";
        }

        // Anti-FOMO Trigger: If price has moved > 5 pips
        if (fomoGuard.isChasingPrice) {
            shouldEmit = false;
            rejectReason = `🛡️ SNIPER VOID: Price moved ${fomoGuard.distancePips} pips beyond Entry Zone. Anti-FOMO triggered.`;
        }

        return {
            provider: "Quantix AI Core v2.5.3-FINAL",
            version: "2.5.3-FINAL",
            strategy: paDecision ? "REVERSAL_SNIPER (v3.1)" : "TREND_SNIPER (v2.5)",
            shouldEmitSignal: shouldEmit,
            confidence: compositeConfidence,
            action: sniperResult.finalAction,

            // ELITE METADATA
            market_session: timeUni.market_session,
            liquidity_status: timeUni.liquidity_status,
            expiry_rule: "Expires at New York close (22:00 UTC)",
            anti_fomo_guard: "Do not enter if price moves > 5 pips from Entry Zone",

            levels: {
                entry: currentPrice,
                entry_range: `${(currentPrice - 2 * pipValue).toFixed(5)} – ${(currentPrice + 2 * pipValue).toFixed(5)}`,
                tp: tpPrice,
                sl: slPrice,
                rr: paDecision ? "1:1.60" : "1:1.40",
                target_pips: targetPips,
                stop_pips: stopPips
            },

            reasoning: shouldEmit ?
                `🎯 SNIPER ELITE [${timeUni.market_session}]: ${rawDecision.reasoning || (paDecision ? paDecision.reasoning : 'Market convergence achieved')}` :
                rejectReason,

            metadata: {
                ema20: ema20.toFixed(5),
                rsi: rsi.toFixed(2),
                timeframe: "M15",
                posted_time: now.toISOString()
            }
        };

    } catch (error) {
        console.error('[Quantix Core v2.5.3] Critical Failure:', error);
        return { shouldEmitSignal: false, action: "NEUTRAL", confidence: 0, reasoning: error.message };
    }
}

/**
 * 🌍 TIME UNIVERSE VALIDATOR
 */
function timeUniverseValidator(hr, min) {
    let session = "Global Market";
    let liquidity = "STANDARD";
    const isTradingWindow = (hr >= 7 && hr <= 18);

    if (hr >= 8 && hr < 13) { session = "London"; liquidity = "HIGH"; }
    else if (hr >= 13 && hr <= 17) { session = "London → New York Overlap"; liquidity = "SUPREME"; }
    else if (hr >= 17 && hr <= 18) { session = "New York"; liquidity = "HIGH"; }
    else if (hr >= 22 || hr < 2) { session = "Sydney"; liquidity = "LOW"; }
    else if (hr >= 2 && hr < 8) { session = "Tokyo"; liquidity = "MODERATE"; }

    return { market_session: session, liquidity_status: liquidity, is_trading_window: isTradingWindow };
}

/**
 * 🛡️ CHASING GUARD (The 5 Pips Shield)
 */
function chasingGuard(marketData) {
    const currentPrice = marketData.currentPrice;
    const prices = marketData.prices || [];
    const entryBase = prices[prices.length - 1] || currentPrice;

    const diff = Math.abs(currentPrice - entryBase);
    const isGold = (marketData.symbol || '').includes('XAU');
    const distancePips = isGold ? (diff * 10).toFixed(1) : (diff / 0.0001).toFixed(1);

    const threshold = isGold ? 50 : 5.0;

    return {
        isChasingPrice: parseFloat(distancePips) > threshold,
        distancePips: distancePips
    };
}

/**
 * 🎯 SNIPER TECHNICAL VALIDATOR (The "Bullet" Check)
 */
function sniperTechnicalValidator(marketData, decision) {
    const prices = marketData.prices || [];
    const currentPrice = marketData.currentPrice;
    const action = decision.action;

    const rsi = calculateRSI(prices);
    const ema20 = calculateEMA(prices, 20);

    let isSniperSafe = false;
    let finalAction = "NEUTRAL";
    let rejectReason = "Divergence or low confidence";

    if (decision.confidence < 70) {
        return { isSniperSafe, finalAction, rejectReason: "Confidence below threshold", indicators: { rsi, ema20 } };
    }

    if (action === 'BULLISH' || action === 'BUY') {
        if (currentPrice > ema20 && rsi < 70) {
            isSniperSafe = true;
            finalAction = "BUY";
        } else {
            rejectReason = currentPrice <= ema20 ? "Price below EMA20" : "RSI Overbought (>70)";
        }
    } else if (action === 'BEARISH' || action === 'SELL') {
        if (currentPrice < ema20 && rsi > 30) {
            isSniperSafe = true;
            finalAction = "SELL";
        } else {
            rejectReason = currentPrice >= ema20 ? "Price above EMA20" : "RSI Oversold (<30)";
        }
    }

    return { isSniperSafe, finalAction, rejectReason, indicators: { rsi, ema20 } };
}

/**
 * 🕵️ DETECT PIN BAR (Wick-to-Body >= 2.5)
 */
function detectPinBar(candle) {
    if (!candle) return { isElite: false };
    const body = Math.abs(candle.close - candle.open) || 0.00001;
    const upperWick = candle.high - Math.max(candle.open, candle.close);
    const lowerWick = Math.min(candle.open, candle.close) - candle.low;

    const isBullish = lowerWick / body >= 2.5;
    const isBearish = upperWick / body >= 2.5;

    return {
        isElite: isBullish || isBearish,
        direction: isBullish ? 'BULLISH' : (isBearish ? 'BEARISH' : 'NEUTRAL')
    };
}

/**
 * 🗺️ CHECK SUPPORT/RESISTANCE (500 Candle Peak/Valley)
 */
function checkSupportResistance(currentPrice, history) {
    if (history.length < 50) return false;
    const lookback = history.slice(-500);
    const maxHigh = Math.max(...lookback);
    const minLow = Math.min(...lookback);

    const zoneThreshold = 0.0010; // 10 pips zone
    const nearSupport = Math.abs(currentPrice - minLow) <= zoneThreshold;
    const nearResistance = Math.abs(currentPrice - maxHigh) <= zoneThreshold;

    return nearSupport || nearResistance;
}

/**
 * Lightweight RSI Calculation
 */
function calculateRSI(prices, period = 14) {
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

/**
 * Lightweight EMA Calculation
 */
function calculateEMA(prices, period) {
    if (prices.length < period) return prices[prices.length - 1];
    const multiplier = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
    for (let i = period; i < prices.length; i++) ema = (prices[i] - ema) * multiplier + ema;
    return ema;
}

export function getSystemStats() {
    return orchestrator.getStats();
}

console.log('🚀 [BRAIN_INIT] Quantix Elite v3.1 - PRICE ACTION INJECTION Active');
export const version = "3.1.0-PAI";
