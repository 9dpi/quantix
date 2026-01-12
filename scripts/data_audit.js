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

async function runAudit() {
    console.log("🔍 QUANTIX DATA AUDIT INITIATED...\n");
    try {
        // Step 1: The Inventory
        const inventoryRes = await pool.query("SELECT count(*) as total_records FROM market_data");
        console.log(`📦 Step 1: Total Inventory: ${inventoryRes.rows[0].total_records} records`);

        // Step 2: Today's Performance
        const todayRes = await pool.query("SELECT count(*) as today_records FROM market_data WHERE created_at >= '2026-01-12 00:00:00'");
        console.log(`📈 Step 2: Today's Yield (Jan 12): ${todayRes.rows[0].today_records} records`);

        // Step 3: Data Purity
        // Note: Our watchdog inserts volume 0 for snapshots. 
        // We will check purity based on 'close' presence.
        const purityRes = await pool.query(`
            SELECT 
                (count(CASE WHEN close IS NOT NULL THEN 1 END) * 100.0 / NULLIF(count(*), 0)) as purity_percentage
            FROM market_data
            WHERE created_at >= '2026-01-12 00:00:00'
        `);
        const purity = purityRes.rows[0].purity_percentage;
        console.log(`✨ Step 3: Data Purity: ${purity ? parseFloat(purity).toFixed(2) : 0}% ${purity >= 99 ? '✅ (Institutional Grade)' : '⚠️'}`);

        // Step 4: Coverage (Max Gap)
        const gapRes = await pool.query(`
            SELECT max(diff) as max_gap_seconds
            FROM (
                SELECT created_at, 
                       extract(epoch from (created_at - lag(created_at) OVER (ORDER BY created_at))) as diff
                FROM market_data
                WHERE created_at >= '2026-01-12 00:00:00'
            ) t
        `);
        const maxGap = gapRes.rows[0].max_gap_seconds;
        console.log(`🛡️  Step 4: Max Data Gap: ${maxGap ? parseFloat(maxGap).toFixed(1) : 'N/A'} seconds ${maxGap < 30 ? '✅ (Stable Flow)' : '⚠️'}`);

    } catch (err) {
        console.error("❌ Audit failed:", err);
    } finally {
        await pool.end();
    }
}

runAudit();
