/**
 * 📊 QUANTIX V3.1 - BLIND BACKTEST VALIDATION ENGINE (GIAI ĐOẠN 3)
 * 
 * Workflow:
 * 1. In-sample (70%): Verify system catches historical +129 pip setups
 * 2. Out-of-sample (30%): Test stability on recent sideways market
 * 3. Loss Audit: Analyze top 5 worst trades for SL optimization
 */

import dotenv from 'dotenv';
import pg from 'pg';
import fs from 'fs';
import { analyzeSignalWithAgents } from './signal_genius_core_v2.5_base.js';

dotenv.config();

const pool = new pg.Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: { rejectUnauthorized: false }
});

async function runBlindBacktest() {
    console.log(`\n============================================================`);
    console.log(`📊 QUANTIX V3.1 - BLIND BACKTEST VALIDATION`);
    console.log(`⚙️  70% In-sample / 30% Out-sample Walk-Forward`);
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
        timestamp: r.timestamp_utc,
        time: new Date(r.timestamp_utc),
        open: parseFloat(r.open),
        high: parseFloat(r.high),
        low: parseFloat(r.low),
        close: parseFloat(r.close)
    }));
    client.release();

    console.log(`✅ Loaded ${data.length} candles.\n`);

    // Split data
    const splitIndex = Math.floor(data.length * 0.7);
    const inSample = data.slice(0, splitIndex);
    const outSample = data.slice(splitIndex);

    console.log(`🔍 Running In-Sample Analysis (${inSample.length} candles)...`);
    const inResults = await performBlindTest(inSample, "IN-SAMPLE");

    console.log(`\n🔍 Running Out-of-Sample Analysis (${outSample.length} candles)...`);
    const outResults = await performBlindTest(outSample, "OUT-OF-SAMPLE");

    // Generate Reports
    printDetailedReport(inResults, "IN-SAMPLE (Optimization Set)");
    printDetailedReport(outResults, "OUT-OF-SAMPLE (Validation Set)");

    // Loss Audit
    auditWorstTrades(inResults.trades, outResults.trades);

    // Save to file
    const report = {
        timestamp: new Date().toISOString(),
        inSample: inResults.summary,
        outSample: outResults.summary,
        worstTrades: [...inResults.trades, ...outResults.trades]
            .filter(t => t.outcome === 'LOSS')
            .sort((a, b) => a.pips - b.pips)
            .slice(0, 5)
    };

    fs.writeFileSync('backtest_validation_report.json', JSON.stringify(report, null, 2));
    console.log(`\n📄 Full report saved to: backtest_validation_report.json\n`);

    process.exit(0);
}

async function performBlindTest(dataset, label) {
    const trades = [];
    let balance = 10000;
    let maxBalance = 10000;
    let maxDrawdown = 0;

    for (let i = 500; i < dataset.length - 48; i++) {
        const candle = dataset[i];
        const hr = candle.time.getUTCHours();

        // Session filter (7:00 - 20:00)
        if (hr < 7 || hr > 20) continue;

        const mockMarketData = {
            symbol: 'EURUSD=X',
            currentPrice: candle.close,
            currentCandle: candle,
            prices: dataset.slice(Math.max(0, i - 500), i + 1).map(c => c.close),
            volume: [1000, 1000, 1000],
            direction: 'LONG'
        };

        // Mock Date for session detection
        const originalDate = global.Date;
        global.Date = class extends Date {
            constructor() { super(); }
            getUTCHours() { return hr; }
            getUTCMinutes() { return candle.time.getUTCMinutes(); }
            toISOString() { return candle.timestamp; }
        };

        const decision = await analyzeSignalWithAgents(mockMarketData);
        global.Date = originalDate;

        if (!decision.shouldEmitSignal || decision.confidence < 85) continue;

        // Execute Trade
        const entry = candle.close;
        const slPips = decision.levels?.stop_pips || 25;
        const tpPips = decision.levels?.target_pips || 40;
        const pipVal = 0.0001;

        const action = decision.action;
        const tpPrice = action === 'BUY' ? (entry + tpPips * pipVal) : (entry - tpPips * pipVal);
        const slPrice = action === 'BUY' ? (entry - slPips * pipVal) : (entry + slPips * pipVal);

        let outcome = 'TIMEOUT';
        let pipsGained = 0;
        let maxAdverse = 0;

        for (let j = i + 1; j < Math.min(dataset.length, i + 49); j++) {
            const future = dataset[j];

            // Track max adverse movement
            const adverse = action === 'BUY' ? (entry - future.low) : (future.high - entry);
            if (adverse > maxAdverse) maxAdverse = adverse;

            // Check TP/SL
            if (action === 'BUY') {
                if (future.high >= tpPrice) { outcome = 'WIN'; pipsGained = tpPips; break; }
                if (future.low <= slPrice) { outcome = 'LOSS'; pipsGained = -slPips; break; }
            } else {
                if (future.low <= tpPrice) { outcome = 'WIN'; pipsGained = tpPips; break; }
                if (future.high >= slPrice) { outcome = 'LOSS'; pipsGained = -slPips; break; }
            }
        }

        const profit = (pipsGained / entry) * 1000;
        balance += profit;

        if (balance > maxBalance) maxBalance = balance;
        const dd = ((maxBalance - balance) / maxBalance) * 100;
        if (dd > maxDrawdown) maxDrawdown = dd;

        trades.push({
            time: candle.time.toISOString(),
            type: action,
            entry,
            tp: tpPrice,
            sl: slPrice,
            outcome,
            pips: pipsGained,
            maxAdversePips: (maxAdverse / pipVal).toFixed(1),
            balance: balance.toFixed(2),
            strategy: decision.strategy || 'UNKNOWN'
        });

        i += 12; // Cooldown
    }

    const wins = trades.filter(t => t.outcome === 'WIN').length;
    const losses = trades.filter(t => t.outcome === 'LOSS').length;
    const winRate = trades.length > 0 ? (wins / trades.length * 100).toFixed(1) : 0;
    const totalPips = trades.reduce((sum, t) => sum + t.pips, 0);
    const avgWin = wins > 0 ? (trades.filter(t => t.pips > 0).reduce((s, t) => s + t.pips, 0) / wins).toFixed(1) : 0;
    const avgLoss = losses > 0 ? Math.abs(trades.filter(t => t.pips < 0).reduce((s, t) => s + t.pips, 0) / losses).toFixed(1) : 0;
    const profitFactor = avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : 'N/A';

    return {
        trades,
        summary: {
            totalTrades: trades.length,
            wins,
            losses,
            winRate: parseFloat(winRate),
            totalPips: totalPips.toFixed(1),
            avgWin,
            avgLoss,
            profitFactor,
            maxDrawdown: maxDrawdown.toFixed(2),
            finalBalance: balance.toFixed(2)
        }
    };
}

function printDetailedReport(results, label) {
    const s = results.summary;
    console.log(`\n📊 DETAILED REPORT: ${label}`);
    console.log(`------------------------------------------------------------`);
    console.log(`Total Trades       : ${s.totalTrades}`);
    console.log(`Wins / Losses      : ${s.wins} / ${s.losses}`);
    console.log(`Win Rate           : ${s.winRate}%`);
    console.log(`Total Pips         : ${s.totalPips}`);
    console.log(`Avg Win            : +${s.avgWin} pips`);
    console.log(`Avg Loss           : -${s.avgLoss} pips`);
    console.log(`Profit Factor      : ${s.profitFactor}`);
    console.log(`Max Drawdown       : ${s.maxDrawdown}%`);
    console.log(`Final Balance      : $${s.finalBalance}`);
    console.log(`------------------------------------------------------------`);
}

function auditWorstTrades(inTrades, outTrades) {
    const allLosses = [...inTrades, ...outTrades]
        .filter(t => t.outcome === 'LOSS')
        .sort((a, b) => a.pips - b.pips)
        .slice(0, 5);

    console.log(`\n🔍 LOSS AUDIT: Top 5 Worst Trades`);
    console.log(`------------------------------------------------------------`);
    allLosses.forEach((t, idx) => {
        console.log(`${idx + 1}. ${t.time} | ${t.type} @ ${t.entry} | Loss: ${t.pips} pips | Max Adverse: ${t.maxAdversePips} pips`);
    });
    console.log(`------------------------------------------------------------`);
    console.log(`💡 Recommendation: Review SL placement for trades with Max Adverse < 15 pips`);
}

runBlindBacktest().catch(console.error);
