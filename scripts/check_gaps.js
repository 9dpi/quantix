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

async function checkGaps() {
    try {
        const res = await pool.query(`
            SELECT created_at, 
                   extract(epoch from (created_at - lag(created_at) OVER (ORDER BY created_at))) as diff 
            FROM market_data 
            WHERE created_at >= NOW() - INTERVAL '1 hour'
            ORDER BY created_at DESC 
            LIMIT 20
        `);
        console.table(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkGaps();
