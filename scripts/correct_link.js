import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!BOT_TOKEN || !CHAT_ID) {
    process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: false });

const correctionMsg = `
⚠️ **CORRECTION: OFFICIAL LINK**

Apologies for the typo in the previous broadcast.
The correct official link to the Live Dashboard is:

👉 **[Launch Quantix Dashboard](https://9dpi.github.io/quantix/#/mvp)**

_Please bookmark this link for future access._
`;

bot.sendMessage(CHAT_ID, correctionMsg, { parse_mode: 'Markdown' })
    .then(() => {
        console.log("✅ Correction sent.");
        process.exit(0);
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
