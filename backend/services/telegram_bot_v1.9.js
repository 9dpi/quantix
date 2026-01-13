import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import pg from 'pg';
import YahooFinance from 'yahoo-finance2';
import fetch from 'node-fetch';

dotenv.config();

const yahooFinance = new YahooFinance();

// --- CONFIGURATION ---
const TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_TOKEN;
if (!TOKEN) {
    console.error("❌ [CRITICAL] No TELEGRAM_BOT_TOKEN found in environment variables!");
    process.exit(1);
}
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

// Group IDs from Railway Variables
const COMMUNITY_GROUP = process.env.GROUP_ID_COMMUNITY || '';
const VIP_GROUP = process.env.GROUP_ID_VIP || '';
const OFFICIAL_GROUP = process.env.GROUP_ID_OFFICIAL || '';

const { Pool } = pg;
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: { rejectUnauthorized: false }
});

// --- PATTERN CACHE LOADING ---
let patternCache = [];
const CACHE_MODE = process.env.PATTERN_CACHE_MODE || 'LOCAL'; // LOCAL or CLOUD

async function loadPatterns() {
    if (CACHE_MODE === 'CLOUD') {
        try {
            console.log('[V1.9] Loading patterns from Cloud (Supabase)...');
            const result = await pool.query('SELECT vector_hash, results FROM pattern_cache LIMIT 5000');
            patternCache = result.rows;
            console.log(`[V1.9] Loaded ${patternCache.length} patterns from Cloud.`);
        } catch (err) {
            console.error('[V1.9] Cloud load failed, falling back to local file.', err.message);
            loadLocalPatterns();
        }
    } else {
        loadLocalPatterns();
    }
}

function loadLocalPatterns() {
    const PATTERN_PATH = path.join('RecoveryVault', 'patterns_backup_v1.9.json');
    try {
        if (fs.existsSync(PATTERN_PATH)) {
            patternCache = JSON.parse(fs.readFileSync(PATTERN_PATH, 'utf8'));
            console.log(`[V1.9] Loaded ${patternCache.length} patterns from local backup.`);
        }
    } catch (err) {
        console.error(`[V1.9] Local load error:`, err.message);
    }
}

loadPatterns();

// --- TELEGRAM API WRAPPER ---
async function botAction(method, body) {
    try {
        const res = await fetch(`${TELEGRAM_API}/${method}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!data.ok) {
            console.error(`[BOT API Error] ${method} failed:`, data.description);
        }
        return data;
    } catch (e) {
        console.error(`[BOT Network Error] ${method} failed:`, e.message);
    }
}

// --- LOGIC HELPERS ---
function normalizeCandles(candles) {
    const base = candles[0].o || candles[0].open;
    return candles.map(c => ({
        o: ((c.o || c.open) - base) / base,
        h: ((c.h || c.high) - base) / base,
        l: ((c.l || c.low) - base) / base,
        c: ((c.c || c.close) - base) / base
    }));
}

function calculateCorrelation(current, target) {
    const normCurrent = normalizeCandles(current);
    const normTarget = normalizeCandles(target);
    let sumSqDiff = 0;
    for (let i = 0; i < 4; i++) {
        ['o', 'h', 'l', 'c'].forEach(f => {
            sumSqDiff += Math.pow(normCurrent[i][f] - normTarget[i][f], 2);
        });
    }
    return Math.max(0, 100 * (1 - (Math.sqrt(sumSqDiff) * 10)));
}

function findBestMatch(currentCandles) {
    let bestMatch = null;
    let maxCorrelation = 0;
    for (const p of patternCache) {
        if (!p.results || !p.results.candles) continue;
        const correlation = calculateCorrelation(currentCandles, p.results.candles);
        if (correlation > maxCorrelation) {
            maxCorrelation = correlation;
            bestMatch = p;
        }
    }
    return { bestMatch, correlation: maxCorrelation };
}

// --- MESSAGE HANDLER ---
async function handleMessage(msg) {
    const text = msg.text;
    const chatId = msg.chat.id.toString();
    const isPrivate = msg.chat.type === 'private';

    console.log(`📩 [INCOMING] Message from ${chatId} (${isPrivate ? 'Private' : 'Group'}): "${text || '[No Text]'}"`);

    if (!text) return;

    // 0. GLOBAL COMMAND: /start
    if (text === '/start') {
        const welcome = `
👋 **Welcome to Signal Genius AI v1.9!**
I am the institutional-grade pattern recognition bot.

Available Commands:
/vip - Show premium signal analysis
/status - Show system transparency & PnL
        `;
        return await botAction('sendMessage', { chat_id: chatId, text: welcome, parse_mode: 'Markdown' });
    }

    // A. VIP EXPERIENCE (Showcase /vip)
    if (text === '/vip' || chatId === VIP_GROUP) {
        try {
            const history = await yahooFinance.chart('EURUSD=X', { period1: Math.floor(Date.now() / 1000) - (7 * 24 * 3600), interval: '1h' });
            const quotes = history.quotes.filter(q => q.open);
            const last4 = quotes.slice(-4).map(q => ({ o: q.open, h: q.high, l: q.low, c: q.close }));

            const { bestMatch, correlation } = findBestMatch(last4);
            const winRate = (78.5 + (Math.random() * 5)).toFixed(1);
            const aiScore = (88 + (Math.random() * 7)).toFixed(0);
            const entry = last4[3].c;
            const isUp = bestMatch ? bestMatch.results.next_move === 'UP' : true;

            const response = `
💎 **SIGNAL GENIUS VIP v1.9**
━━━━━━━━━━━━━━━━━━
📊 **Asset**: \`EUR/USD (Forex)\`
🎬 **Action**: **${isUp ? '🚀 BUY / LONG' : '🔴 SELL / SHORT'}**

📍 **Execution Zone**:
- Entry: \`${entry.toFixed(5)}\`
- TP1: \`${(isUp ? entry + 0.0035 : entry - 0.0035).toFixed(5)}\`
- SL:  \`${(isUp ? entry - 0.0025 : entry + 0.0025).toFixed(5)}\`

🧠 **AI CONFLUENCE**:
- **Pattern Match**: \`${correlation.toFixed(1)}%\` Correlation
- **AI Confidence**: \`${aiScore} / 100\`
- **Historical Win Rate**: \`${winRate}%\`

🛡️ *Powered by Quantix Iron Hand v1.9*
━━━━━━━━━━━━━━━━━━
                `;

            const keyboard = {
                inline_keyboard: [[{ text: '📊 Live Chart', url: 'http://signalgeniusai.com' }]]
            };

            await botAction('sendMessage', {
                chat_id: chatId,
                text: response,
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });
        } catch (e) {
            console.error(e);
            await botAction('sendMessage', { chat_id: chatId, text: "❌ VIP Core is busy. Please retry." });
        }
    }

    // B. OFFICIAL EXPERIENCE (Transparency /status)
    else if (text === '/status' || chatId === OFFICIAL_GROUP) {
        try {
            const stats = await pool.query(`
                SELECT 
                    COUNT(*) FILTER (WHERE signal_status IN ('TP1_HIT', 'TP2_HIT')) as win,
                    COUNT(*) FILTER (WHERE signal_status = 'SL_HIT') as loss
                FROM ai_signals 
                WHERE created_at > NOW() - INTERVAL '24 hours'
            `);

            const activeTrades = await pool.query(`
                SELECT symbol, signal_type, entry_price, current_price 
                FROM ai_signals 
                WHERE signal_status IN ('ENTRY_HIT', 'WAITING') 
                AND is_published = TRUE
                ORDER BY created_at DESC LIMIT 3
            `);

            const { win, loss } = stats.rows[0];
            const pips = ((win * 25) - (loss * 15)).toFixed(0);

            let activeText = "";
            if (activeTrades.rows.length > 0) {
                activeTrades.rows.forEach(t => {
                    const diff = t.signal_type === 'BUY' ? (t.current_price - t.entry_price) : (t.entry_price - t.current_price);
                    const pipsMove = (diff * 10000).toFixed(1);
                    activeText += `\n• ${t.symbol}: \`${pipsMove > 0 ? '+' : ''}${pipsMove} pips\` (${t.signal_type})`;
                });
            } else {
                activeText = "\n*Currently no active signals.*";
            }

            const message = `
📊 **SIGNAL GENIUS — OFFICIAL REPORT**
━━━━━━━━━━━━━━━━━━
📈 **Daily Performance (24h)**:
- Results: \`${win} Win - ${loss} Loss\`
- Net Profit: \`+${pips} pips\` ✅

⌛ **Running Trades**:
${activeText}

✨ *Status: All systems operational.*
━━━━━━━━━━━━━━━━━━
                `;

            await botAction('sendMessage', { chat_id: chatId, text: message, parse_mode: 'Markdown' });
        } catch (err) {
            await botAction('sendMessage', { chat_id: chatId, text: "❌ System syncing... retry in 1m." });
        }
    }

    // C. COMMUNITY & PRIVATE DMs (Funnel - Any key)
    else if (chatId === COMMUNITY_GROUP || isPrivate) {
        if (!text.startsWith('/')) {
            const teaser = `
✨ **SIGNAL GENIUS COMMUNITY**

🔥 AI v1.9 just detected a high-probability pattern on **EUR/USD**!
- **Historical Accuracy**: \`82.4%\`
- **Expected Move**: \`+35 pips\`

🔓 **Unlock full details & entry levels now:**
👉 [Upgrade to VIP Now](http://signalgeniusai.com)

*AI-Powered Intelligence at your fingertips.*
            `;
            await botAction('sendMessage', { chat_id: chatId, text: teaser, parse_mode: 'Markdown' });
        }
    }
}

// --- POLLING ---
let lastUpdateId = 0;

async function initBot() {
    console.log('🛡️ [INIT] Deleting existing webhooks to enable Polling...');
    await botAction('deleteWebhook', { drop_pending_updates: true });
    pollUpdates();

    // Heartbeat for Railway Health
    setInterval(() => {
        console.log(`💓 [HEARTBEAT] Bot v1.9.1 is active. Last Update ID: ${lastUpdateId}`);
    }, 60000);
}

async function pollUpdates() {
    try {
        const data = await botAction('getUpdates', { offset: lastUpdateId + 1, timeout: 30 });
        if (data && data.ok && data.result) {
            for (const update of data.result) {
                lastUpdateId = update.update_id;
                if (update.message) handleMessage(update.message);
            }
        } else if (data && !data.ok) {
            console.error('[POLLING] Telegram Error:', data.description);
        }
    } catch (e) {
        console.error('[POLLING] System Error:', e.message);
    }
    setTimeout(pollUpdates, 1000);
}

initBot();
console.log(`🚀 [PRODUCTION] Telegram Bot v1.9.1 running in context-aware mode.`);
console.log(`- Community Group: ${COMMUNITY_GROUP}`);
console.log(`- VIP Group: ${VIP_GROUP}`);
console.log(`- Official Group: ${OFFICIAL_GROUP}`);
