/**
 * QUANTIX CORE AI - ONE-CLICK RESTORATION SCRIPT
 * This script ensures the database schema is up to date and verifies connectivity.
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: { rejectUnauthorized: false }
});

async function restore() {
    console.log("🛠️  QUANTIX RESTORATION INITIATED...");

    try {
        // 1. Kiểm tra kết nối
        console.log("🔗 Verifying Database Connection...");
        const timeRes = await pool.query('SELECT NOW()');
        console.log(`✅ Connected! Server time: ${timeRes.rows[0].now}`);

        // 2. Đọc và chạy Schema
        console.log("📜 Synchronizing Database Schema...");
        const schemaPath = path.join(__dirname, '../RecoveryVault/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // Supabase/Postgres SQL execution
        await pool.query(schemaSql);
        console.log("✅ Schema synchronization complete.");

        // 3. Thông báo hoàn tất
        console.log("\n✨ RESTORATION COMPLETE. QUANTIX CORE AI IS BACK ONLINE.");
        console.log("🚀 All systems nominal. Active services should be restarted now.");

    } catch (err) {
        console.error("\n❌ RESTORATION FAILED!");
        console.error("Error Details:", err.message);
    } finally {
        await pool.end();
    }
}

restore();
