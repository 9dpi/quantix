/**
 * 🌍 QUANTIX CORE V3.1 - COMMUNICATION LAYER (GIAI ĐOẠN 2)
 * Đảm bảo output khớp 100% với format Telegram chuyên nghiệp
 * 
 * Features:
 * - Entry Zone Calculation (±2 pips)
 * - Session Auto-Detection (London/NY/Overlap)
 * - Auto-Expiry (22:00 UTC)
 * - Anti-FOMO Guard (5 pips kill-switch)
 */

/**
 * Format signal output for Telegram (Elite Template)
 */
export function formatEliteSignal(aiResult, marketData) {
    const now = new Date();
    const pipValue = 0.0001;

    // Entry Zone (±2 pips)
    const entryZoneMin = (aiResult.levels.entry - 2 * pipValue).toFixed(5);
    const entryZoneMax = (aiResult.levels.entry + 2 * pipValue).toFixed(5);

    // Session Detection
    const session = detectTradingSession(now);

    // Auto-Expiry (22:00 UTC)
    const expiryTime = calculateExpiry(now);

    // Anti-FOMO Guard
    const fomoStatus = checkFOMOGuard(marketData.currentPrice, aiResult.levels.entry);

    // Merge old fields + new fields
    return {
        // === CORE FIELDS (Giữ nguyên từ v2.5.3) ===
        provider: aiResult.provider || "Quantix AI Core v3.1",
        version: aiResult.version || "3.1.0-PAI",
        strategy: aiResult.strategy || "REVERSAL_SNIPER",
        shouldEmitSignal: aiResult.shouldEmitSignal && !fomoStatus.isChasingPrice,
        confidence: aiResult.confidence,
        action: aiResult.action,
        reasoning: aiResult.reasoning,

        // === ELITE METADATA (Mở rộng) ===
        market_session: session.name,
        liquidity_status: session.liquidity,
        session_hours: session.hours,

        // === AUTO-EXPIRY ===
        expiry_rule: "Expires at New York close (22:00 UTC)",
        expiry_time: expiryTime.formatted,
        time_remaining: expiryTime.remaining,

        // === ANTI-FOMO GUARD ===
        anti_fomo_guard: "Do not enter if price moves > 5 pips from Entry Zone",
        fomo_status: fomoStatus.status,
        price_distance_pips: fomoStatus.distancePips,

        // === LEVELS (Enhanced) ===
        levels: {
            entry: aiResult.levels.entry,
            entry_zone: `${entryZoneMin} – ${entryZoneMax}`,
            entry_zone_min: parseFloat(entryZoneMin),
            entry_zone_max: parseFloat(entryZoneMax),
            tp: aiResult.levels.tp,
            sl: aiResult.levels.sl,
            rr: aiResult.levels.rr || "1:1.60",
            target_pips: aiResult.levels.target_pips,
            stop_pips: aiResult.levels.stop_pips
        },

        // === METADATA (Giữ + Mở rộng) ===
        metadata: {
            ...aiResult.metadata,
            posted_time: now.toISOString(),
            posted_time_readable: now.toUTCString(),
            symbol: marketData.symbol || 'EURUSD=X',
            timeframe: aiResult.metadata?.timeframe || "M15"
        }
    };
}

/**
 * Detect Trading Session (London/NY/Overlap)
 */
function detectTradingSession(now) {
    const hr = now.getUTCHours();

    if (hr >= 8 && hr < 13) {
        return { name: "London", liquidity: "HIGH", hours: "08:00-13:00 UTC" };
    } else if (hr >= 13 && hr <= 17) {
        return { name: "London → New York Overlap", liquidity: "SUPREME", hours: "13:00-17:00 UTC" };
    } else if (hr >= 17 && hr < 22) {
        return { name: "New York", liquidity: "HIGH", hours: "17:00-22:00 UTC" };
    } else if (hr >= 22 || hr < 2) {
        return { name: "Sydney", liquidity: "LOW", hours: "22:00-02:00 UTC" };
    } else if (hr >= 2 && hr < 8) {
        return { name: "Tokyo", liquidity: "MODERATE", hours: "02:00-08:00 UTC" };
    }

    return { name: "Global Market", liquidity: "STANDARD", hours: "N/A" };
}

/**
 * Calculate Auto-Expiry (22:00 UTC)
 */
function calculateExpiry(now) {
    const expiryHour = 22;
    const expiry = new Date(now);
    expiry.setUTCHours(expiryHour, 0, 0, 0);

    // If past 22:00, set to next day
    if (now.getUTCHours() >= expiryHour) {
        expiry.setUTCDate(expiry.getUTCDate() + 1);
    }

    const remainingMs = expiry - now;
    const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
    const remainingMins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

    return {
        timestamp: expiry.toISOString(),
        formatted: expiry.toUTCString(),
        remaining: `${remainingHours}h ${remainingMins}m`
    };
}

/**
 * Check Anti-FOMO Guard (5 pips kill-switch)
 */
function checkFOMOGuard(currentPrice, entryPrice) {
    const diff = Math.abs(currentPrice - entryPrice);
    const distancePips = (diff / 0.0001).toFixed(1);
    const threshold = 5.0;

    const isChasingPrice = parseFloat(distancePips) > threshold;

    return {
        isChasingPrice,
        distancePips: distancePips,
        status: isChasingPrice ? "⚠️ FOMO ALERT: Price moved beyond safe entry zone" : "✅ Safe Entry Zone",
        threshold: threshold
    };
}

/**
 * Generate Telegram Message (Professional Format)
 */
export function generateTelegramMessage(signal) {
    const emoji = signal.action === 'BUY' ? '🟢' : '🔴';
    const strategyBadge = signal.strategy === 'REVERSAL_SNIPER' ? '🎯 REVERSAL SNIPER' : '📈 TREND SNIPER';

    return `
${emoji} **QUANTIX AI SIGNAL** ${emoji}
━━━━━━━━━━━━━━━━━━━━
${strategyBadge}
**Confidence:** ${signal.confidence}%
**Action:** ${signal.action}

📊 **ENTRY DETAILS**
Entry Zone: ${signal.levels.entry_zone}
Take Profit: ${signal.levels.tp}
Stop Loss: ${signal.levels.sl}
Risk-Reward: ${signal.levels.rr}

⏰ **SESSION INFO**
Market: ${signal.market_session}
Liquidity: ${signal.liquidity_status}
Expiry: ${signal.expiry_time}
Time Left: ${signal.time_remaining}

🛡️ **SAFETY RULES**
${signal.anti_fomo_guard}
${signal.fomo_status}

💡 **REASONING**
${signal.reasoning}

━━━━━━━━━━━━━━━━━━━━
⚡ Powered by Quantix AI v${signal.version}
`.trim();
}

console.log('🌍 [COMM_LAYER] Communication Layer v3.1 initialized ✅');
