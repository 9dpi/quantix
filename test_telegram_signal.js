/**
 * Test Telegram Signal Broadcast
 * Simulates a VIP signal from Quantix AI Core
 */

import { broadcastGoldenSignal } from './backend/telegram_autopilot.js';
import dotenv from 'dotenv';

dotenv.config();

// Simulate a high-quality signal from Quantix AI Core v2.5.3
const testSignal = {
    symbol: 'EURUSD=X',
    pair: 'EURUSD',
    action: 'BUY',
    entry: '1.16730',
    entry_price: 1.16730,
    tp: '1.17080',
    sl: '1.16480',
    confidence: 96,
    agentDecision: {
        confidence: 96,
        action: 'BUY',
        agentConsensus: {
            technical: { vote: 'APPROVE', confidence: 98 },
            sentinel: { vote: 'APPROVE', confidence: 94 },
            critic: { vote: 'APPROVE', confidence: 96 }
        },
        reasoning: 'Strong bullish momentum with multi-agent consensus'
    },
    metadata: {
        agents: {
            technical: 'APPROVE',
            sentinel: 'APPROVE',
            critic: 'APPROVE'
        },
        market_state: 'TRENDING',
        source: 'Yahoo Finance',
        isolation: 'STRICT_ACTIVE',
        timestamp: new Date().toISOString()
    }
};

console.log('🧪 Testing Telegram Signal Broadcast...\n');
console.log('📊 Test Signal Details:');
console.log(`   Asset: ${testSignal.pair}`);
console.log(`   Action: ${testSignal.action}`);
console.log(`   Entry: ${testSignal.entry}`);
console.log(`   TP: ${testSignal.tp}`);
console.log(`   SL: ${testSignal.sl}`);
console.log(`   Confidence: ${testSignal.confidence}%`);
console.log('\n🚀 Broadcasting to Telegram...\n');

try {
    await broadcastGoldenSignal(testSignal);
    console.log('\n✅ Test completed! Check your Telegram for the message.');
} catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
}
