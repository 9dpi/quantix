import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';

// Load env vars
dotenv.config();

const { Pool } = pg;

const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: { rejectUnauthorized: false } // Required for Supabase
};

async function checkConnection() {
    console.log("🔌 Connecting to Database...");
    console.log(`   Host: ${config.host}`);
    console.log(`   User: ${config.user}`);

    if (!config.password || config.password.includes('YOUR_')) {
        console.error("❌ ERROR: Please update .env file with your actual DB_PASSWORD and DB_USER.");
        process.exit(1);
    }

    const pool = new Pool(config);

    try {
        const client = await pool.connect();
        console.log("✅ SUCCESS: Connection established!");

        const res = await client.query('SELECT NOW() as now');
        console.log("   Server Time:", res.rows[0].now);

        // Check if tables exist
        const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

        console.log("   Tables found:", tables.rows.map(r => r.table_name).join(', '));

        client.release();
    } catch (err) {
        console.error("❌ CONNECTION FAILED:", err.message);
    } finally {
        await pool.end();
    }
}

checkConnection();
