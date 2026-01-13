/**
 * 🕵️ QUANTIX AI - PATTERN HUNTER (v3.0 DISCOVERY)
 * Hunting for profitable price patterns across 16,750 candles.
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

const ARGS = process.argv.slice(2);
const PAIR = ARGS.find(a => a.startsWith('--pair='))?.split('=')[1] || 'EURUSD';
const SYMBOL = PAIR.includes('=') ? PAIR : `${PAIR}=X`;
const MODE = ARGS.find(a => a.startsWith('--mode='))?.split('=')[1] || 'DISCOVERY';
const ITERATIONS = parseInt(ARGS.find(a => a.startsWith('--iterations='))?.split('=')[1] || '50');

async function huntPatterns() {
    console.log(`\n============================================================`);
    console.log(`🕵️  QUANTIX PATTERN HUNTER - MODE: ${MODE}`);
    console.log(`📊 Asset: ${SYMBOL} | Limit: 16,750 Candles`);
    console.log(`============================================================\n`);

    const client = await pool.connect();
    const res = await client.query(`
        SELECT timestamp_utc, open, high, low, close 
        FROM market_data 
        WHERE symbol = $1 
        ORDER BY timestamp_utc ASC 
        LIMIT 16750
    `, [SYMBOL]);
    const data = res.rows.map(r => ({
        time: new Date(r.timestamp_utc),
        open: parseFloat(r.open),
        high: parseFloat(r.high),
        low: parseFloat(r.low),
        close: parseFloat(r.close)
    }));
    client.release();

    if (data.length < 50) {
        console.log("❌ Error: Not enough data for pattern hunting.");
        process.exit(1);
    }

    console.log(`✅ Loaded ${data.length} candles. Searching for top ${ITERATIONS} setups...\n`);

    const discoveredPatterns = [];

    // Define some heuristics for pattern discovery
    for (let i = 20; i < data.length - 24; i++) {
        const current = data[i];
        const prev = data[i - 1];

        // Pattern 1: Bullish Pin Bar / Engulfing
        const isBullishEngulfing = current.close > prev.open && current.open < prev.close && prev.close < prev.open;
        const bodySize = Math.abs(current.close - current.open);
        const lowerWick = Math.min(current.open, current.close) - current.low;
        const isBullishPinBar = lowerWick > (bodySize * 2);

        // Pattern 2: Bearish Pin Bar / Engulfing
        const isBearishEngulfing = current.close < prev.open && current.open > prev.close && prev.close > prev.open;
        const upperWick = current.high - Math.max(current.open, current.close);
        const isBearishPinBar = upperWick > (bodySize * 2);

        if (isBullishEngulfing || isBullishPinBar || isBearishEngulfing || isBearishPinBar) {
            const action = (isBullishEngulfing || isBullishPinBar) ? 'BUY' : 'SELL';

            // Check potential outcome (Price movement in next 12 candles)
            const tpDist = 0.0020; // 20 pips
            const slDist = 0.0010; // 10 pips

            let result = 'TIMEOUT';
            let maxPips = 0;

            for (let j = i + 1; j < Math.min(data.length, i + 13); j++) {
                const future = data[j];
                const move = action === 'BUY' ? (future.high - current.close) : (current.close - future.low);
                const drawdown = action === 'BUY' ? (current.close - future.low) : (future.high - current.close);

                if (move > maxPips) maxPips = move;
                if (move >= tpDist) { result = 'WIN'; break; }
                if (drawdown >= slDist) { result = 'LOSS'; break; }
            }

            discoveredPatterns.push({
                time: current.time,
                action,
                pips: (maxPips / 0.0001).toFixed(1),
                result,
                pattern: isBullishEngulfing ? 'Bullish Engulfing' :
                    isBullishPinBar ? 'Bullish Pin Bar' :
                        isBearishEngulfing ? 'Bearish Engulfing' : 'Bearish Pin Bar'
            });
        }
    }

    // Sort by "best" potential (highest pips move even if timed out)
    discoveredPatterns.sort((a, b) => b.pips - a.pips);

    const topPatterns = discoveredPatterns.slice(0, ITERATIONS);

    console.log(`🏆 FOUND TOP ${topPatterns.length} PATTERNS:\n`);
    console.log(`| Time (UTC)       | Pattern Type         | Action | Max Potential | Result  |`);
    console.log(`| :--------------- | :------------------- | :----- | :------------ | :------ |`);
    topPatterns.forEach(p => {
        const timeStr = p.time.toISOString().replace('T', ' ').slice(0, 16);
        console.log(`| ${timeStr} | ${p.pattern.padEnd(20)} | ${p.action.padEnd(6)} | +${p.pips.padStart(5)} pips | ${p.result.padEnd(7)} |`);
    });

    const wins = discoveredPatterns.filter(p => p.result === 'WIN').length;
    const losses = discoveredPatterns.filter(p => p.result === 'LOSS').length;
    console.log(`\n============================================================`);
    console.log(`📈 GLOBAL STATS FOR DISCOVERED PATTERNS:`);
    console.log(`- Total Found: ${discoveredPatterns.length}`);
    console.log(`- Win Rate (20p TP / 10p SL): ${((wins / (wins + losses)) * 100 || 0).toFixed(1)}%`);
    console.log(`- High-Potential Setups: ${discoveredPatterns.filter(p => parseFloat(p.pips) > 30).length}`);
    console.log(`============================================================\n`);

    process.exit(0);
}

huntPatterns().catch(console.error);
