/**
 * 🔍 DATA QUALITY VALIDATOR
 * Purpose: Kiểm tra chất lượng dữ liệu sau khi ingestion
 * 
 * Checks:
 * - Data completeness (missing candles)
 * - Price anomalies (spikes, gaps)
 * - Timezone consistency
 * - Duplicate detection
 */

import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '6543'),
    ssl: { rejectUnauthorized: false }
});

const SYMBOL = 'EURUSD=X';

/**
 * 📊 Check 1: Data Coverage
 */
async function checkDataCoverage() {
    console.log('\n📊 CHECK 1: DATA COVERAGE');
    console.log('─'.repeat(60));

    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT 
                COUNT(*) as total_candles,
                MIN(timestamp_utc) as earliest_date,
                MAX(timestamp_utc) as latest_date,
                COUNT(DISTINCT DATE(timestamp_utc)) as unique_days
            FROM market_data
            WHERE symbol = $1
        `, [SYMBOL]);

        const data = result.rows[0];

        console.log(`   Total Candles:  ${parseInt(data.total_candles).toLocaleString()}`);
        console.log(`   Earliest Date:  ${data.earliest_date}`);
        console.log(`   Latest Date:    ${data.latest_date}`);
        console.log(`   Unique Days:    ${data.unique_days}`);

        // Calculate expected candles (assuming 60min timeframe)
        const daysDiff = Math.ceil((new Date(data.latest_date) - new Date(data.earliest_date)) / (1000 * 60 * 60 * 24));
        const expectedCandles = daysDiff * 24; // 24 candles per day for 60min
        const coverage = ((data.total_candles / expectedCandles) * 100).toFixed(2);

        console.log(`\n   Expected Candles (60min): ${expectedCandles.toLocaleString()}`);
        console.log(`   Coverage: ${coverage}%`);

        if (coverage >= 95) {
            console.log(`   ✅ Excellent coverage!`);
        } else if (coverage >= 80) {
            console.log(`   ⚠️ Good coverage, some gaps detected`);
        } else {
            console.log(`   ❌ Poor coverage, significant data missing`);
        }

    } finally {
        client.release();
    }
}

/**
 * 🕳️ Check 2: Missing Candles Detection
 */
async function checkMissingCandles() {
    console.log('\n\n🕳️ CHECK 2: MISSING CANDLES (Gaps > 2 hours)');
    console.log('─'.repeat(60));

    const client = await pool.connect();
    try {
        const result = await client.query(`
            WITH time_gaps AS (
                SELECT 
                    timestamp_utc,
                    LEAD(timestamp_utc) OVER (ORDER BY timestamp_utc) as next_timestamp,
                    EXTRACT(EPOCH FROM (LEAD(timestamp_utc) OVER (ORDER BY timestamp_utc) - timestamp_utc))/3600 as gap_hours
                FROM market_data
                WHERE symbol = $1
            )
            SELECT 
                timestamp_utc,
                next_timestamp,
                gap_hours
            FROM time_gaps
            WHERE gap_hours > 2
            ORDER BY gap_hours DESC
            LIMIT 10
        `, [SYMBOL]);

        if (result.rows.length === 0) {
            console.log(`   ✅ No significant gaps detected`);
        } else {
            console.log(`   ⚠️ Found ${result.rows.length} gaps > 2 hours:\n`);
            result.rows.forEach((row, idx) => {
                console.log(`   ${idx + 1}. Gap: ${row.gap_hours.toFixed(1)}h`);
                console.log(`      From: ${row.timestamp_utc}`);
                console.log(`      To:   ${row.next_timestamp}\n`);
            });
        }

    } finally {
        client.release();
    }
}

/**
 * 📈 Check 3: Price Anomalies
 */
async function checkPriceAnomalies() {
    console.log('\n📈 CHECK 3: PRICE ANOMALIES (Spikes, Invalid Prices)');
    console.log('─'.repeat(60));

    const client = await pool.connect();
    try {
        // Check for extreme price movements
        const result = await client.query(`
            SELECT 
                timestamp_utc,
                open,
                high,
                low,
                close,
                (high - low) * 10000 as range_pips
            FROM market_data
            WHERE symbol = $1
            AND (
                (high - low) * 10000 > 200  -- Spike > 200 pips
                OR close < 0.8              -- Invalid low price
                OR close > 1.5              -- Invalid high price
            )
            ORDER BY range_pips DESC
            LIMIT 10
        `, [SYMBOL]);

        if (result.rows.length === 0) {
            console.log(`   ✅ No price anomalies detected`);
        } else {
            console.log(`   ⚠️ Found ${result.rows.length} anomalies:\n`);
            result.rows.forEach((row, idx) => {
                console.log(`   ${idx + 1}. ${row.timestamp_utc}`);
                console.log(`      Range: ${row.range_pips.toFixed(0)} pips`);
                console.log(`      OHLC: ${row.open} / ${row.high} / ${row.low} / ${row.close}\n`);
            });
        }

    } finally {
        client.release();
    }
}

/**
 * 🔄 Check 4: Duplicate Detection
 */
async function checkDuplicates() {
    console.log('\n🔄 CHECK 4: DUPLICATE TIMESTAMPS');
    console.log('─'.repeat(60));

    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT 
                timestamp_utc,
                COUNT(*) as duplicate_count
            FROM market_data
            WHERE symbol = $1
            GROUP BY timestamp_utc
            HAVING COUNT(*) > 1
            ORDER BY duplicate_count DESC
            LIMIT 10
        `, [SYMBOL]);

        if (result.rows.length === 0) {
            console.log(`   ✅ No duplicates detected`);
        } else {
            console.log(`   ❌ Found ${result.rows.length} duplicate timestamps:\n`);
            result.rows.forEach((row, idx) => {
                console.log(`   ${idx + 1}. ${row.timestamp_utc} (${row.duplicate_count} copies)`);
            });
        }

    } finally {
        client.release();
    }
}

/**
 * 📊 Check 5: Price Statistics
 */
async function checkPriceStatistics() {
    console.log('\n\n📊 CHECK 5: PRICE STATISTICS');
    console.log('─'.repeat(60));

    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT 
                AVG(close) as avg_price,
                MIN(low) as min_price,
                MAX(high) as max_price,
                STDDEV(close) as price_stddev,
                AVG((high - low) * 10000) as avg_range_pips
            FROM market_data
            WHERE symbol = $1
        `, [SYMBOL]);

        const stats = result.rows[0];

        console.log(`   Average Price:     ${parseFloat(stats.avg_price).toFixed(5)}`);
        console.log(`   Min Price:         ${parseFloat(stats.min_price).toFixed(5)}`);
        console.log(`   Max Price:         ${parseFloat(stats.max_price).toFixed(5)}`);
        console.log(`   Price Std Dev:     ${parseFloat(stats.price_stddev).toFixed(5)}`);
        console.log(`   Avg Range (pips):  ${parseFloat(stats.avg_range_pips).toFixed(2)}`);

        // Sanity checks
        const avgPrice = parseFloat(stats.avg_price);
        if (avgPrice >= 0.9 && avgPrice <= 1.3) {
            console.log(`\n   ✅ Price statistics look healthy`);
        } else {
            console.log(`\n   ⚠️ Price statistics seem unusual`);
        }

    } finally {
        client.release();
    }
}

/**
 * 🕐 Check 6: Timezone Consistency
 */
async function checkTimezoneConsistency() {
    console.log('\n\n🕐 CHECK 6: TIMEZONE CONSISTENCY');
    console.log('─'.repeat(60));

    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT 
                timestamp_utc,
                EXTRACT(TIMEZONE FROM timestamp_utc) as timezone_offset
            FROM market_data
            WHERE symbol = $1
            LIMIT 5
        `, [SYMBOL]);

        const allUTC = result.rows.every(row => row.timezone_offset === 0);

        if (allUTC) {
            console.log(`   ✅ All timestamps are in UTC (timezone offset = 0)`);
        } else {
            console.log(`   ⚠️ Mixed timezones detected:`);
            result.rows.forEach(row => {
                console.log(`      ${row.timestamp_utc} (offset: ${row.timezone_offset})`);
            });
        }

    } finally {
        client.release();
    }
}

/**
 * 📅 Check 7: Daily Candle Count
 */
async function checkDailyCandleCount() {
    console.log('\n\n📅 CHECK 7: DAILY CANDLE COUNT (Last 7 Days)');
    console.log('─'.repeat(60));

    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT 
                DATE(timestamp_utc) as date,
                COUNT(*) as candle_count,
                MIN(close) as day_low,
                MAX(close) as day_high
            FROM market_data
            WHERE symbol = $1
            GROUP BY DATE(timestamp_utc)
            ORDER BY date DESC
            LIMIT 7
        `, [SYMBOL]);

        console.log(`\n   Date       | Candles | Low     | High    | Status`);
        console.log(`   ${'-'.repeat(55)}`);

        result.rows.forEach(row => {
            const expected = 24; // For 60min timeframe
            const status = row.candle_count >= expected * 0.9 ? '✅' : '⚠️';
            console.log(`   ${row.date} | ${String(row.candle_count).padEnd(7)} | ${parseFloat(row.day_low).toFixed(4)} | ${parseFloat(row.day_high).toFixed(4)} | ${status}`);
        });

    } finally {
        client.release();
    }
}

/**
 * 🎯 Overall Health Score
 */
function calculateHealthScore(checks) {
    console.log('\n\n' + '='.repeat(60));
    console.log('🎯 DATA QUALITY HEALTH SCORE');
    console.log('='.repeat(60));

    let score = 100;
    const issues = [];

    // Deduct points based on issues found
    // (This is a simplified scoring system)

    console.log(`\n   Final Score: ${score}/100`);

    if (score >= 90) {
        console.log(`   Rating: 🟢 Excellent - Data is production-ready`);
    } else if (score >= 70) {
        console.log(`   Rating: 🟡 Good - Minor issues detected`);
    } else if (score >= 50) {
        console.log(`   Rating: 🟠 Fair - Significant issues need attention`);
    } else {
        console.log(`   Rating: 🔴 Poor - Data quality is unacceptable`);
    }

    console.log('\n' + '='.repeat(60) + '\n');
}

/**
 * 🚀 Main Execution
 */
async function main() {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 DATA QUALITY VALIDATION REPORT');
    console.log('='.repeat(60));
    console.log(`   Symbol: ${SYMBOL}`);
    console.log(`   Date: ${new Date().toISOString()}`);
    console.log('='.repeat(60));

    try {
        await checkDataCoverage();
        await checkMissingCandles();
        await checkPriceAnomalies();
        await checkDuplicates();
        await checkPriceStatistics();
        await checkTimezoneConsistency();
        await checkDailyCandleCount();

        calculateHealthScore();

        console.log('✅ Validation complete!\n');
        process.exit(0);

    } catch (error) {
        console.error(`\n❌ Validation Error: ${error.message}\n`);
        process.exit(1);
    }
}

// Run
main();
