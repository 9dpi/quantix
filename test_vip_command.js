/**
 * Test /vip command
 * Simulates a user typing /vip in Telegram
 */

import dotenv from 'dotenv';
import pg from 'pg';

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

console.log('🧪 Testing /vip command logic...\n');

try {
    // Fetch latest VIP signal from Quantix AI Core (confidence >95%)
    const result = await pool.query(`
        SELECT 
            symbol,
            signal_type,
            predicted_close as entry_price,
            tp1_price,
            sl_price,
            confidence_score,
            created_at
        FROM ai_signals 
        WHERE confidence_score > 95
        AND is_published = TRUE
        ORDER BY created_at DESC 
        LIMIT 1
    `);

    if (result.rows.length === 0) {
        console.log("⏳ No VIP signals available yet. Quantix AI Core is scanning for >95% confidence setups.");
        process.exit(0);
    }

    const signal = result.rows[0];
    const pair = signal.symbol.replace('=X', '');
    const action = signal.signal_type === 'LONG' ? 'BUY' : 'SELL';
    const tradeType = action === 'BUY' ? 'BUY (Long)' : 'SELL (Short)';

    const entry = parseFloat(signal.entry_price);
    const tp = parseFloat(signal.tp1_price || (entry * (action === 'BUY' ? 1.004 : 0.996)));
    const sl = parseFloat(signal.sl_price || (entry * (action === 'BUY' ? 0.997 : 1.003)));

    const pipValue = 0.0001;
    const targetPips = Math.abs((tp - entry) / pipValue).toFixed(0);
    const stopPips = Math.abs((entry - sl) / pipValue).toFixed(0);
    const riskReward = (targetPips / stopPips).toFixed(2);

    const entryLow = (entry - 2 * pipValue).toFixed(5);
    const entryHigh = (entry + 2 * pipValue).toFixed(5);

    // Format timestamp
    const signalDate = new Date(signal.created_at);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[signalDate.getUTCMonth()];
    const day = signalDate.getUTCDate();
    const year = signalDate.getUTCFullYear();
    const hours = String(signalDate.getUTCHours()).padStart(2, '0');
    const minutes = String(signalDate.getUTCMinutes()).padStart(2, '0');
    const utcTime = `${month} ${day}, ${year} — ${hours}:${minutes} UTC`;

    const response = `
📊 Asset: ${pair}
📌 Trade: ${tradeType}

📈 Charts:
* Bias: H1
* Entry: M5–M15

💰 Price Levels:
Entry Zone: ${entryLow} – ${entryHigh}
Take Profit (TP): ${tp.toFixed(5)}
Stop Loss (SL): ${sl.toFixed(5)}

📏 Risk Management:
* Target: +${targetPips} pips
* Stop: −${stopPips} pips
* Risk:Reward: 1:${riskReward}
* Suggested Risk: 0.5%–1% per trade

🧠 AI Confidence: ${signal.confidence_score}% (model conviction score)
🕒 Trade Type: Intraday
⏰ Posted: ${utcTime}

⚠️ Not financial advice. Trade responsibly.
    `.trim();

    console.log('✅ /vip command would return:\n');
    console.log(response);
    console.log('\n📊 Link: https://9dpi.github.io/ai-forecast-demo/#/mvp');

} catch (e) {
    console.error('❌ Error:', e.message);
} finally {
    await pool.end();
}
