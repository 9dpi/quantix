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

async function verifySync() {
    console.log("🔍 Verifying Data Synchronization...");

    if (!config.host) {
        console.error("❌ Missing DB_HOST in .env");
        process.exit(1);
    }

    const pool = new Pool(config);

    try {
        const client = await pool.connect();

        // 1. Check total count
        const countRes = await client.query('SELECT COUNT(*) FROM ai_signals');
        console.log(`📊 Total Signals in DB: ${countRes.rows[0].count}`);

        // 2. Get latest 5 signals
        const res = await client.query(`
            SELECT id, symbol, signal_type, entry_price, created_at, signal_status 
            FROM ai_signals 
            ORDER BY created_at DESC 
            LIMIT 5
        `);

        console.log("\n🕒 Latest 5 Signals:");
        if (res.rows.length === 0) {
            console.log("   (No signals found)");
        } else {
            res.rows.forEach(row => {
                const time = new Date(row.created_at).toLocaleString();
                console.log(`   [${time}] ${row.symbol} ${row.signal_type} @ ${row.entry_price} (${row.signal_status})`);
            });
        }

        client.release();
    } catch (err) {
        console.error("❌ Sync Verification Failed:", err.message);
    } finally {
        await pool.end();
    }
}

verifySync();
