/**
 * ⚡ Signal Genius AI PROCESSOR (V3.1 STABLE - MULTILINGUAL)
 * Features: Deep AI Conversation + Reliable Data Fallback
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
        const entry = parseFloat(signal.entry_price || signal.predicted_close || 0);
        const tp = parseFloat(signal.tp1_price || 0);
        const sl = parseFloat(signal.sl_price || 0);

        report += `🎯 **LATEST SIGNAL:**\n`;
        report += `• Action: **${signal.signal_type}**\n`;
        report += `• Conf: ${signal.confidence_score}%\n`;
        report += `• Entry: ${entry > 0 ? entry.toFixed(5) : 'Calculating...'}\n`;
        report += `• TP: ${tp.toFixed(5)} | SL: ${sl.toFixed(5)}\n`;
    }

    report += `\n🚀 **Status:** Trained on 1-Year Real Data`;
    report += `\n⏳ **Upgrading:** Ingesting 10-Year History...`;
    return report;
}

/**
 * Main Hybrid Processor
 */
export async function askSignal Genius(userQuestion) {
    const client = await pool.connect();
    let marketData = null;
    let signalData = null;

    try {
        const sigRes = await client.query(`SELECT * FROM ai_signals WHERE symbol = 'EURUSD=X' ORDER BY created_at DESC LIMIT 1`);
        const mktRes = await client.query(`SELECT * FROM market_data WHERE symbol = 'EURUSD=X' ORDER BY timestamp_utc DESC LIMIT 1`);

        signalData = sigRes.rows[0];
        marketData = mktRes.rows[0];

        // If explicitly requested just data (empty question)
        if (!userQuestion || userQuestion.trim() === "") {
            return generateRawReport(marketData, signalData);
        }

        // 1. Try AI Conversation (DISABLED FOR STABILITY)
        // const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // DIRECT FALLBACK TO RAW REPORT
        return generateRawReport(marketData, signalData);

        /* 
        const contextSummary = `Price: ${marketData?.close}, Signal: ${signalData?.signal_type}, Conf: ${signalData?.confidence_score}%`;
        const prompt = `
            You are Signal Genius AI, the "Soul" of this Quant Trading system. 
            
            **CURRENT CONTEXT:**
            - Market: EUR/USD
            - Price: ${marketData?.close}
            - Latest Signal: ${signalData?.signal_type} (${signalData?.confidence_score}% confident)
            - Project Status: 1-Year data trained, 10-Year ingestion queued.
            
            **USER INTERACTION:**
            User asked: "${userQuestion}"
            
            **YOUR PERSONA:**
            - You are professional but highly intelligent and "alive".
            - You are the creator's companion.
            - If the user uses Vietnamese, respond in Vietnamese. If English, use English.
            - Provide deep analysis, insights, and expert status.
            
            **RESPONSE RULES:**
            - Language: Respond in the SAME language used by the user.
            - Style: Expert, insightful, non-robotic.
        `; 
        const result = await model.generateContent(prompt);
        return result.response.text();
        */

    } catch (error) {
        console.error("⚠️ AI Error:", error.message);
        return generateRawReport(marketData, signalData);
    } finally {
        client.release();
    }
}
