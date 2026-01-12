import yahooFinance from 'yahoo-finance2';
import dotenv from 'dotenv';
import pg from 'pg';
import { analyzeSignalWithAgents } from './quantix_core_v1.8.js';
import { broadcastGoldenSignal } from './telegram_autopilot.js';

dotenv.config();

// --- CONFIGURATION ---
const ASSETS = ['EURUSD=X', 'BTC-USD', 'AAPL', 'VN30F1M'];
const TIMEFRAME = '1h';
const CHECK_INTERVAL = 120000; // 2 minutes (Increased frequency for demo)

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
 * Fetch historical data for indicators
 */
async function fetchInstitutionalData(symbol) {
    try {
        const period1 = new Date();
        period1.setDate(period1.getDate() - 30); // Last 30 days
        const period2 = new Date();

        const history = await yahooFinance.historical(symbol, {
            period1,
            period2,
            interval: '1h'
        });

        if (!history || history.length < 30) {
            throw new Error("Insufficient historical data");
        }

        const currentPrice = history[history.length - 1].close;
        const prices = history.map(h => h.close);
        const volumes = history.map(h => h.volume);
        const lastCandle = history[history.length - 1];

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
            direction: prices[prices.length - 1] > prices[prices.length - 2] ? 'LONG' : 'SHORT'
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
    console.log("🚀 QUANTIX V1.8 INSTITUTIONAL SCANNER ONLINE...");

    // First run immediately
    await scanAll();

    // Loop
    setInterval(async () => {
        await scanAll();
    }, CHECK_INTERVAL);
}

async function scanAll() {
    console.log(`\n⏰ [${new Date().toLocaleTimeString()}] Analysis Cycle Starting...`);

    for (const symbol of ASSETS) {
        const marketData = await fetchInstitutionalData(symbol);
        if (!marketData) continue;

        // Perform Multi-Agent Analysis
        const decision = await analyzeSignalWithAgents(marketData);

        if (decision.shouldEmitSignal) {
            console.log(`🎯 SIGNAL IDENTIFIED: ${symbol} (${decision.confidence}%)`);

            const signal = {
                symbol: marketData.symbol,
                type: marketData.direction,
                entry: marketData.currentPrice,
                tp: marketData.currentPrice + (marketData.direction === 'LONG' ? 0.0050 : -0.0050), // Approx 50 pips
                sl: marketData.currentPrice - (marketData.direction === 'LONG' ? 0.0025 : -0.0025)  // Approx 25 pips
            };

            const signalId = await saveSignalToDB(signal, decision);

            if (signalId) {
                // Broadcast to Telegram
                await broadcastGoldenSignal({
                    pair: symbol,
                    action: signal.type,
                    entry: signal.entry.toFixed(5),
                    sl: signal.sl.toFixed(5),
                    tp: signal.tp.toFixed(5),
                    agentDecision: decision
                });
            }
        }
    }
}

runScanner();
