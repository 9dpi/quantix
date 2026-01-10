import express from 'express';
import dotenv from 'dotenv';
import { receiveSignal, updateSignalStatus, healthCheck } from './backend/api/receive-signal.js';

dotenv.config();

const app = express();
const PORT = process.env.TEST_PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path} from ${req.ip}`);
    next();
});

// API Routes
app.post('/api/v1/internal/signals', receiveSignal);
app.patch('/api/v1/internal/signals/status', updateSignalStatus);
app.get('/api/v1/internal/health', healthCheck);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'Signal Genius AI - MVP Receiver',
        version: '1.5.0',
        status: 'running',
        endpoints: [
            'POST /api/v1/internal/signals',
            'PATCH /api/v1/internal/signals/status',
            'GET /api/v1/internal/health'
        ]
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('❌ Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║  🚀 Signal Genius AI - MVP Receiver Server                ║
║  📡 Listening on: http://localhost:${PORT}                  ║
║  🔐 Auth: ${process.env.INTERNAL_AUTH_KEY ? '✅ Configured' : '❌ Missing'}                          ║
║  💾 Database: ${process.env.SUPABASE_URL ? '✅ Connected' : '❌ Not configured'}                    ║
╚═══════════════════════════════════════════════════════════╝
    `);
    console.log('📋 Available endpoints:');
    console.log('   POST   /api/v1/internal/signals');
    console.log('   PATCH  /api/v1/internal/signals/status');
    console.log('   GET    /api/v1/internal/health');
    console.log('\n⏳ Waiting for signals from Core...\n');
});

export default app;
