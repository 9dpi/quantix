# 🚀 Railway Deployment Guide - Quantix AI Core

## Quick Deploy (15 minutes)

### Step 1: Prepare Repository ✅
- [x] `package.json` has `"start": "node backend/price_watchdog.js"`
- [x] All code committed to GitHub
- [x] `.env` in `.gitignore` (secrets protected)

### Step 2: Deploy to Railway

#### 2.1 Create Account & Project
1. Go to https://railway.app
2. Sign up with GitHub (1-click)
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose: `9dpi/ai-forecast-demo`
6. Railway will auto-detect Node.js and start building

#### 2.2 Configure Environment Variables ⚠️ CRITICAL

Click on your project → **Variables** tab → Add these:

| Key | Value | Notes |
|-----|-------|-------|
| `INTERNAL_AUTH_KEY` | `signal-genius-ai-core-2026-secure-bridge-key-v1.5` | Must match MVP |
| `MVP_API_URL` | `https://9dpi.github.io/ai-forecast-demo/api/v1/internal/signals` | Production MVP URL |
| `SUPABASE_URL` | `https://gvglzvjsexeaectypkyk.supabase.co` | From .env |
| `SUPABASE_SERVICE_KEY` | `sb_secret_pjCRy8EvC0QlWiu8QYiEbQ_KyQTnx5Q` | Service role key |
| `DB_HOST` | `aws-1-ap-south-1.pooler.supabase.com` | Postgres direct |
| `DB_NAME` | `postgres` | Database name |
| `DB_USER` | `postgres.gvglzvjsexeaectypkyk` | DB user |
| `DB_PASSWORD` | `EpVgJ9G%-EQA.Qm` | DB password |
| `DB_PORT` | `6543` | Supabase port |
| `TELEGRAM_TOKEN` | `8528989748:AAEwGwcVzzbNOSLj-P_V80ReaIreSvKzWuY` | Bot token |
| `TELEGRAM_CHAT_ID` | `7985984228` | Your chat ID |
| `ALPHA_VANTAGE_KEY` | `Z9JGV0STF4PE6C61` | Price data API |

#### 2.3 Deploy & Monitor

1. Railway will automatically deploy after adding variables
2. Go to **Deployments** tab
3. Click on the latest deployment
4. Click **"View Logs"**

### Step 3: Verify Success ✅

Look for these log messages:

```
🚀 Starting Price Watchdog for EUR/USD...
   Data Source: Alpha Vantage (Real-time Forex)
   Fallback: Yahoo Finance
   Anti-Wick: 2x confirmation required
   Check Interval: Every 10 seconds
-----------------------------------

✅ Telegram Alert Sent
📊 Alpha Vantage EUR/USD: 1.16390

🔍 Watching 1 signals | Current Price: 1.16390
```

If you see this, **SUCCESS!** 🎉

### Step 4: Test Production Flow

#### Option A: Check Telegram
- You should receive: "🚀 Signal Genius AI is now ONLINE and monitoring EUR/USD."

#### Option B: Check MVP
- Open: https://9dpi.github.io/ai-forecast-demo/#/mvp
- Signals should update in real-time

#### Option C: Manual Test (Advanced)
```bash
# Get your Railway URL from dashboard
curl https://your-app.up.railway.app/health
```

---

## 🔧 Troubleshooting

### Issue: "Module not found"
**Solution**: Make sure `package.json` has all dependencies listed

### Issue: "Cannot connect to database"
**Solution**: Double-check all DB_* environment variables

### Issue: "Unauthorized"
**Solution**: Verify `INTERNAL_AUTH_KEY` matches between Core and MVP

### Issue: "Telegram not sending"
**Solution**: Check `TELEGRAM_TOKEN` and `TELEGRAM_CHAT_ID`

---

## 📊 Railway Dashboard Features

### Logs
- Real-time streaming
- Filter by level (info, error, warn)
- Download for analysis

### Metrics
- CPU usage
- Memory usage
- Network traffic

### Deployments
- Auto-deploy on GitHub push
- Rollback to previous versions
- Manual redeploy

---

## 🎯 Post-Deployment Checklist

- [ ] Logs show "Starting Price Watchdog"
- [ ] Telegram message received
- [ ] MVP shows real-time signals
- [ ] No errors in Railway logs
- [ ] Database connection successful
- [ ] Price updates every 10 seconds

---

## 💰 Cost Estimate

**Railway Free Tier:**
- $5 credit/month
- ~550 hours of runtime
- **More than enough for 24/7 demo**

**Estimated usage:**
- Watchdog: ~$2-3/month
- **You have $2-3 credit remaining for other services**

---

## 🚀 Next Steps After Deployment

1. **Monitor for 1 hour** - Make sure no crashes
2. **Test signal dispatch** - Wait for a real signal
3. **Show Irfan** - Open MVP on his phone
4. **Celebrate!** 🎉

---

## 📝 Important Notes

### DO NOT commit to GitHub:
- ❌ `.env` file
- ❌ Any file with `SUPABASE_SERVICE_KEY`
- ❌ Any file with `TELEGRAM_TOKEN`

### Railway will handle:
- ✅ Auto-restart on crash
- ✅ Auto-deploy on git push
- ✅ SSL/HTTPS automatically
- ✅ Environment isolation

---

## 🔗 Useful Links

- Railway Dashboard: https://railway.app/dashboard
- Railway Docs: https://docs.railway.app
- Supabase Dashboard: https://supabase.com/dashboard
- MVP Live: https://9dpi.github.io/ai-forecast-demo/#/mvp

---

**Deployment Time**: ~15 minutes  
**Difficulty**: Easy ⭐⭐☆☆☆  
**Success Rate**: 95%+

**Good luck! 🚂💨**
