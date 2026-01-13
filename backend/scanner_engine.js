import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();

import dotenv from 'dotenv';
import pg from 'pg';
import { analyzeSignalWithAgents } from './signal_genius_core_v1.8.js';
import { broadcastGoldenSignal } from './telegram_autopilot.js';

dotenv.config();

// --- CONFIGURATION ---
const ASSETS = ['EURUSD=X', 'BTC-USD', 'AAPL', 'VN30F1M'];
const SCAN_INTERVAL = 60000; // 60 seconds

const pool = new pg.Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: { rejectUnauthorized: false }
});

/**
 * Fetch historical data + LIVE quote to ensure analysis is on the 'tip' of the market
 */
async function fetchInstitutionalData(symbol) {
    try {
        const period1 = new Date();
        period1.setDate(period1.getDate() - 60); // Extended to 60 days for robust indicators
        const period2 = new Date();

        const chartResult = await yahooFinance.chart(symbol, {
            period1,
            period2,
            interval: '1h'
        });
        const history = chartResult.quotes;

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

        // LATENCY DETECTION
        const candleAgeMinutes = (new Date() - new Date(lastCandle.date)) / (1000 * 60);
        if (candleAgeMinutes > 120) {
            console.warn(`⚠️ [${symbol}] DATA LATENCY DETECTED: Last candle is ${Math.round(candleAgeMinutes)}m old.`);
        }

        const momentum = prices.length >= 10
            ? (prices[prices.length - 1] - prices[prices.length - 10]) / prices[prices.length - 10]
            : 0;

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

async function scanAll() {
    console.log(`\n⏰ [${new Date().toLocaleTimeString()}] Analysis Cycle Starting...`);

    for (const symbol of ASSETS) {
        const marketData = await fetchInstitutionalData(symbol);
        if (!marketData) continue;

        // Perform Multi-Agent Analysis
        const decision = await analyzeSignalWithAgents(marketData);

        if (decision.shouldEmitSignal || decision.isGhostSignal) {
            console.log(`🎯 SIGNAL IDENTIFIED: ${symbol} (${decision.confidence}%)${decision.isGhostSignal ? ' [GHOST MODE]' : ''}`);

            const signal = {
                symbol: marketData.symbol,
                type: marketData.direction,
                entry: marketData.currentPrice,
                tp: marketData.currentPrice + (marketData.direction === 'LONG' ? 0.0050 : -0.0050),
                sl: marketData.currentPrice - (marketData.direction === 'LONG' ? 0.0025 : -0.0025)
            };

            const signalId = await saveSignalToDB(signal, decision);

            if (signalId && decision.shouldEmitSignal) {
                // Only broadcast to Telegram if it's NOT a ghost signal
                await broadcastGoldenSignal({
                    pair: symbol,
                    action: signal.type,
                    entry: signal.entry.toFixed(5),
                    sl: signal.sl.toFixed(5),
                    tp: signal.tp.toFixed(5),
                    agentDecision: decision
                });
            } else if (signalId && decision.isGhostSignal) {
                console.log(`👻 [GHOST MODE] Signal ${signalId} saved to database for audit. Skipping broadcast.`);
            }
        }
    }
}

async function runScanner() {
    console.log("🚀 Institutional AI Scanner v1.8 - ACTIVE");
    console.log(`📡 Monitoring: ${ASSETS.join(', ')}`);
    console.log(`⏱️  Interval: ${SCAN_INTERVAL / 1000}s`);

    // Initial scan
    await scanAll();

    // Schedule scans
    setInterval(scanAll, SCAN_INTERVAL);
}

runScanner();
