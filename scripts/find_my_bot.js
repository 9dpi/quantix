import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config();

async function getBotInfo() {
    const token = process.env.TELEGRAM_TOKEN;
    if (!token) {
        console.log("❌ No token found in .env");
        return;
    }
    try {
        const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
        const data = await response.json();
        if (data.ok) {
            console.log("\n✨ BOT IDENTITY FOUND ✨");
            console.log(`- Name: ${data.result.first_name}`);
            console.log(`- Username: @${data.result.username}`);
            console.log(`\n👉 Search for @${data.result.username} on Telegram to start chatting!`);
        } else {
            console.log("❌ Error: " + data.description);
        }
    } catch (e) {
        console.log("❌ Connection error: " + e.message);
    }
}
getBotInfo();
