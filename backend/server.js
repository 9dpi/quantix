import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { askQuantix } from './ai_processor.js';
import { spawn } from 'child_process';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// API for Web Chatbot
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    try {
        const response = await askQuantix(message);
        res.json({ response });
    } catch (error) {
        console.error("API Error:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', system: 'Quantix AI Core v1.5' });
});

app.listen(PORT, () => {
    console.log(`🚀 API Server running on port ${PORT}`);
});

// Start Bot and Watchdog as child processes
const botProcess = spawn('node', ['backend/bot.js'], { stdio: 'inherit' });
const watchdogProcess = spawn('node', ['backend/price_watchdog.js'], { stdio: 'inherit' });

botProcess.on('close', (code) => console.log(`Bot process exited with code ${code}`));
watchdogProcess.on('close', (code) => console.log(`Watchdog process exited with code ${code}`));
