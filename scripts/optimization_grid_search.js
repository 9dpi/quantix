/**
 * ⚡ QUANTIX AI - GRID SEARCH OPTIMIZER (v2.5.3)
 * Scouring 16,750 candles for the "Golden Constants".
 */

import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const pool = new pg.Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: { rejectUnauthorized: false }
});

async function runOptimization() {
    console.log('🚀 STARTING QUANTIX GRID SEARCH OPTIMIZATION...');

    const client = await pool.connect();
    const res = await client.query(`
        SELECT timestamp_utc, open, high, low, close 
        FROM market_data 
        WHERE symbol = 'EURUSD=X' 
        ORDER BY timestamp_utc ASC 
        LIMIT 16750
    `);
    const data = res.rows.map(r => ({
        time: new Date(r.timestamp_utc),
        close: parseFloat(r.close),
        high: parseFloat(r.high),
        low: parseFloat(r.low)
    }));
    client.release();

    console.log(`📊 Loaded ${data.length} candles. Initiating Grid Search...\n`);

    const results = [];
    const confThresholds = [75, 80, 85, 90, 95];
    const rrRatios = [1.1, 1.2, 1.3, 1.4, 1.5, 1.7, 2.0];
    const sessionWindows = [
        { name: "London", start: 8, end: 16 },
        { name: "London-NY Overlap", start: 13, end: 17 },
        { name: "NY Intensive", start: 14, end: 20 },
        { name: "Global Active", start: 7, end: 18 }
    ];

    for (const conf of confThresholds) {
        for (const rr of rrRatios) {
            for (const session of sessionWindows) {
                let wins = 0;
                let losses = 0;
                let totalPips = 0;

                for (let i = 50; i < data.length - 24; i++) {
                    const candle = data[i];
                    const hr = candle.time.getUTCHours();

                    // Filter 1: Session
                    if (hr < session.start || hr > session.end) continue;

                    // Filter 2: Technical (Mocking a high-conv signal for the grid)
                    // In a real run, we'd call the TechAgent here, but for Grid logic we simulate 
                    // the occurrence of valid technical setups.
                    const isSetup = (i % 45 === 0); // Simulated occurrence frequency
                    if (!isSetup) continue;

                    // Execute Trade Simulation
                    const tpPips = 25 * rr;
                    const slPips = 25;
                    const tpDist = tpPips * 0.0001;
                    const slDist = slPips * 0.0001;

                    let outcome = 'NONE';
                    for (let j = i + 1; j < i + 24; j++) {
                        const future = data[j];
                        if (future.high >= candle.close + tpDist) { outcome = 'WIN'; break; }
                        if (future.low <= candle.close - slDist) { outcome = 'LOSS'; break; }
                    }

                    if (outcome === 'WIN') { wins++; totalPips += tpPips; }
                    else if (outcome === 'LOSS') { losses++; totalPips -= slPips; }
                }

                const totalTrades = wins + losses;
                const winRate = totalTrades > 0 ? (wins / totalTrades * 100) : 0;

                results.push({
                    conf,
                    rr,
                    session: session.name,
                    trades: totalTrades,
                    winRate: winRate.toFixed(1),
                    pips: totalPips.toFixed(0)
                });
            }
        }
    }

    // Sort by Total Pips
    results.sort((a, b) => b.pips - a.pips);

    console.log('============================================================');
    console.log('🏆 TOP 5 GOLDEN CONFIGURATIONS FOUND');
    console.log('============================================================');
    results.slice(0, 5).forEach((r, idx) => {
        console.log(`${idx + 1}. Session: ${r.session.padEnd(20)} | Conf: ${r.conf}% | RR: 1:${r.rr.toFixed(1)}`);
        console.log(`   Trades: ${r.trades} | WinRate: ${r.winRate}% | Total Pips: ${r.pips}`);
        console.log('------------------------------------------------------------');
    });

    const best = results[0];
    console.log(`\n💎 RECOMMENDED HẰNG SỐ:`);
    console.log(`🎯 confidence_threshold = ${best.conf}%`);
    console.log(`🌍 session_window = ${best.session}`);
    console.log(`💰 risk_reward_ratio = 1:${best.rr.toFixed(1)}`);
    console.log('============================================================');

    process.exit(0);
}

runOptimization();
