
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

async function testAV() {
    const symbol = 'EURUSD=X';
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    console.log("Using API Key:", apiKey ? "FOUND" : "MISSING");

    let avSymbol = symbol.replace('=X', '');
    let functionName = 'TIME_SERIES_INTRADAY';
    let interval = '60min';

    const url = `https://www.alphavantage.co/query?function=${functionName}&symbol=${avSymbol}&interval=${interval}&apikey=${apiKey}`;
    console.log("URL:", url.replace(apiKey, "HIDDEN"));

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("Data keys:", Object.keys(data));

        const timeSeriesKey = Object.keys(data).find(k => k.includes('Time Series'));
        if (timeSeriesKey) {
            const timeSeries = data[timeSeriesKey];
            const dates = Object.keys(timeSeries).slice(0, 5);
            dates.forEach(d => {
                console.log(`${d}: ${timeSeries[d]['4. close']}`);
            });
        } else {
            console.log("Full Response:", JSON.stringify(data).substring(0, 500));
        }
    } catch (e) {
        console.error("Fetch Error:", e.message);
    }
}

testAV();
