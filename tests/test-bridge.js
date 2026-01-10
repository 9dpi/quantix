import { dispatchSignal, dispatchStatusUpdate, checkMVPHealth } from '../backend/dispatcher/signal-dispatcher.js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

/**
 * Integration Test: Core -> MVP Bridge
 * Tests the complete signal flow from Quantix AI Core to MVP Frontend
 */

const COLORS = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(color, message) {
    console.log(`${color}${message}${COLORS.reset}`);
}

function printHeader(title) {
    console.log('\n' + '='.repeat(60));
    log(COLORS.bright + COLORS.cyan, `  ${title}`);
    console.log('='.repeat(60) + '\n');
}

async function testHealthCheck() {
    printHeader('TEST 1: Health Check');

    try {
        log(COLORS.yellow, '📡 Checking MVP server health...');
        const isHealthy = await checkMVPHealth();

        if (isHealthy) {
            log(COLORS.green, '✅ SUCCESS: MVP server is healthy and reachable');
            return true;
        } else {
            log(COLORS.red, '❌ FAILED: MVP server is not responding');
            return false;
        }
    } catch (error) {
        log(COLORS.red, `❌ ERROR: ${error.message}`);
        return false;
    }
}

async function testSignalDispatch() {
    printHeader('TEST 2: Signal Dispatch (High Confidence)');

    const mockSignal = {
        signal_id: uuidv4(),
        timestamp: new Date().toISOString(),
        pair: "EUR/USD",
        timeframe: "M15",
        type: "BUY",
        entry_price: 1.08500,
        sl: 1.08200,
        tp: 1.09100,
        confidence_score: 95,
        sentiment: "STRONG BULLISH",
        status: "ACTIVE",
        version: "AI AGENT V1.5 EXCLUSIVE",
        expiry_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        metadata: {
            backtest_ref: "5_year_matching_v1",
            volatility: "low",
            risk_reward_ratio: "1:3.0",
            tp1_price: 1.08900,
            tp2_price: 1.09300
        }
    };

    try {
        log(COLORS.yellow, `📤 Dispatching signal ${mockSignal.signal_id}...`);
        log(COLORS.blue, `   Pair: ${mockSignal.pair} ${mockSignal.type}`);
        log(COLORS.blue, `   Entry: ${mockSignal.entry_price} | SL: ${mockSignal.sl} | TP: ${mockSignal.tp}`);
        log(COLORS.blue, `   Confidence: ${mockSignal.confidence_score}%`);

        const result = await dispatchSignal(mockSignal);

        if (result.success) {
            log(COLORS.green, '✅ SUCCESS: Signal dispatched and validated by MVP');
            log(COLORS.green, `   Signal ID: ${result.signal_id}`);
            log(COLORS.green, `   Stored at: ${result.stored_at}`);
            return { success: true, signalId: mockSignal.signal_id };
        } else {
            log(COLORS.red, '❌ FAILED: MVP rejected the signal');
            return { success: false };
        }
    } catch (error) {
        log(COLORS.red, `❌ ERROR: ${error.message}`);
        return { success: false };
    }
}

async function testStatusUpdate(signalId) {
    printHeader('TEST 3: Status Update');

    try {
        log(COLORS.yellow, `📝 Updating signal ${signalId} to ENTRY_HIT...`);

        const result = await dispatchStatusUpdate(signalId, 'ENTRY_HIT', 1.08500);

        if (result.success) {
            log(COLORS.green, '✅ SUCCESS: Signal status updated');
            log(COLORS.green, `   New status: ${result.new_status}`);
            return true;
        } else {
            log(COLORS.red, '❌ FAILED: Status update rejected');
            return false;
        }
    } catch (error) {
        log(COLORS.red, `❌ ERROR: ${error.message}`);
        return false;
    }
}

async function testLowConfidenceSignal() {
    printHeader('TEST 4: Low Confidence Signal');

    const lowConfSignal = {
        signal_id: uuidv4(),
        timestamp: new Date().toISOString(),
        pair: "EUR/USD",
        timeframe: "M15",
        type: "SELL",
        entry_price: 1.27500,
        sl: 1.27800,
        tp: 1.26900,
        confidence_score: 75,
        sentiment: "BEARISH",
        status: "WAITING",
        version: "AI AGENT V1.5",
        metadata: {
            volatility: "medium"
        }
    };

    try {
        log(COLORS.yellow, `📤 Dispatching low-confidence signal (${lowConfSignal.confidence_score}%)...`);

        const result = await dispatchSignal(lowConfSignal);

        if (result.success) {
            log(COLORS.green, '✅ SUCCESS: Low-confidence signal accepted');
            return true;
        } else {
            log(COLORS.red, '❌ FAILED: Signal rejected');
            return false;
        }
    } catch (error) {
        log(COLORS.red, `❌ ERROR: ${error.message}`);
        return false;
    }
}

async function runAllTests() {
    printHeader('🚀 SIGNAL GENIUS AI - BRIDGE INTEGRATION TEST');

    log(COLORS.cyan, 'Testing communication between:');
    log(COLORS.cyan, '  🧠 Quantix AI Core (Brain)');
    log(COLORS.cyan, '  ↓');
    log(COLORS.cyan, '  📡 Signal Dispatcher');
    log(COLORS.cyan, '  ↓');
    log(COLORS.cyan, '  🎯 MVP Receiver (Face)');

    console.log('\n' + '-'.repeat(60));
    log(COLORS.magenta, `MVP URL: ${process.env.MVP_API_URL || 'http://localhost:3001/api/v1/internal/signals'}`);
    log(COLORS.magenta, `Auth Key: ${process.env.INTERNAL_AUTH_KEY ? '✅ Configured' : '❌ Missing'}`);
    console.log('-'.repeat(60));

    const results = {
        total: 0,
        passed: 0,
        failed: 0
    };

    // Test 1: Health Check
    results.total++;
    const healthOk = await testHealthCheck();
    if (healthOk) results.passed++;
    else results.failed++;

    if (!healthOk) {
        log(COLORS.red, '\n⚠️  MVP server is not reachable. Please start test-server.js first.');
        log(COLORS.yellow, '\nRun: node test-server.js');
        process.exit(1);
    }

    // Test 2: High Confidence Signal
    results.total++;
    const signalResult = await testSignalDispatch();
    if (signalResult.success) results.passed++;
    else results.failed++;

    // Test 3: Status Update (only if signal was successful)
    if (signalResult.success) {
        results.total++;
        const statusOk = await testStatusUpdate(signalResult.signalId);
        if (statusOk) results.passed++;
        else results.failed++;
    }

    // Test 4: Low Confidence Signal
    results.total++;
    const lowConfOk = await testLowConfidenceSignal();
    if (lowConfOk) results.passed++;
    else results.failed++;

    // Final Report
    printHeader('📊 TEST RESULTS');

    log(COLORS.bright, `Total Tests: ${results.total}`);
    log(COLORS.green, `✅ Passed: ${results.passed}`);
    log(COLORS.red, `❌ Failed: ${results.failed}`);

    const successRate = ((results.passed / results.total) * 100).toFixed(1);
    console.log('\n' + '='.repeat(60));

    if (results.failed === 0) {
        log(COLORS.green + COLORS.bright, `
🎉 ALL TESTS PASSED! (${successRate}%)
The bridge between Core and MVP is working perfectly.
You can now proceed with production deployment.
        `);
    } else {
        log(COLORS.yellow, `
⚠️  Some tests failed (${successRate}% success rate)
Please check the errors above and verify:
  1. test-server.js is running
  2. INTERNAL_AUTH_KEY is set correctly in .env
  3. Supabase credentials are valid
        `);
    }

    console.log('='.repeat(60) + '\n');
}

// Run tests
runAllTests().catch(error => {
    log(COLORS.red, `\n💥 Fatal error: ${error.message}`);
    process.exit(1);
});
