/**
 * 🕵️‍♂️ ALPHA VANTAGE HISTORICAL FETCH TEST
 * Purpose: Test fetching historical Intraday FX data from Alpha Vantage
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.ALPHA_VANTAGE_KEY || 'Z9JGV0STF4PE6C61';
const SYMBOL = 'EURUSD';
const INTERVAL = '60min'; // H1 candles for history

async function testHistory() {
    console.log(`🕵️‍♂️ Targeting Alpha Vantage History for ${SYMBOL}...`);

    // Alpha Vantage FX_INTRADAY with outputsize=full gets recent history
    // Note: Free tier might be limited to recent 1-2 months or compact
    const url = `https://www.alphavantage.co/query?function=FX_INTRADAY&from_symbol=EUR&to_symbol=USD&interval=${INTERVAL}&outputsize=full&apikey=${API_KEY}`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (data['Error Message']) {
            console.error("❌ API Error:", data['Error Message']);
            return;
        }
        if (data['Note']) {
            console.warn("⚠️ API Limit/Note:", data['Note']);
            return;
        }

        const timeSeries = data[`Time Series FX (${INTERVAL})`];
        if (!timeSeries) {
            console.error("❌ No Time Series found. Response:", JSON.stringify(data).substring(0, 200));
            return;
        }

        const timestamps = Object.keys(timeSeries);
        const count = timestamps.length;
        const first = timestamps[timestamps.length - 1];
        const last = timestamps[0];

        console.log(`✅ SUCCESS! Found ${count} candles.`);
        console.log(`📅 Range: ${first} ---> ${last}`);

        // Analyze how far back it goes
        console.log("\n📊 Sample Data (First 3):");
        console.log(timestamps.slice(0, 3).map(t => `${t}: ${timeSeries[t]['4. close']}`).join('\n'));

    } catch (e) {
        console.error("❌ Network Error:", e.message);
    }
}

testHistory();
