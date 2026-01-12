import yahooFinance from 'yahoo-finance2';
import dotenv from 'dotenv';
import pg from 'pg';
import { analyzeSignalWithAgents } from './signal_genius_core_v1.8.js';
import { broadcastGoldenSignal } from './telegram_autopilot.js';

dotenv.config();

// --- CONFIGURATION ---
const ASSETS = ['EURUSD=X', 'BTC-USD', 'AAPL', 'VN30F1M'];
const TIMEFRAME = '1h';
const CHECK_INTERVAL = 60000; // 1 minute - High frequency for market tracking

// --- DATABASE SETUP ---
const { Pool } = pg;
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: { rejectUnauthorized: false }
};
const pool = new Pool(dbConfig);

/**
 * ENHANCED: Fetch comprehensive institutional-grade market data
 * Includes: OHLC, Volume, Momentum, and Quality Validation
 */
async function fetchInstitutionalData(symbol) {
    try {
        const period1 = new Date();
        period1.setDate(period1.getDate() - 60); // Extended to 60 days for robust indicators
        const period2 = new Date();

        const history = await yahooFinance.historical(symbol, {
            period1,
            period2,
            interval: '1h'
        });

        // FAST TRACK: Fetch LIVE quote to override the last candle (Latency Reduction)
        const quote = await yahooFinance.quote(symbol);
        const livePrice = quote.regularMarketPrice;

        if (!history || history.length < 50) {
            throw new Error(`Insufficient historical data: ${history?.length || 0} candles`);
        }

        // Filter out invalid candles
        const validHistory = history.filter(h =>
            h.open && h.high && h.low && h.close
        );

        // SYNC: Replace the latest historical close with the LIVE market price
        // This ensures indicators are calculated on the absolute current moment
        if (validHistory.length > 0) {
            const lastIndex = validHistory.length - 1;
            validHistory[lastIndex].close = livePrice;
            validHistory[lastIndex].high = Math.max(validHistory[lastIndex].high, livePrice);
            validHistory[lastIndex].low = Math.min(validHistory[lastIndex].low, livePrice);
        }

        const currentPrice = livePrice;
        const prices = validHistory.map(h => h.close);
        const volumes = validHistory.map(h => h.volume || 0);
        const lastCandle = validHistory[validHistory.length - 1];

        // LATENCY DETECTION: Check if the market is actually 'live'
        const candleAgeMinutes = (new Date() - new Date(lastCandle.date)) / (1000 * 60);
        if (candleAgeMinutes > 120) { // 2 hours delay
            console.warn(`⚠️ [${symbol}] DATA LATENCY DETECTED: Last candle is ${Math.round(candleAgeMinutes)}m old.`);
        }

        // Calculate price momentum (rate of change)
        const momentum = prices.length >= 10
            ? (prices[prices.length - 1] - prices[prices.length - 10]) / prices[prices.length - 10]
            : 0;

        // Calculate volume context
        const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
        const volumeRatio = lastCandle.volume / avgVolume;

        console.log(`📊 [${symbol}] Quality: ${validHistory.length} candles | Momentum: ${(momentum * 100).toFixed(2)}% | Vol: ${volumeRatio.toFixed(2)}x`);

        return {
            symbol,
            currentPrice,
            prices,
            volume: volumes,
            currentCandle: {
                open: lastCandle.open,
                high: lastCandle.high,
                low: lastCandle.low,
                close: lastCandle.close
            },
            direction: prices[prices.length - 1] > prices[prices.length - 2] ? 'LONG' : 'SHORT',
            metadata: {
                momentum,
                volumeRatio,
                candleCount: validHistory.length,
                dataQuality: validHistory.length / history.length
            }
        };
    } catch (error) {
        console.error(`❌ Data Fetch Fail [${symbol}]:`, error.message);
        return null;
    }
}

async function saveSignalToDB(signal, agentDecision) {
    const client = await pool.connect();
    try {
        const query = `
            INSERT INTO ai_signals (
                symbol, signal_type, predicted_close, confidence_score, 
                is_published, signal_status, last_checked_at
            )
            VALUES ($1, $2, $3, $4, TRUE, 'WAITING', NOW())
            RETURNING id
        `;
        const res = await client.query(query, [
            signal.symbol,
            signal.type,
            signal.tp,
            agentDecision.confidence
        ]);
        return res.rows[0].id;
    } catch (err) {
        console.error("❌ DB Save Error:", err.message);
        return null;
    } finally {
        client.release();
    }
}

async function runScanner() {
    console.log("🚀 Signal Genius V1.8 INSTITUTIONAL SCANNER ONLINE...");

    // First run immediately
    await scanAll();

    // Loop
    setInterval(async () => {
        await scanAll();
    }, CHECK_INTERVAL);
}

async function scanAll() {
    console.log(`\n⏰ [${new Date().toLocaleTimeString()}] Analysis Cycle Starting...`);

    // FORCED E2E TEST: Inject a signal for EURUSD=X
    const testMarketData = { symbol: 'EURUSD=X', direction: 'LONG', currentPrice: 1.1695 };
    const testDecision = { shouldEmitSignal: true, confidence: 99, reasoning: 'E2E FORCE-TRIGGER TEST ACTIVE' };

    const testSignal = {
        symbol: testMarketData.symbol,
        type: testMarketData.direction,
        entry: testMarketData.currentPrice,
        tp: testMarketData.currentPrice + 0.0050,
        sl: testMarketData.currentPrice - 0.0025
    };

    console.log(`🎯 E2E TEST SIGNAL IDENTIFIED: ${testSignal.symbol}`);
    const testId = await saveSignalToDB(testSignal, testDecision);
    if (testId) {
        await broadcastGoldenSignal({
            pair: testSignal.symbol,
            action: testSignal.type,
            entry: testSignal.entry.toFixed(5),
            sl: testSignal.sl.toFixed(5),
            tp: testSignal.tp.toFixed(5),
            agentDecision: testDecision
        });
    }

    // Simplified E2E test path
    console.log("🏁 E2E Test Cycle Completed.");
}

runScanner();
