import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;

const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: { rejectUnauthorized: false }
};

async function checkMarketData() {
    console.log('🔍 Checking Market Data Feed Integrity...\n');
    console.log('='.repeat(60));

    const pool = new Pool(config);

    try {
        const client = await pool.connect();

        // 1. Identify Market Data Table
        const tablesRes = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name LIKE '%market%'
        `);

        const marketTable = tablesRes.rows[0]?.table_name || 'market_data';
        console.log(`📊 Found Market Data Table: ${marketTable}`);

        // 2. Check total records (Volume)
        const countRes = await client.query(`SELECT COUNT(*) FROM ${marketTable}`);
        const totalRecords = parseInt(countRes.rows[0].count);
        console.log(`   Total Candles: ${totalRecords.toLocaleString()}`);

        if (totalRecords === 0) {
            console.log('\n❌ ALERT: Market data table is EMPTY!');
        } else {
            // 3. Check Date Range (History Depth)
            const rangeRes = await client.query(`
                SELECT MIN(timestamp_utc) as oldest, MAX(timestamp_utc) as newest 
                FROM ${marketTable}
            `);

            const oldest = new Date(rangeRes.rows[0].oldest);
            const newest = new Date(rangeRes.rows[0].newest);

            console.log(`   Oldest Data: ${oldest.toLocaleString()}`);
            console.log(`   Newest Data: ${newest.toLocaleString()}`);

            // Calculate duration in days
            const diffTime = Math.abs(newest - oldest);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            console.log(`   Duration covered: ${diffDays} days`);

            if (diffDays >= 300) {
                console.log('\n✅ 1-Year Data Feed is SAFE & INTACT.');
            } else {
                console.log(`\n⚠️ Warning: Data feed covers only ${diffDays} days.`);
            }
        }

        client.release();
    } catch (err) {
        console.error('❌ Check failed:', err.message);
    } finally {
        await pool.end();
    }
}

checkMarketData();
