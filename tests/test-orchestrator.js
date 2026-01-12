/**
 * QUANTIX V1.8 - ORCHESTRATOR INTEGRATION TEST
 * Test Shadow Mode and full Multi-Agent workflow
 * 
 * Run: node tests/test-orchestrator.js
 */

import { orchestrator } from '../backend/agents/orchestrator.js';
import { sentinelAgent } from '../backend/agents/sentinel_agent.js';

// Test utilities
const assert = (condition, message) => {
    if (!condition) {
        console.error(`❌ ASSERTION FAILED: ${message}`);
        process.exit(1);
    }
    console.log(`✅ ${message}`);
};

const testHeader = (title) => {
    console.log('\n' + '='.repeat(70));
    console.log(`  ${title}`);
    console.log('='.repeat(70) + '\n');
};

// Mock market data generator
const generateMockMarketData = (overrides = {}) => {
    const basePrice = 1.0500;
    const prices = Array.from({ length: 50 }, (_, i) =>
        basePrice + (Math.random() - 0.5) * 0.001
    );

    return {
        symbol: 'EURUSD=X',
        currentPrice: prices[prices.length - 1],
        prices,
        currentCandle: {
            open: basePrice,
            high: basePrice + 0.0008,
            low: basePrice - 0.0005,
            close: basePrice + 0.0006
        },
        volume: Array.from({ length: 50 }, () => 1000 + Math.random() * 500),
        direction: 'LONG',
        ...overrides
    };
};

// ============================================================================
// TEST 1: SHADOW MODE - High Confidence Signal (Should PASS)
// ============================================================================
async function testShadowModeHighConfidence() {
    testHeader('TEST 1: SHADOW MODE - High Confidence Signal (>= 85%)');

    console.log('📋 Scenario: Perfect technical setup + Positive sentiment');
    console.log('   Expected: Signal APPROVED and EMITTED (confidence >= 85%)\n');

    // Clear news and inject positive sentiment
    sentinelAgent.economicCalendar = [];
    sentinelAgent.newsCache = [];
    sentinelAgent.injectNews({
        title: 'EUR Economy Surges to Record High',
        sentiment: 0.9
    });

    const mockData = generateMockMarketData({
        currentCandle: {
            open: 1.0500,
            high: 1.0508,
            low: 1.0499,
            close: 1.0507 // Strong bullish candle
        }
    });

    const result = await orchestrator.analyzeAndDecide(mockData);

    console.log(`\n📊 Orchestrator Decision:`);
    console.log(`   Should Emit: ${result.shouldEmitSignal}`);
    console.log(`   Confidence: ${result.confidence}%`);
    console.log(`   Shadow Mode: ${result.shadowMode}`);

    // Assertions
    assert(
        result.confidence >= 85,
        `Confidence (${result.confidence}%) should be >= 85%`
    );
    assert(
        result.shouldEmitSignal === true,
        'High confidence signal should be emitted in Shadow Mode'
    );

    console.log('\n✅ TEST 1 PASSED: Shadow Mode allows high-confidence signals\n');
}

// ============================================================================
// TEST 2: SHADOW MODE - Medium Confidence Signal (Should BLOCK)
// ============================================================================
async function testShadowModeMediumConfidence() {
    testHeader('TEST 2: SHADOW MODE - Medium Confidence Signal (70-84%)');

    console.log('📋 Scenario: Decent setup but not perfect');
    console.log('   Expected: Signal REJECTED by Shadow Mode (confidence < 85%)\n');

    // Neutral sentiment
    sentinelAgent.economicCalendar = [];
    sentinelAgent.newsCache = [];

    const mockData = generateMockMarketData({
        currentCandle: {
            open: 1.0500,
            high: 1.0505,
            low: 1.0498,
            close: 1.0503 // Moderate candle
        }
    });

    const result = await orchestrator.analyzeAndDecide(mockData);

    console.log(`\n📊 Orchestrator Decision:`);
    console.log(`   Should Emit: ${result.shouldEmitSignal}`);
    console.log(`   Confidence: ${result.confidence}%`);
    console.log(`   Reasoning: ${result.reasoning}`);

    // Assertions
    assert(
        result.confidence >= 70 && result.confidence < 85,
        `Confidence (${result.confidence}%) should be between 70-84%`
    );
    assert(
        result.shouldEmitSignal === false,
        'Medium confidence signal should be BLOCKED in Shadow Mode'
    );

    console.log('\n✅ TEST 2 PASSED: Shadow Mode blocks medium-confidence signals\n');
}

// ============================================================================
// TEST 3: SHADOW MODE DISABLED - Medium Confidence Should PASS
// ============================================================================
async function testShadowModeDisabled() {
    testHeader('TEST 3: SHADOW MODE DISABLED - Medium Confidence Allowed');

    console.log('📋 Scenario: Disable Shadow Mode, test medium confidence signal');
    console.log('   Expected: Signal APPROVED and EMITTED (confidence >= 70%)\n');

    // Disable Shadow Mode
    orchestrator.disableShadowMode();

    const mockData = generateMockMarketData({
        currentCandle: {
            open: 1.0500,
            high: 1.0505,
            low: 1.0498,
            close: 1.0503
        }
    });

    const result = await orchestrator.analyzeAndDecide(mockData);

    console.log(`\n📊 Orchestrator Decision:`);
    console.log(`   Should Emit: ${result.shouldEmitSignal}`);
    console.log(`   Confidence: ${result.confidence}%`);
    console.log(`   Shadow Mode: ${result.shadowMode}`);

    // Assertions
    assert(
        result.shadowMode === false,
        'Shadow Mode should be disabled'
    );
    assert(
        result.shouldEmitSignal === true,
        'Medium confidence signal should be emitted when Shadow Mode is OFF'
    );

    console.log('\n✅ TEST 3 PASSED: Signals emit normally when Shadow Mode disabled\n');
}

// ============================================================================
// TEST 4: ORCHESTRATOR STATISTICS
// ============================================================================
async function testOrchestratorStats() {
    testHeader('TEST 4: ORCHESTRATOR STATISTICS');

    const stats = orchestrator.getStats();

    console.log(`\n📊 Orchestrator Statistics:`);
    console.log(`   Shadow Mode: ${stats.shadowMode ? 'ACTIVE' : 'DISABLED'}`);
    console.log(`   Shadow Threshold: ${stats.shadowModeThreshold}%`);
    console.log(`   Total Decisions: ${stats.totalDecisions}`);
    console.log(`   Approved Signals: ${stats.approvedSignals}`);
    console.log(`   Rejected Signals: ${stats.rejectedSignals}`);
    console.log(`   Approval Rate: ${stats.approvalRate}`);
    console.log(`   Avg Confidence: ${stats.avgConfidence}`);

    assert(
        stats.totalDecisions >= 3,
        `Should have at least 3 decisions (got ${stats.totalDecisions})`
    );

    console.log('\n✅ TEST 4 PASSED: Statistics tracking working\n');
}

// ============================================================================
// TEST 5: EMERGENCY REJECTION (High-Impact News)
// ============================================================================
async function testEmergencyRejection() {
    testHeader('TEST 5: EMERGENCY REJECTION - High-Impact News');

    console.log('📋 Scenario: Perfect technical BUT NFP news in 30 minutes');
    console.log('   Expected: Signal REJECTED regardless of confidence\n');

    // Inject NFP event
    sentinelAgent.economicCalendar = [];
    sentinelAgent.injectEconomicEvent({
        title: 'US Non-Farm Payrolls (NFP)',
        timestamp: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        impact: 'HIGH',
        currency: 'USD'
    });

    const mockData = generateMockMarketData({
        currentCandle: {
            open: 1.0500,
            high: 1.0508,
            low: 1.0499,
            close: 1.0507
        }
    });

    const result = await orchestrator.analyzeAndDecide(mockData);

    console.log(`\n📊 Orchestrator Decision:`);
    console.log(`   Should Emit: ${result.shouldEmitSignal}`);
    console.log(`   Reasoning: ${result.reasoning}`);

    // Assertions
    assert(
        result.shouldEmitSignal === false,
        'Signal must be REJECTED when high-impact news is pending'
    );

    console.log('\n✅ TEST 5 PASSED: Emergency rejection working\n');
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================
async function runAllTests() {
    console.log('\n');
    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log('║   QUANTIX V1.8 - ORCHESTRATOR INTEGRATION TEST SUITE            ║');
    console.log('╚══════════════════════════════════════════════════════════════════╝');

    try {
        await testShadowModeHighConfidence();
        await testShadowModeMediumConfidence();
        await testShadowModeDisabled();
        await testOrchestratorStats();
        await testEmergencyRejection();

        console.log('\n' + '='.repeat(70));
        console.log('🎉 ALL ORCHESTRATOR TESTS PASSED!');
        console.log('   Multi-Agent System with Shadow Mode is ready for deployment.');
        console.log('='.repeat(70) + '\n');

        // Print final stats
        const finalStats = orchestrator.getStats();
        console.log('📊 FINAL STATISTICS:');
        console.log(`   Total Decisions: ${finalStats.totalDecisions}`);
        console.log(`   Approval Rate: ${finalStats.approvalRate}`);
        console.log(`   Avg Confidence: ${finalStats.avgConfidence}`);
        console.log('');

        process.exit(0);

    } catch (error) {
        console.error('\n❌ TEST SUITE FAILED:', error);
        process.exit(1);
    }
}

// Run tests
runAllTests();
