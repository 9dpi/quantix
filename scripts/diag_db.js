import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log("--- SCHEMA CHECK ---");
        const columns = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'market_data'");
        console.log("Market Data Columns:", columns.rows.map(r => r.column_name));

        console.log("\n--- LATEST DATA CHECK ---");
        // Check both close and close_price
        const latest = await pool.query("SELECT * FROM market_data ORDER BY timestamp_utc DESC LIMIT 1");
        console.log("Latest Market Data Item:", JSON.stringify(latest.rows[0], null, 2));

        const latestSignal = await pool.query("SELECT * FROM ai_signals ORDER BY created_at DESC LIMIT 1");
        console.log("Latest Signal Item:", JSON.stringify(latestSignal.rows[0], null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

run();
