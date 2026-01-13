/**
 * 🎯 QUANTIX ELITE v3.1 - THE PIN-BAR HUNTER (Backtest Engine)
 * Logic: Pin Bar (Ratio >= 2.5) + S/D Zones (500 Candle Lookback) + Dynamic Exit (50/50)
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

async function runPinBarHunter() {
    console.log(`\n============================================================`);
    console.log(`🎯 QUANTIX v3.1 - PIN-BAR HUNTER ACTIVATED`);
    console.log(`⚙️ Logic: S/D Zones Confirm + Dynamic Exit (50/50)`);
    console.log(`============================================================\n`);

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
        open: parseFloat(r.open),
        high: parseFloat(r.high),
        low: parseFloat(r.low),
        close: parseFloat(r.close)
    }));
    client.release();

    console.log(`✅ Loaded ${data.length} candles. Ingesting Supply/Demand Map...\n`);

    let totalPips = 0;
    let wins = 0;
    let losses = 0;
    let trades = [];

    for (let i = 500; i < data.length - 24; i++) {
        const c = data[i];

        // --- STEP 1: SCAN PATTERN (Ratio >= 2.5) ---
        const body = Math.abs(c.close - c.open) || 0.00001;
        const upperWick = c.high - Math.max(c.open, c.close);
        const lowerWick = Math.min(c.open, c.close) - c.low;

        let signalAction = null;
        if (lowerWick / body >= 2.5) signalAction = 'BUY';
        if (upperWick / body >= 2.5) signalAction = 'SELL';

        if (!signalAction) continue;

        // --- STEP 2: SUPPLY/DEMAND MAPPING (500 Lookback) ---
        const lookback = data.slice(i - 500, i);
        const maxHigh = Math.max(...lookback.map(l => l.high));
        const minLow = Math.min(...lookback.map(l => l.low));

        const zoneThreshold = 0.0010; // 10 pips zone
        let isInZone = false;

        if (signalAction === 'BUY' && (c.low <= minLow + zoneThreshold)) isInZone = true;
        if (signalAction === 'SELL' && (c.high >= maxHigh - zoneThreshold)) isInZone = true;

        if (!isInZone) continue; // Reject floating Pin Bars

        // --- STEP 3: DYNAMIC EXIT (50/50 Strategy) ---
        const entry = c.close;
        const slPips = 15; // Sniper stop
        const tp1Pips = 15; // RR 1:1
        const pipVal = 0.0001;

        const tp1Price = signalAction === 'BUY' ? (entry + tp1Pips * pipVal) : (entry - tp1Pips * pipVal);
        const slPrice = signalAction === 'BUY' ? (entry - slPips * pipVal) : (entry + slPips * pipVal);

        let outcome = 'LOSS';
        let pipsGained = -slPips;
        let pipsGainedHalf2 = -slPips;

        // Simulate Trade Flow
        let hitTP1 = false;
        for (let j = i + 1; j < i + 48; j++) { // Hold up to 48 candles (12h on M15)
            const f = data[j];

            // Part 1: Initial SL Check
            if (signalAction === 'BUY' && f.low <= slPrice) break;
            if (signalAction === 'SELL' && f.high >= slPrice) break;

            // Part 2: TP1 Check (50% Close at RR 1:1)
            if (!hitTP1) {
                if (signalAction === 'BUY' && f.high >= tp1Price) { hitTP1 = true; pipsGained = tp1Pips; }
                if (signalAction === 'SELL' && f.low <= tp1Price) { hitTP1 = true; pipsGained = tp1Pips; }
            }

            // Part 3: Trailing / Final Exit for Half 2
            if (hitTP1) {
                // Moving SL to Break-even for half 2
                const bePrice = entry;
                if (signalAction === 'BUY' && f.low <= bePrice) { pipsGainedHalf2 = 0; break; }
                if (signalAction === 'SELL' && f.high >= bePrice) { pipsGainedHalf2 = 0; break; }

                // Potential Gồng Lãi (Trailing 30 pips or Reversal)
                const trailingTP = 40;
                const trailPrice = signalAction === 'BUY' ? (entry + trailingTP * pipVal) : (entry - trailingTP * pipVal);
                if (signalAction === 'BUY' && f.high >= trailPrice) { pipsGainedHalf2 = trailingTP; break; }
                if (signalAction === 'SELL' && f.low <= trailPrice) { pipsGainedHalf2 = trailingTP; break; }
            }
        }

        const finalPips = (pipsGained * 0.5) + (pipsGainedHalf2 * 0.5);
        if (finalPips > 0) wins++; else losses++;
        totalPips += finalPips;

        trades.push({ time: c.time, type: signalAction, pips: finalPips });
        i += 20; // Prevent stacking trades in same zone
    }

    console.log('============================================================');
    console.log('🏆 FINAL PERFORMANCE REPORT: QUANTIX v3.1 ELITE');
    console.log('============================================================');
    console.log(`Total Scanned      : ${data.length.toLocaleString()} Candles`);
    console.log(`Trades Executed    : ${trades.length}`);
    console.log(`Win Rate           : ${((wins / trades.length) * 100).toFixed(1)}%`);
    console.log(`Net Gain (Pips)    : +${totalPips.toFixed(1)}`);
    console.log(`Average Monthly    : ~${(totalPips / 12).toFixed(1)} Pips`);
    console.log('============================================================\n');

    process.exit(0);
}

runPinBarHunter().catch(console.error);
