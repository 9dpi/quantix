/**
 * 🧪 TEST SUITE: QUANTIX AI CORE v2.5.3-FINAL
 * Simulating Situation A (Pass) and Situation B (Fail - Anti-FOMO)
 */

import { analyzeSignalWithAgents } from './backend/signal_genius_core_v2.5_base.js';

async function runTests() {
    console.log('🧪 STARTING QUANTIX v2.5.3-FINAL INTEGRATION TEST\n');

    // MOCK DATA BASE
    const baseData = {
        symbol: 'EURUSD=X',
        prices: [1.16700, 1.16710, 1.16705], // Local history
        currentCandle: { open: 1.16700, high: 1.16750, low: 1.16690, close: 1.16710 },
        volume: [1000, 1100, 1200],
        direction: 'LONG'
    };

    // --- SITUATION A: PASS (14:30 UTC, Clean Entry) ---
    console.log('--- Situation A: Normal Entry @ 14:30 UTC ---');
    const dataA = { ...baseData, currentPrice: 1.16720 }; // Only 1 pip move from base (1.16710)

    // We override Date for testing session
    const originalDate = Date;
    global.Date = class extends Date {
        constructor() { super(); }
        getUTCHours() { return 14; }
        getUTCMinutes() { return 30; }
        toISOString() { return "2026-01-13T14:30:00.000Z"; }
    };

    const resultA = await analyzeSignalWithAgents(dataA);
    console.log(`✅ Result A Emit: ${resultA.shouldEmitSignal}`);
    console.log(`✅ Session: ${resultA.market_session}`);
    console.log(`✅ Liquidity: ${resultA.liquidity_status}`);
    console.log(`✅ Reasoning: ${resultA.reasoning}\n`);

    // --- SITUATION B: FAIL (15:00 UTC, Price Chasing) ---
    console.log('--- Situation B: Price Chasing @ 15:00 UTC ---');
    const dataB = { ...baseData, currentPrice: 1.16840 }; // 13 pips move from base (1.16710)

    global.Date = class extends Date {
        constructor() { super(); }
        getUTCHours() { return 15; }
        getUTCMinutes() { return 0; }
        toISOString() { return "2026-01-13T15:00:00.000Z"; }
    };

    const resultB = await analyzeSignalWithAgents(dataB);
    console.log(`❌ Result B Emit: ${resultB.shouldEmitSignal}`);
    console.log(`❌ Reasoning: ${resultB.reasoning}\n`);

    // Reset Date
    global.Date = originalDate;

    process.exit(0);
}

runTests();
