import pg from 'pg';
import dotenv from 'dotenv';

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

async function inspectSchema() {
    console.log("🔍 Inspecting 'ai_signals' Schema...");

    const pool = new Pool(config);

    try {
        const client = await pool.connect();

        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'ai_signals'
        `);

        console.log("Columns:", res.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));

        client.release();
    } catch (err) {
        console.error("❌ Schema Inspection Failed:", err.message);
    } finally {
        await pool.end();
    }
}

inspectSchema();
