/**
 * ⚡ QUANTIX AI PROCESSOR (V3.0 HYBRID - GLOBAL)
 * Features: Gemini AI Conversation + Stable Data Fallback
 * Language: English
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
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

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Helper: Generate raw English report (The Fail-safe)
 */
function generateRawReport(market, signal) {
    if (!market) return "⚠️ Market data currently unavailable.";

    const close = parseFloat(market.close || 0);
    const high = parseFloat(market.high || 0);
    const low = parseFloat(market.low || 0);

    let report = `📊 **EUR/USD LIVE DATA**\n`;
    report += `⏰ Time: ${new Date(market.timestamp_utc).toLocaleString('en-GB', { timeZone: 'UTC' })} (UTC)\n\n`;
    report += `🔹 **Price:** ${close.toFixed(5)}\n`;
    report += `🔹 **Session:** H: ${high.toFixed(5)} | L: ${low.toFixed(5)}\n\n`;

    if (signal) {
        report += `🎯 **LATEST SIGNAL:**\n`;
        report += `• Action: **${signal.signal_type}**\n`;
        report += `• Conf: ${signal.confidence_score}%\n`;
        report += `• Entry: ${parseFloat(signal.entry_price).toFixed(5)}\n`;
        report += `• TP: ${parseFloat(signal.tp1_price).toFixed(5)} | SL: ${parseFloat(signal.sl_price).toFixed(5)}\n`;
    }
    return report;
}

/**
 * Main Hybrid Processor
 */
export async function askQuantix(userQuestion) {
    const client = await pool.connect();
    let marketData = null;
    let signalData = null;

    try {
        // Fetch Context
        const sigRes = await client.query(`SELECT * FROM ai_signals WHERE symbol = 'EURUSD=X' ORDER BY created_at DESC LIMIT 1`);
        const mktRes = await client.query(`SELECT * FROM market_data WHERE symbol = 'EURUSD=X' ORDER BY timestamp_utc DESC LIMIT 1`);

        signalData = sigRes.rows[0];
        marketData = mktRes.rows[0];

        // 1. Try AI Conversation
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const contextSummary = `Price: ${marketData?.close}, Signal: ${signalData?.signal_type}, Conf: ${signalData?.confidence_score}%`;

        const prompt = `
            You are Quantix AI, a professional Quant Trader for UK clients. 
            Current Market: ${contextSummary}.
            User asked: "${userQuestion}".
            Strategy: Reversal V1.5. 
            Instruction: Respond in English. Be concise, professional, and data-driven. 
            If the user just says hi, welcome them and mention the market.
        `;

        const result = await model.generateContent(prompt);
        return result.response.text();

    } catch (error) {
        console.error("⚠️ AI Fallback Triggered:", error.message);
        // 2. Fail-safe: Return clean raw data if AI fails
        return generateRawReport(marketData, signalData);
    } finally {
        client.release();
    }
}
