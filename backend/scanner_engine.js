import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();

import dotenv from 'dotenv';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';
import { analyzeSignalWithAgents } from './signal_genius_core_v1.8.js';
import { broadcastGoldenSignal } from './telegram_autopilot.js';

dotenv.config();

// Initialize Supabase for SSOT
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

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
 * FALLBACK ENGINE: Fetch data from Alpha Vantage when Yahoo fails
 */
async function fetchFromAlphaVantage(symbol) {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY || process.env.ALPHA_VANTAGE_KEY;
    if (!apiKey) {
        console.warn(`[${symbol}] Alpha Vantage Key MISSING check ALPHA_VANTAGE_KEY or ALPHA_VANTAGE_API_KEY`);
        return null;
    }

    try {
        // Map symbol to AV format
        let avSymbol = symbol.replace('=X', '');
        let functionName = 'FX_INTRADAY';
        let interval = '60min';

        let url = '';
        if (symbol.includes('BTC')) {
            functionName = 'DIGITAL_CURRENCY_DAILY';
            avSymbol = 'BTC';
            url = `https://www.alphavantage.co/query?function=${functionName}&symbol=${avSymbol}&market=USD&apikey=${apiKey}`;
        } else {
            // For Forex: From_Symbol & To_Symbol
            const base = avSymbol.substring(0, 3);
            const quote = avSymbol.substring(3, 6);
            url = `https://www.alphavantage.co/query?function=${functionName}&from_symbol=${base}&to_symbol=${quote}&interval=${interval}&apikey=${apiKey}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        // Detect API Limit or Premium Error
        if (data['Note'] || data['Information']) {
            throw new Error(`AV_LIMIT: ${data['Note'] || data['Information']}`);
        }

        const timeSeriesKey = Object.keys(data).find(k => k.includes('Time Series') || k.includes('FX Intraday'));
        if (!timeSeriesKey) throw new Error("Alpha Vantage Invalid Response");

        const timeSeries = data[timeSeriesKey];
        const dates = Object.keys(timeSeries).slice(0, 50);
        const prices = dates.map(d => parseFloat(timeSeries[d]['4. close'] || timeSeries[d]['4a. close (USD)']));

        console.log(`📡 [${symbol}] Alpha Vantage Fallback Success: $${prices[0]}`);

        return {
            symbol,
            currentPrice: prices[0],
            prices: prices.reverse(),
            dataQuality: 'DEGRADED'
        };
    } catch (err) {
        console.error(`🚨 [${symbol}] Alpha Vantage also failed:`, err.message);
        return null;
    }
}

/**
 * Fetch historical data + LIVE quote to ensure analysis is on the 'tip' of the market
 * v1.9.5 BATTLE-READY: Alpha Vantage Priority + Yahoo Fallback with Timeout
 */
async function fetchInstitutionalData(symbol) {
    // 1. PRIMARY ENGINE: Alpha Vantage (Bypasses Yahoo 429/ENETUNREACH)
    console.log(`📡 [${symbol}] Primary Engine: Attempting Alpha Vantage...`);
    const fallbackData = await fetchFromAlphaVantage(symbol);

    if (fallbackData) {
        // Alpha Vantage success - this is our "clean" data for the demo
        fallbackData.dataQuality = 'GOOD'; // Using AV as primary now
        fallbackData.metadata = { momentum: 0, volumeRatio: 1.0, candleCount: 0 };
        return fallbackData;
    }

    // 2. SECONDARY ENGINE (FALLBACK): Yahoo Finance with strict timeout
    console.warn(`⚠️ [${symbol}] Alpha Vantage failed. Falling back to Yahoo with 5s timeout...`);

    try {
        const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('Yahoo Timeout')), ms));

        const fetchYahoo = async () => {
            const period1 = new Date();
            period1.setDate(period1.getDate() - 60);
            const period2 = new Date();

            const chartResult = await yahooFinance.chart(symbol, {
                period1,
                period2,
                interval: '1h'
            });
            const history = chartResult.quotes;
            const quote = await yahooFinance.quote(symbol);
            const livePrice = quote.regularMarketPrice;

            if (!history || history.length < 10) throw new Error("Yahoo Insufficient Data");

            const validHistory = history.filter(h => h.open && h.high && h.low && h.close);

            if (validHistory.length > 0) {
                const lastIdx = validHistory.length - 1;
                validHistory[lastIdx].close = livePrice;
                validHistory[lastIdx].high = Math.max(validHistory[lastIdx].high, livePrice);
                validHistory[lastIdx].low = Math.min(validHistory[lastIdx].low, livePrice);
            }

            const prices = validHistory.map(h => h.close);
            const lastCandle = validHistory[validHistory.length - 1];

            return {
                symbol,
                currentPrice: livePrice,
                prices,
                volume: validHistory.map(h => h.volume || 0),
                currentCandle: {
                    open: lastCandle.open, high: lastCandle.high, low: lastCandle.low, close: lastCandle.close
                },
                dataQuality: 'DEGRADED', // Yahoo is now the fallback
                metadata: {
                    momentum: ((prices[prices.length - 1] - prices[prices.length - 10]) / prices[prices.length - 10]) || 0,
                    volumeRatio: 1.0,
                    candleCount: validHistory.length
                }
            };
        };

        // Race between Yahoo fetch and 5s timeout
        return await Promise.race([fetchYahoo(), timeout(5000)]);

    } catch (err) {
        console.error(`🚨 [${symbol}] ALL ENGINES FAILED:`, err.message);
        throw err;
    }
}

/**
 * SSOT WORKER: Update market_snapshot table with latest data
 * This is the SINGLE SOURCE OF TRUTH for all services
 */
async function updateSSOT(symbol, marketData, agentDecision) {
    try {
        // Get last 4 candles for pattern matching
        const last4Candles = marketData.prices.slice(-4).map((price, idx) => ({
            o: price,
            h: price * 1.001,  // Simplified - in production, use actual OHLC
            l: price * 0.999,
            c: price,
            v: marketData.volume[marketData.volume.length - 4 + idx] || 0
        }));

        const { error } = await supabase
            .from('market_snapshot')
            .upsert({
                symbol: symbol,
                price: marketData.currentPrice,
                change_24h: marketData.metadata.momentum * 100,
                high_24h: Math.max(...marketData.prices.slice(-24)),
                low_24h: Math.min(...marketData.prices.slice(-24)),
                volume: marketData.volume[marketData.volume.length - 1] || 0,
                last_candle_data: last4Candles,
                ai_status: agentDecision.action || 'NEUTRAL',
                confidence_score: agentDecision.confidence || 0,
                data_quality: marketData.metadata.candleCount >= 50 ? 'GOOD' : 'DEGRADED',
                last_updated: new Date().toISOString()
            }, {
                onConflict: 'symbol'
            });

        if (error) {
            console.error(`🚨 [SSOT_ERROR] Sync failed for ${symbol}:`, error.message);
            return false;
        }

        console.log(`✅ [SSOT_SYNC] ${symbol} updated: $${marketData.currentPrice.toFixed(5)} | ${agentDecision.action || 'NEUTRAL'} (${agentDecision.confidence || 0}%)`);
        return true;
    } catch (err) {
        console.error(`🚨 [SSOT_CRITICAL] ${symbol}:`, err.message);
        return false;
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

        // 🔥 SSOT UPDATE: Always update market_snapshot, regardless of signal
        await updateSSOT(symbol, marketData, decision);

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
    console.log("🚀 Institutional AI Scanner v1.9.4 - SSOT WORKER MODE");
    console.log(`📡 Monitoring: ${ASSETS.join(', ')}`);
    console.log(`⏱️  Interval: ${SCAN_INTERVAL / 1000}s`);
    console.log(`🔥 SSOT: Writing to market_snapshot table every cycle`);
    console.log(``);

    // Initial scan
    await scanAll();

    // Schedule scans
    setInterval(scanAll, SCAN_INTERVAL);
}

runScanner();
