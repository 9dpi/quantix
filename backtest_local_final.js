/**
 * ⚡ QUANTIX AI CORE v2.5.3-FINAL: LOCAL BACKTEST ENGINE (REFINED)
 * Simulating 16,750 candles with strict Universe Logic filters.
 */

import { analyzeSignalWithAgents } from './backend/signal_genius_core_v2.5_base.js';

async function runLocalBacktest() {
    console.log('🚀 INITIALIZING REFINED BACKTEST: QUANTIX v2.5.3-FINAL');
    console.log('📊 Target: 16,750 Candles Scan\n');

    const stats = {
        total_attempts: 16750,
        reject_session: 0,
        reject_fomo: 0,
        reject_expiry: 0,
        reject_confidence: 0,
        pass_elite: 0
    };

    let basePrice = 1.16700;

    for (let i = 0; i < stats.total_attempts; i++) {
        const totalMinutes = i % (24 * 60);
        const hr = Math.floor(totalMinutes / 60);
        const min = totalMinutes % 60;

        // Simulate smoother price movement
        basePrice += (Math.random() - 0.5) * 0.00005;
        const currentPrice = basePrice + (Math.random() * 0.00008); // Small realistic gap (0.8 pips)

        const mockMarketData = {
            symbol: 'EURUSD=X',
            currentPrice: currentPrice,
            prices: Array(20).fill(0).map((_, idx) => basePrice - (idx * 0.00002)),
            volume: [1000, 1100, 1150],
            direction: 'LONG'
        };

        // Date Override
        const originalDate = global.Date;
        global.Date = class extends Date {
            constructor() { super(); }
            getUTCHours() { return hr; }
            getUTCMinutes() { return min; }
            toISOString() { return `2026-01-13T${String(hr).padStart(2, '0')}:${String(min).padStart(2, '0')}:00.000Z`; }
        };

        // --- BACKTEST FILTERING (AS PER USER SPEC) ---

        // Gate 1: Session Filter (7:00 - 18:00)
        const isTradingWindow = (hr >= 7 && hr <= 18);

        // Gate 2: Expiry Filter (> 21:00)
        const isLate = (hr >= 21);

        const result = await analyzeSignalWithAgents(mockMarketData);

        if (!isTradingWindow) {
            stats.reject_session++;
        } else if (isLate) {
            stats.reject_expiry++;
        } else if (!result.shouldEmitSignal) {
            const reason = result.reasoning || "";
            if (reason.includes("Anti-FOMO")) stats.reject_fomo++;
            else stats.reject_confidence++;
        } else {
            stats.pass_elite++;
        }

        global.Date = originalDate;
    }

    // --- FINAL REPORT ---
    console.log('\n============================================================');
    console.log('🏆 FINAL BACKTEST REPORT: QUANTIX v2.5.3-FINAL');
    console.log('============================================================');
    console.log(`Total Candles Scanned : ${stats.total_attempts.toLocaleString()}`);
    console.log(`------------------------------------------------------------`);
    console.log(`❌ REJECT_SESSION      : ${stats.reject_session.toLocaleString()} (Outside 07:00-18:00)`);
    console.log(`❌ REJECT_FOMO         : ${stats.reject_fomo.toLocaleString()} (> 5 pips Gap)`);
    console.log(`❌ REJECT_EXPIRY       : ${stats.reject_expiry.toLocaleString()} (> 21:00 UTC)`);
    console.log(`❌ REJECT_LACK_CONF    : ${stats.reject_confidence.toLocaleString()} (Confidence < 90%)`);
    console.log(`------------------------------------------------------------`);
    console.log(`✅ TOTAL ELITE SIGNALS : ${stats.pass_elite.toLocaleString()} (Passed All Gates)`);
    console.log(`============================================================\n`);

    process.exit(0);
}

runLocalBacktest();
