# 🚀 Quantix AI - Railway Deployment Guide

## 📋 Required Environment Variables

Set these variables in Railway Dashboard:

### Database
- `DB_HOST` - Supabase PostgreSQL host
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name (default: postgres)
- `DB_PORT` - Database port (default: 5432)

### Supabase
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_KEY` - Supabase service role key (for admin operations)

### Telegram
- `TELEGRAM_TOKEN` - Telegram bot token
- `TELEGRAM_CHAT_ID` - Your Telegram chat ID

### APIs
- `ALPHA_VANTAGE_KEY` - Alpha Vantage API key for market data
- `INTERNAL_AUTH_KEY` - Internal API authentication key

### System
- `TZ` - Timezone (e.g., Asia/Ho_Chi_Minh)
- `PORT` - Server port (Railway auto-assigns, default: 3000)
- `NODE_ENV` - Environment (production)

## 🏗️ Architecture

### Process 1: Web Server (backend/server.js)
- Serves API endpoints
- Handles chatbot requests
- Health check endpoint

### Process 2: Price Watchdog (backend/price_watchdog.js)
- Monitors active signals 24/7
- Updates current prices every 10 seconds
- Triggers TP/SL alerts via Telegram

### Process 3: Telegram Scheduler (backend/telegram_scheduler.js)
- Sends Market Pulse at 08:30
- Sends Daily Recap at 23:00
- Automated reporting

## 🔄 Auto-Restart Policy
- Type: ON_FAILURE
- Max Retries: 10
- Ensures 99.9% uptime

## 📊 Monitoring
Check Railway logs for:
- `[WATCHDOG] Connected to Supabase`
- `[SERVER] API Server running on port XXXX`
- `[SCHEDULER] Next Market Pulse scheduled for...`

## 🎯 Deployment Steps
1. Connect Railway to GitHub repository
2. Set all environment variables
3. Deploy from `main` branch
4. Monitor logs for successful startup
5. Test endpoints and Telegram notifications

---
**Status:** Production Ready ✅
**Uptime Target:** 24/7/365
**Cost:** Railway Hobby Plan ($5/month)
