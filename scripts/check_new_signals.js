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
        const res = await pool.query("SELECT * FROM ai_signals WHERE created_at > NOW() - INTERVAL '10 minutes'");
        console.log(`New Signals (10m): ${res.rows.length}`);
        if (res.rows.length > 0) {
            console.log(JSON.stringify(res.rows, null, 2));
        } else {
            const allCodes = await pool.query("SELECT id, symbol, confidence_score, created_at FROM ai_signals ORDER BY created_at DESC LIMIT 5");
            console.log("Recent 5 signals:", JSON.stringify(allCodes.rows, null, 2));
        }

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

run();
