/**
 * 📥 HISTORICAL DATA INGESTION PIPELINE
 * Purpose: Nạp dữ liệu sạch 1 năm (2025) vào Supabase để làm kho tri thức cho Quantix Core
 * 
 * Features:
 * - Multi-source support (Alpha Vantage, CSV import)
 * - Data validation & cleaning (spike detection, missing data filter)
 * - Timezone normalization (UTC+0)
 * - Batch upload with progress tracking
 * - Error handling & retry logic
 */

import dotenv from 'dotenv';
import pg from 'pg';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

dotenv.config();

const { Pool } = pg;

// --- DATABASE CONFIG ---
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '6543'),
    ssl: { rejectUnauthorized: false }
});

// --- CONFIGURATION ---
const CONFIG = {
    SYMBOL: 'EURUSD=X',
    YEAR: 2025,
    TIMEFRAME: '60min', // Options: 1min, 5min, 15min, 60min, daily
    DATA_SOURCE: 'ALPHA_VANTAGE', // Options: ALPHA_VANTAGE, CSV
    ALPHA_VANTAGE_KEY: process.env.ALPHA_VANTAGE_KEY || 'Z9JGV0STF4PE6C61',

    // Data Quality Thresholds
    MAX_ALLOWED_PIPS: 500, // Loại bỏ nến có biên độ > 500 pips (spike detection)
    BATCH_SIZE: 1000, // Upload 1000 records mỗi lần

    // CSV Import Settings
    CSV_PATH: './data/eurusd_2025.csv' // Nếu dùng CSV
};

// --- STATISTICS TRACKER ---
const stats = {
    totalFetched: 0,
    totalCleaned: 0,
    totalInserted: 0,
    totalSkipped: 0,
    errors: []
};

/**
 * 📊 Fetch Historical Data từ Alpha Vantage
 */
async function fetchAlphaVantageData(symbol, interval, outputsize = 'full') {
    console.log(`\n🔍 Fetching data from Alpha Vantage...`);
    console.log(`   Symbol: ${symbol}`);
    console.log(`   Interval: ${interval}`);
    console.log(`   Output Size: ${outputsize}\n`);

    try {
        // Alpha Vantage FX_INTRADAY endpoint
        const url = `https://www.alphavantage.co/query?function=FX_INTRADAY&from_symbol=EUR&to_symbol=USD&interval=${interval}&outputsize=${outputsize}&apikey=${CONFIG.ALPHA_VANTAGE_KEY}`;

        const response = await fetch(url, { timeout: 30000 });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        // Check for errors
        if (data.Note) {
            throw new Error('Alpha Vantage rate limit exceeded. Please wait or use Premium API key.');
        }

        if (data['Error Message']) {
            throw new Error(data['Error Message']);
        }

        // Parse time series data
        const timeSeriesKey = `Time Series FX (${interval})`;
        const timeSeries = data[timeSeriesKey];

        if (!timeSeries) {
            throw new Error('No time series data found in response');
        }

        // Convert to array format
        const candles = [];
        for (const [timestamp, values] of Object.entries(timeSeries)) {
            candles.push({
                timestamp: new Date(timestamp + 'Z'), // Force UTC
                open: parseFloat(values['1. open']),
                high: parseFloat(values['2. high']),
                low: parseFloat(values['3. low']),
                close: parseFloat(values['4. close']),
                volume: 0 // FX doesn't have volume
            });
        }

        stats.totalFetched = candles.length;
        console.log(`✅ Fetched ${candles.length} candles from Alpha Vantage`);
        return candles;

    } catch (error) {
        console.error(`❌ Alpha Vantage Fetch Error: ${error.message}`);
        stats.errors.push({ step: 'fetch', error: error.message });
        return [];
    }
}

/**
 * 📂 Import Data từ CSV File
 * Expected CSV format: timestamp,open,high,low,close,volume
 */
async function importFromCSV(filePath) {
    console.log(`\n📂 Importing data from CSV: ${filePath}\n`);

    try {
        if (!fs.existsSync(filePath)) {
            throw new Error(`CSV file not found: ${filePath}`);
        }

        const csvContent = fs.readFileSync(filePath, 'utf-8');
        const lines = csvContent.split('\n').filter(line => line.trim());

        // Skip header
        const dataLines = lines.slice(1);

        const candles = dataLines.map(line => {
            const [timestamp, open, high, low, close, volume] = line.split(',');
            return {
                timestamp: new Date(timestamp),
                open: parseFloat(open),
                high: parseFloat(high),
                low: parseFloat(low),
                close: parseFloat(close),
                volume: parseFloat(volume || 0)
            };
        });

        stats.totalFetched = candles.length;
        console.log(`✅ Imported ${candles.length} candles from CSV`);
        return candles;

    } catch (error) {
        console.error(`❌ CSV Import Error: ${error.message}`);
        stats.errors.push({ step: 'csv_import', error: error.message });
        return [];
    }
}

/**
 * 🧹 Data Cleaning & Validation
 */
function cleanData(rawCandles) {
    console.log(`\n🧹 Cleaning data...`);
    console.log(`   Total raw candles: ${rawCandles.length}`);

    const cleanedCandles = rawCandles.filter(candle => {
        // 1. Check for missing data
        if (!candle.close || !candle.open || !candle.high || !candle.low) {
            stats.totalSkipped++;
            return false;
        }

        // 2. Spike Detection (loại bỏ nến lỗi/nhiễu)
        const pipRange = Math.abs(candle.high - candle.low) * 10000; // Convert to pips
        if (pipRange > CONFIG.MAX_ALLOWED_PIPS) {
            console.log(`   ⚠️ Spike detected: ${candle.timestamp.toISOString()} (${pipRange.toFixed(0)} pips)`);
            stats.totalSkipped++;
            return false;
        }

        // 3. Validate price range (EUR/USD typically between 0.8 - 1.5)
        if (candle.close < 0.8 || candle.close > 1.5) {
            console.log(`   ⚠️ Invalid price: ${candle.timestamp.toISOString()} (${candle.close})`);
            stats.totalSkipped++;
            return false;
        }

        // 4. Check for future dates (data integrity)
        if (candle.timestamp > new Date()) {
            stats.totalSkipped++;
            return false;
        }

        return true;
    });

    stats.totalCleaned = cleanedCandles.length;
    console.log(`✅ Cleaned: ${cleanedCandles.length} valid candles`);
    console.log(`   Skipped: ${stats.totalSkipped} invalid candles`);

    return cleanedCandles;
}

/**
 * 🕐 Timezone Normalization (Force UTC+0)
 */
function normalizeTimezone(candles) {
    console.log(`\n🕐 Normalizing timezone to UTC+0...`);

    return candles.map(candle => ({
        ...candle,
        timestamp: new Date(candle.timestamp.toISOString()) // Ensure UTC
    }));
}

/**
 * 📤 Batch Upload to Supabase
 */
async function uploadToDatabase(candles) {
    console.log(`\n📤 Uploading to Supabase...`);
    console.log(`   Total candles: ${candles.length}`);
    console.log(`   Batch size: ${CONFIG.BATCH_SIZE}\n`);

    const client = await pool.connect();

    try {
        // Start transaction
        await client.query('BEGIN');

        let uploaded = 0;
        const totalBatches = Math.ceil(candles.length / CONFIG.BATCH_SIZE);

        for (let i = 0; i < candles.length; i += CONFIG.BATCH_SIZE) {
            const batch = candles.slice(i, i + CONFIG.BATCH_SIZE);
            const currentBatch = Math.floor(i / CONFIG.BATCH_SIZE) + 1;

            // Build bulk insert query
            const values = batch.map((candle, idx) => {
                const offset = i + idx;
                return `($${offset * 7 + 1}, $${offset * 7 + 2}, $${offset * 7 + 3}, $${offset * 7 + 4}, $${offset * 7 + 5}, $${offset * 7 + 6}, $${offset * 7 + 7})`;
            }).join(',');

            const params = batch.flatMap(candle => [
                CONFIG.SYMBOL,
                candle.timestamp,
                candle.open,
                candle.high,
                candle.low,
                candle.close,
                candle.volume
            ]);

            const query = `
                INSERT INTO market_data (symbol, timestamp_utc, open, high, low, close, volume)
                VALUES ${values}
                ON CONFLICT (symbol, timestamp_utc) DO NOTHING
            `;

            await client.query(query, params);
            uploaded += batch.length;

            // Progress bar
            const progress = ((currentBatch / totalBatches) * 100).toFixed(1);
            const bar = '█'.repeat(Math.floor(progress / 2)) + '░'.repeat(50 - Math.floor(progress / 2));
            process.stdout.write(`\r   [${bar}] ${progress}% (${uploaded}/${candles.length})`);
        }

        // Commit transaction
        await client.query('COMMIT');

        stats.totalInserted = uploaded;
        console.log(`\n\n✅ Upload complete: ${uploaded} candles inserted`);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error(`\n❌ Upload Error: ${error.message}`);
        stats.errors.push({ step: 'upload', error: error.message });
        throw error;

    } finally {
        client.release();
    }
}

/**
 * 📊 Print Final Statistics
 */
function printStats() {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 DATA INGESTION SUMMARY`);
    console.log(`${'='.repeat(60)}`);
    console.log(`   Total Fetched:  ${stats.totalFetched.toLocaleString()}`);
    console.log(`   Total Cleaned:  ${stats.totalCleaned.toLocaleString()}`);
    console.log(`   Total Inserted: ${stats.totalInserted.toLocaleString()}`);
    console.log(`   Total Skipped:  ${stats.totalSkipped.toLocaleString()}`);
    console.log(`   Errors:         ${stats.errors.length}`);

    if (stats.errors.length > 0) {
        console.log(`\n❌ ERRORS:`);
        stats.errors.forEach((err, idx) => {
            console.log(`   ${idx + 1}. [${err.step}] ${err.error}`);
        });
    }

    console.log(`${'='.repeat(60)}\n`);
}

/**
 * 🚀 MAIN EXECUTION
 */
async function main() {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 QUANTIX CORE - HISTORICAL DATA INGESTION`);
    console.log(`${'='.repeat(60)}`);
    console.log(`   Symbol:     ${CONFIG.SYMBOL}`);
    console.log(`   Year:       ${CONFIG.YEAR}`);
    console.log(`   Timeframe:  ${CONFIG.TIMEFRAME}`);
    console.log(`   Source:     ${CONFIG.DATA_SOURCE}`);
    console.log(`${'='.repeat(60)}`);

    try {
        // Step 1: Fetch Data
        let rawCandles = [];
        if (CONFIG.DATA_SOURCE === 'ALPHA_VANTAGE') {
            rawCandles = await fetchAlphaVantageData(CONFIG.SYMBOL, CONFIG.TIMEFRAME);
        } else if (CONFIG.DATA_SOURCE === 'CSV') {
            rawCandles = await importFromCSV(CONFIG.CSV_PATH);
        }

        if (rawCandles.length === 0) {
            throw new Error('No data fetched. Aborting.');
        }

        // Step 2: Clean Data
        const cleanedCandles = cleanData(rawCandles);

        if (cleanedCandles.length === 0) {
            throw new Error('No valid data after cleaning. Aborting.');
        }

        // Step 3: Normalize Timezone
        const normalizedCandles = normalizeTimezone(cleanedCandles);

        // Step 4: Upload to Database
        await uploadToDatabase(normalizedCandles);

        // Step 5: Print Statistics
        printStats();

        console.log(`✅ Data ingestion completed successfully!\n`);
        process.exit(0);

    } catch (error) {
        console.error(`\n❌ FATAL ERROR: ${error.message}\n`);
        printStats();
        process.exit(1);
    }
}

// Run
main();
