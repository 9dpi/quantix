import pg from 'pg';
import dotenv from 'dotenv';
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

async function injectDemoSignal() {
    console.log("🚀 Injecting High-Confidence LIVE Signal for Demo...");
    const client = await pool.connect();

    try {
        // 1. Get current price (Mocking a fresh capture for the demo)
        const entryPrice = 1.16950; // Matching user's screenshot
        const tp = 1.17450;
        const sl = 1.16450;

        // 2. Insert as a FRESH signal (created_at = NOW)
        const query = `
            INSERT INTO ai_signals (
                symbol, 
                signal_type, 
                predicted_close, 
                confidence_score, 
                is_published, 
                signal_status, 
                last_checked_at,
                created_at,
                timestamp_utc
            )
            VALUES ($1, $2, $3, $4, TRUE, 'WAITING', NOW(), NOW(), NOW())
            RETURNING id
        `;

        const res = await client.query(query, [
            'EURUSD=X',
            'LONG',
            entryPrice,
            94, // High confidence to pass filters
        ]);

        console.log(`✅ SUCCESS: Demo Signal Injected! ID: ${res.rows[0].id}`);
        console.log("👉 Irfan's Dashboard should update INSTANTLY via Supabase Realtime.");

    } catch (err) {
        console.error("❌ Injection Error:", err.message);
    } finally {
        client.release();
        process.exit();
    }
}

injectDemoSignal();
