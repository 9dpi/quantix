import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { askQuantix } from './ai_processor.js';
import { spawn } from 'child_process';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
app.use(helmet()); // Secure HTTP headers
app.use(cors());
app.use(express.json());

// Rate limiting: Max 100 requests per 15 mins
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(limiter);

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
    console.log('[HEALTH] Pulse check received.');
    res.json({
        status: 'ok',
        system: 'Quantix AI Core v1.5',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production'
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 QUANTIX WEB SERVER LIVE: http://0.0.0.0:${PORT}`);
});

// NOTE: Bot, Watchdog, and Scheduler are now managed by Railway via Procfile.
// No manual spawning needed here to avoid double-process conflicts.
