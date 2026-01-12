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

async function cleanup() {
    try {
        console.log("🧹 Starting Database Cleanup (ESM)...");

        const tablesRes = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        const tables = tablesRes.rows.map(r => r.table_name);
        console.log("📋 Current Tables:", tables);

        if (tables.includes('signals')) {
            const count = await pool.query("SELECT count(*) FROM signals");
            console.log(`🗑️ Found ${count.rows[0].count} signals in 'signals' table. Clearing...`);
            await pool.query("DELETE FROM signals");
        }

        if (tables.includes('agent_decisions')) {
            await pool.query("DELETE FROM agent_decisions WHERE created_at < NOW() - INTERVAL '7 days'");
            console.log("🧹 Cleaned agent_decisions older than 7 days.");
        }

        console.log("✅ Database Cleanup Finished.");
    } catch (err) {
        console.error("❌ Cleanup Error:", err);
    } finally {
        await pool.end();
    }
}

cleanup();
