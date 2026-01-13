import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();

import dns from 'node:dns';
if (dns.setDefaultResultOrder) dns.setDefaultResultOrder('ipv4first');

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
const ASSETS = ['EURUSD=X'];
const SCAN_INTERVAL = 30000; // 30 seconds
const DATA_MODE = process.env.DATA_MODE || 'PRODUCTION_STRICT';

const pool = new pg.Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: { rejectUnauthorized: false }
});

/**
 * PRODUCTION STRICT MODE: Alpha Vantage ONLY - NO MOCK DATA
 */
async function fetchFromAlphaVantage(symbol) {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY || process.env.ALPHA_VANTAGE_KEY;
    if (!apiKey) {
        throw new Error(`[${symbol}] CRITICAL: Alpha Vantage API Key MISSING - Cannot operate in PRODUCTION_STRICT mode`);
    }

    try {
        let avSymbol = symbol.replace('=X', '');
        let url = '';

        if (symbol.includes('BTC')) {
            url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=BTC&to_currency=USD&apikey=${apiKey}`;
        } else {
            const base = avSymbol.substring(0, 3);
            const quote = avSymbol.substring(3, 6);
            url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${base}&to_currency=${quote}&apikey=${apiKey}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        const rateData = data['Realtime Currency Exchange Rate'];
        if (!rateData) {
            throw new Error(`Alpha Vantage API Error: ${data['Note'] || data['Information'] || 'Unknown error'}`);
        }

        const price = parseFloat(rateData['5. Exchange Rate']);
        const lastRefreshed = rateData['6. Last Refreshed'];

        console.log(`✅ [${symbol}] Alpha Vantage SUCCESS: $${price} (Refreshed: ${lastRefreshed})`);

        return {
            symbol: symbol,
            currentPrice: price,
            prices: [price], // Single real price point
            volume: [0], // AV doesn't provide volume for FX
            dataQuality: 'GOOD',
            lastRefreshed: lastRefreshed,
            metadata: {
                source: 'Alpha Vantage',
                candleCount: 1,
                momentum: 0,
                isReal: true
            }
        };
    } catch (e) {
        console.error(`🚨 [${symbol}] Alpha Vantage CRITICAL ERROR:`, e.message);
        throw e; // Re-throw to trigger system halt
    }
}

/**
 * FALLBACK: Yahoo Finance (Secondary only)
 */
async function fetchFromYahoo(symbol) {
    try {
        const result = await yahooFinance.quote(symbol);
        if (result && result.regularMarketPrice) {
            console.log(`✅ [${symbol}] Yahoo Fallback SUCCESS: $${result.regularMarketPrice}`);
            return {
                symbol: symbol,
                currentPrice: result.regularMarketPrice,
                prices: [result.regularMarketPrice],
                volume: [result.regularMarketVolume || 0],
                dataQuality: 'DEGRADED',
                metadata: {
                    source: 'Yahoo Finance',
                    candleCount: 1,
                    momentum: 0,
                    isReal: true
                }
            };
        }
        throw new Error('Yahoo returned no data');
    } catch (err) {
        console.error(`🚨 [${symbol}] Yahoo FAILED:`, err.message);
        throw err;
    }
}

/**
 * PRODUCTION_STRICT: Real data ONLY - System halts if unavailable
 */
async function fetchInstitutionalData(symbol) {
    console.log(`📡 [${symbol}] PRODUCTION_STRICT Mode: Fetching REAL data...`);

    try {
        // PRIMARY: Alpha Vantage
        const data = await fetchFromAlphaVantage(symbol);
        return data;
    } catch (primaryError) {
        console.error(`❌ PRIMARY SOURCE FAILED:`, primaryError.message);

        if (DATA_MODE === 'PRODUCTION_STRICT') {
            // STRICT MODE: No fallback, system must halt
            throw new Error(`CORE_DATA_UNAVAILABLE: ${primaryError.message}`);
        }

        // FALLBACK MODE: Try Yahoo
        console.warn(`⚠️ Attempting Yahoo fallback...`);
        try {
            const data = await fetchFromYahoo(symbol);
            return data;
        } catch (fallbackError) {
            throw new Error(`ALL_SOURCES_FAILED: Primary=${primaryError.message}, Fallback=${fallbackError.message}`);
        }
    }
}

/**
 * Handle saving signals to DB
 */
async function saveSignalToDB(signal) {
    try {
        const { error } = await supabase
            .from('ai_signals')
            .insert([{
                symbol: signal.symbol,
                action: signal.action,
                entry_price: signal.entry_price,
                tp: signal.tp,
                sl: signal.sl,
                confidence: signal.confidence,
                ai_status: signal.ai_status,
                metadata: signal.metadata,
                timestamp: new Date().toISOString()
            }]);

        if (error) throw error;
        console.log(`✅ [DB] Signal saved for ${signal.symbol}`);
    } catch (e) {
        console.error('❌ [DB SAVE ERROR]', e);
    }
}

/**
 * Update SSOT with REAL data only
 */
async function updateSSOT(symbol, marketData, decision) {
    try {
        const payload = {
            symbol: symbol,
            price: marketData.currentPrice,
            ai_status: decision.action === 'WAVE_SYNC' ? 'NEUTRAL' : decision.action,
            confidence_score: decision.confidence,
            last_candle_data: {
                price: marketData.currentPrice,
                source: marketData.metadata.source,
                lastRefreshed: marketData.lastRefreshed || new Date().toISOString()
            },
            data_quality: marketData.dataQuality,
            last_updated: new Date().toISOString()
        };

        const { error } = await supabase
            .from('market_snapshot')
            .upsert(payload, { onConflict: 'symbol' });

        if (error) throw error;
        console.log(`🔄 [SSOT] ${symbol} @ ${marketData.currentPrice.toFixed(5)} [${payload.data_quality}] Source: ${marketData.metadata.source}`);
    } catch (e) {
        console.error('❌ [SSOT SYNC ERROR]', e);
    }
}

/**
 * Send critical alert to Telegram Admin
 */
async function sendCriticalAlert(message) {
    try {
        const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
        const ADMIN_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

        if (!TELEGRAM_TOKEN || !ADMIN_CHAT_ID) return;

        const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: ADMIN_CHAT_ID,
                text: `🚨 CRITICAL SYSTEM ALERT\n\n${message}\n\nTime: ${new Date().toISOString()}`,
                parse_mode: 'Markdown'
            })
        });
    } catch (e) {
        console.error('Failed to send Telegram alert:', e);
    }
}

async function scanAll() {
    console.log(`\n⏰ [${new Date().toLocaleTimeString()}] Scan Cycle Starting...`);

    for (const symbol of ASSETS) {
        try {
            const marketData = await fetchInstitutionalData(symbol);

            // Fast-track price update
            console.log(`⚡ [SSOT_FAST_TRACK] Updating ${symbol}...`);
            await updateSSOT(symbol, marketData, { action: 'WAVE_SYNC', confidence: 0 });

            // AI Analysis
            const decision = await analyzeSignalWithAgents(marketData);
            await updateSSOT(symbol, marketData, decision);

            if (decision.shouldEmitSignal || decision.isGhostSignal) {
                const signalBody = {
                    symbol,
                    action: decision.action,
                    entry_price: marketData.currentPrice,
                    tp: decision.tp,
                    sl: decision.sl,
                    confidence: decision.confidence,
                    ai_status: decision.action,
                    metadata: {
                        agents: decision.agents,
                        market_state: decision.market_state,
                        source: marketData.metadata.source
                    }
                };

                await saveSignalToDB(signalBody);

                if (decision.shouldEmitSignal) {
                    await broadcastGoldenSignal(signalBody);
                }
            }
        } catch (error) {
            console.error(`💥 CRITICAL ERROR for ${symbol}:`, error.message);

            // Send alert to admin
            await sendCriticalAlert(`Scanner failed for ${symbol}\n\nError: ${error.message}\n\nSystem will retry in 30s.`);

            if (DATA_MODE === 'PRODUCTION_STRICT' && error.message.includes('CORE_DATA_UNAVAILABLE')) {
                console.error('🛑 PRODUCTION_STRICT MODE: Halting system due to data unavailability');
                // Don't exit process, just skip this cycle
                continue;
            }
        }
    }
}

async function runScanner() {
    console.log('\n🚀 Quantix Scanner v2.0.0 - PRODUCTION STRICT MODE');
    console.log(`📡 Monitoring: ${ASSETS.join(', ')}`);
    console.log(`⏱️  Interval: ${SCAN_INTERVAL / 1000}s`);
    console.log(`🔒 Data Mode: ${DATA_MODE}`);
    console.log('✅ ZERO MOCK DATA - 100% REAL ONLY\n');

    // Verify API key on startup
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY || process.env.ALPHA_VANTAGE_KEY;
    if (!apiKey) {
        const msg = '🚨 FATAL: No Alpha Vantage API Key configured. System cannot start.';
        console.error(msg);
        await sendCriticalAlert(msg);
        process.exit(1);
    }

    // Run first scan immediately
    await scanAll();

    // Set interval for subsequent scans
    setInterval(scanAll, SCAN_INTERVAL);
}

// Global error handler
process.on('uncaughtException', async (err) => {
    console.error('💥 UNCAUGHT EXCEPTION:', err);
    await sendCriticalAlert(`Uncaught Exception: ${err.message}\n\nStack: ${err.stack}`);
});

process.on('unhandledRejection', async (reason, promise) => {
    console.error('💥 UNHANDLED REJECTION:', reason);
    await sendCriticalAlert(`Unhandled Rejection: ${reason}`);
});

runScanner();
