import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!BOT_TOKEN || !CHAT_ID) {
    console.error("❌ Missing config");
    process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: false });

const updateMsg = `
🚀 **QUANTIX AI SYSTEM UPDATE v1.5**

We have successfully upgraded the infrastructure:

1️⃣ **Mobile-First Dashboard:** Optimized UI for seamless phone experience.
2️⃣ **Smart Filter Logic:** 
   - ⚡ **SMART Mode:** Shows TOP 1 High-Confidence Signal.
   - 🌐 **ALL Mode:** Shows TOP 3 Signals sorted by strength.
3️⃣ **Notification Layers:**
   - 🚨 *New Signals* (Instant)
   - ⚡ *Progress Updates* (Entry/TP Hit)
   - 🏆 *Daily Summary* (End of Day P/L)

⏰ _All times are now synchronized to GMT+7_

👉 **Check the new look:** [quantix.vip](https://9dpi.github.io/ai-forecast-demo/#/mvp)
`;

bot.sendMessage(CHAT_ID, updateMsg, { parse_mode: 'Markdown' })
    .then(() => {
        console.log("✅ Update notification sent!");
        process.exit(0);
    })
    .catch((err) => {
        console.error("❌ Error:", err.message);
        process.exit(1);
    });
