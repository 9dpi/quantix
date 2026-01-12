import { analyzeSignalWithAgents } from '../backend/signal_genius_core_v1.8.js';
import yahooFinance from 'yahoo-finance2';
import dotenv from 'dotenv';
dotenv.config();

async function testScanner() {
    console.log("🚀 STARTING SCANNER TEST CYCLE...");
    const symbols = ['EURUSD=X', 'BTC-USD'];

    for (const symbol of symbols) {
        console.log(`\n🔍 Checking ${symbol}...`);
        try {
            const period1 = new Date();
            period1.setDate(period1.getDate() - 5); // 5 days for test
            const history = await yahooFinance.historical(symbol, { period1, interval: '1h' });
            const quote = await yahooFinance.quote(symbol);

            if (!history || history.length < 5) {
                console.log(`❌ Insufficient data for ${symbol}`);
                continue;
            }

            const livePrice = quote.regularMarketPrice;
            const prices = history.map(h => h.close);
            prices[prices.length - 1] = livePrice;

            const marketData = {
                symbol,
                currentPrice: livePrice,
                prices,
                currentCandle: history[history.length - 1],
                volume: history.map(h => h.volume || 0),
                direction: prices[prices.length - 1] > prices[prices.length - 2] ? 'LONG' : 'SHORT'
            };

            const decision = await analyzeSignalWithAgents(marketData);
            console.log(`Decision for ${symbol}:`, JSON.stringify(decision, null, 2));

        } catch (err) {
            console.error(`Error scanning ${symbol}:`, err.message);
        }
    }
    process.exit();
}

testScanner();
