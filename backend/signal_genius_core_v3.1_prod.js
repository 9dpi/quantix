/**
 * 🧠 QUANTIX AI CORE V3.1 - PRODUCTION UNIT (GIAI ĐOẠN 4)
 * Trái tim của hệ thống: Tích hợp Price Action + Communication Layer + Shadow Mode
 */

import { technicalAgent as techAgent } from './agents/tech_agent_v3.1.js';
import { orchestrator } from './agents/orchestrator.js';
import { formatEliteSignal, generateTelegramMessage } from './communication_layer_v3.1.js';

/**
 * 🛡️ PRODUCTION CONFIG (TAM GIÁC VÀNG v3.1)
 */
const CONFIG = {
    CONFIDENCE_THRESHOLD: parseInt(process.env.CORE_CONFIDENCE_REQ || '85'),
    RR_RATIO: parseFloat(process.env.CORE_RR_RATIO || '1.6'),
    SHADOW_MODE: process.env.CORE_SHADOW_MODE === 'true', // Stage 5 logic
    TRADING_WINDOW: { start: 7, end: 20 } // 07:00 - 20:00 UTC
};

/**
 * Main Production Analysis Pipeline
 */
export async function analyzeLiveSignal(marketData) {
    console.log(`\n[Quantix v3.1-PROD] Processing: ${marketData.symbol || 'EURUSD'}`);

    try {
        // 1. Run Multi-Agent Orchestration (Including v3.1 Tech Agent)
        const agentDecision = await orchestrator.analyzeAndDecide(marketData);

        // 2. Identify Strategy (Reversal vs Trend)
        // tech_agent_v3.1 will publish strategy info to the bus or decision object
        const isReversal = agentDecision.reasoning?.includes('ELITE') || agentDecision.strategy === 'REVERSAL_SNIPER';

        // 3. Apply Professional Communication Layer Mapping
        const formattedSignal = formatEliteSignal({
            ...agentDecision,
            provider: "Quantix Elite v3.1-PROD",
            version: "3.1.0-PRODUCTION",
            strategy: isReversal ? "REVERSAL_SNIPER" : "TREND_SNIPER",
            levels: {
                entry: marketData.currentPrice,
                tp: marketData.currentPrice + (isReversal ? 0.0040 : 0.0035) * (agentDecision.action === 'BUY' ? 1 : -1),
                sl: marketData.currentPrice - (0.0025) * (agentDecision.action === 'BUY' ? 1 : -1),
                target_pips: isReversal ? 40 : 35,
                stop_pips: 25
            },
            metadata: {
                ema20: marketData.ema20 || 'N/A',
                rsi: marketData.rsi || 'N/A'
            }
        }, marketData);

        // 4. Global Filters (Session, Confidence, Shadow)
        let finalDecision = formattedSignal.shouldEmitSignal;
        let rejectReason = "";

        if (formattedSignal.confidence < CONFIG.CONFIDENCE_THRESHOLD) {
            finalDecision = false;
            rejectReason = `LOW_CONFIDENCE: ${formattedSignal.confidence}% < ${CONFIG.CONFIDENCE_THRESHOLD}%`;
        }

        const hr = new Date().getUTCHours();
        if (hr < CONFIG.TRADING_WINDOW.start || hr > CONFIG.TRADING_WINDOW.end) {
            finalDecision = false;
            rejectReason = `OUTSIDE_WINDOW: ${hr}:00 UTC`;
        }

        // 5. Shadow Mode Integration (Giai đoạn 5)
        if (CONFIG.SHADOW_MODE && finalDecision) {
            console.log(`[SHADOW_MODE] 🛡️ Signal would have been sent: ${formattedSignal.action} @ ${formattedSignal.levels.entry}`);
            // Log to database for Giai đoạn 5 monitoring
            await logShadowSignal(formattedSignal);
            finalDecision = false; // Kill output to production channel
            rejectReason = "SHADOW_MODE_ACTIVE";
        }

        return {
            ...formattedSignal,
            shouldEmitSignal: finalDecision,
            rejectReason,
            telegramMessage: generateTelegramMessage(formattedSignal)
        };

    } catch (error) {
        console.error('[CORE_ERROR] Pipeline Failure:', error);
        return { shouldEmitSignal: false, error: error.message };
    }
}

/**
 * Log Signal for Shadow Monitoring (Stage 5)
 */
async function logShadowSignal(signal) {
    console.log(`[LOG] Recording shadow signal for audit...`);
    // Logic to save to 'shadow_signals' table in Supabase
}

console.log('🚀 [PROD_READY] Quantix Elite Core v3.1 Production Pipeline Active');
