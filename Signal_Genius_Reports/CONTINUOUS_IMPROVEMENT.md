# 🚀 QUANTIX CORE - CONTINUOUS IMPROVEMENT WORKFLOW

**Last Updated:** 2026-01-11  
**Version:** 1.5  
**Status:** Production Ready ✅

---

## 📋 DAILY OPERATIONS CHECKLIST

### 🌅 Morning Routine (9:00 AM)

#### 1️⃣ Health Check Railway Deployment
```bash
# Mở Railway Dashboard
https://railway.app/dashboard

# Checklist:
☐ Deployment status: Running
☐ CPU usage: < 50%
☐ Memory usage: < 512 MB
☐ No error logs in last 24h
☐ API calls remaining: Check Alpha Vantage quota
```

**📝 Document findings in:** `RAILWAY_HEALTH_CHECK.md`

---

#### 2️⃣ Verify Signal Accuracy
```bash
# Kiểm tra tín hiệu đang active
node scripts/check_db.js

# So sánh với TradingView
https://www.tradingview.com/symbols/EURUSD/
```

**Expected:**
- Current price matches TradingView (±2 pips)
- Signal status updates correctly
- No stuck signals (> 24h in WAITING)

---

#### 3️⃣ Review Telegram Alerts
```bash
# Mở Telegram bot
# Kiểm tra:
☐ Entry alerts sent correctly
☐ TP/SL alerts triggered on time
☐ No duplicate alerts
```

---

### 🌆 Evening Routine (6:00 PM)

#### 1️⃣ Data Quality Check
```bash
# Validate data integrity
npm run data:validate
```

**Expected Output:**
```
🎯 DATA QUALITY HEALTH SCORE
Score: 90+/100
Rating: 🟢 Excellent
```

---

#### 2️⃣ Backup Critical Data
```bash
# Export signals to CSV (manual backup)
# Supabase Dashboard → Table Editor → Export
```

---

#### 3️⃣ Plan Tomorrow's Improvements
```bash
# Update PHASE_2_ROADMAP.md with:
- Issues encountered today
- New feature ideas
- Performance optimizations
```

---

## 📥 WEEKLY TASK: DATA INGESTION

**Frequency:** Every Sunday  
**Duration:** ~30 minutes

### Step 1: Prepare Environment
```bash
cd d:\Automator_Prj\AI_Smart_Forecast_Comercial
npm install  # Ensure dependencies updated
```

### Step 2: Configure Data Source

**Option A: Alpha Vantage (Recommended for Free Tier)**
```javascript
// Edit scripts/data-ingestion-2025.js
const CONFIG = {
    DATA_SOURCE: 'ALPHA_VANTAGE',
    TIMEFRAME: '60min',  // Free tier friendly
    SYMBOL: 'EURUSD=X'
};
```

**Option B: CSV Import (If you have MT5 data)**
```javascript
const CONFIG = {
    DATA_SOURCE: 'CSV',
    CSV_PATH: './data/eurusd_2025.csv'
};
```

### Step 3: Run Ingestion
```bash
npm run data:ingest
```

**Monitor Progress:**
```
📤 Uploading to Supabase...
[████████████████████████] 100.0% (8745/8745)
✅ Upload complete: 8745 candles inserted
```

### Step 4: Validate Data Quality
```bash
npm run data:validate
```

**Review Report:**
- ✅ Data coverage > 95%
- ✅ No price anomalies
- ✅ No duplicates
- ✅ Timezone consistency

### Step 5: Update Documentation
```bash
# Update SYSTEM_STATUS_REPORT.md
- Total candles in database: _____
- Date range: YYYY-MM-DD to YYYY-MM-DD
- Data quality score: __/100
```

---

## 🔧 TROUBLESHOOTING GUIDE

### ❌ Issue: Railway Deployment Crashed

**Symptoms:**
- Website shows old data
- No new signals generated
- Telegram alerts stopped

**Solution:**
```bash
# 1. Check Railway logs
https://railway.app/dashboard → Logs

# 2. Look for error patterns:
"❌ DB Update Error"
"❌ Alpha Vantage Fetch Error"
"Memory limit exceeded"

# 3. Restart deployment
Railway Dashboard → Deployments → Restart

# 4. If persistent, check env vars
Railway → Variables → Verify all DB_* and API keys
```

---

### ❌ Issue: Alpha Vantage Rate Limit

**Symptoms:**
```
⚠️ Alpha Vantage rate limit exceeded
⚠️ Yahoo Finance (Fallback) activated
```

**Solution:**
```bash
# Option 1: Reduce check frequency
# Edit backend/price_watchdog.js line 362
setInterval(async () => {
    await watchSignals();
}, 30000);  // Changed from 10000 to 30000 (30 seconds)

# Option 2: Upgrade API key
https://www.alphavantage.co/premium/

# Option 3: Use multiple free keys (rotate)
```

---

### ❌ Issue: Data Ingestion Failed

**Symptoms:**
```
❌ Alpha Vantage Fetch Error
❌ Upload Error: connection timeout
```

**Solution:**
```bash
# 1. Test database connection
npm run db:check

# 2. Verify API key
curl "https://www.alphavantage.co/query?function=FX_INTRADAY&from_symbol=EUR&to_symbol=USD&interval=60min&apikey=YOUR_KEY"

# 3. Check .env file
cat .env | grep -E "DB_|ALPHA_VANTAGE"

# 4. Retry with smaller batch size
# Edit scripts/data-ingestion-2025.js
BATCH_SIZE: 500  // Reduced from 1000
```

---

## 📊 PERFORMANCE METRICS

### Target KPIs

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Uptime | > 99% | ___% | ☐ |
| Signal Accuracy | > 70% | ___% | ☐ |
| API Response Time | < 2s | ___s | ☐ |
| Database Query Time | < 500ms | ___ms | ☐ |
| Data Coverage | > 95% | ___% | ☐ |
| Error Rate | < 1% | ___% | ☐ |

**Update weekly in:** `SYSTEM_STATUS_REPORT.md`

---

## 🎯 CONTINUOUS IMPROVEMENT CYCLE

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  1. MONITOR (Daily Health Check)               │
│           ↓                                     │
│  2. ANALYZE (Review Logs & Metrics)            │
│           ↓                                     │
│  3. IDENTIFY (Find Bottlenecks/Issues)         │
│           ↓                                     │
│  4. IMPROVE (Implement Fixes/Features)         │
│           ↓                                     │
│  5. VALIDATE (Test & Verify)                   │
│           ↓                                     │
│  6. DOCUMENT (Update Guides)                   │
│           ↓                                     │
│  └──────→ REPEAT ←──────────────────────────┘  │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 📚 QUICK REFERENCE

### Essential Commands
```bash
# Start Price Watchdog (Local)
npm start

# Run Data Ingestion
npm run data:ingest

# Validate Data Quality
npm run data:validate

# Check Database Connection
npm run db:check

# Clean Test Data
npm run db:clean

# Frontend Development
npm run dev

# Build for Production
npm run build
```

### Essential URLs
```
Railway Dashboard:   https://railway.app/dashboard
Supabase Dashboard:  https://supabase.com/dashboard/project/gvglzvjsexeaectypkyk
GitHub Actions:      https://github.com/9dpi/ai-forecast-demo/actions
Live Website:        https://9dpi.github.io/ai-forecast-demo/#/mvp
TradingView:         https://www.tradingview.com/symbols/EURUSD/
Alpha Vantage:       https://www.alphavantage.co/
```

### Essential Files
```
Configuration:
├── .env                          # Environment variables
├── package.json                  # NPM scripts
└── backend/price_watchdog.js     # Core monitoring logic

Documentation:
├── RAILWAY_HEALTH_CHECK.md       # Daily health report template
├── DATA_INGESTION_GUIDE.md       # Data ingestion instructions
├── SYSTEM_STATUS_REPORT.md       # Overall system status
└── CONTINUOUS_IMPROVEMENT.md     # This file

Scripts:
├── scripts/data-ingestion-2025.js      # Historical data import
├── scripts/validate-data-quality.js    # Data quality checker
├── scripts/check_db.js                 # Database connection test
└── scripts/clean_db.js                 # Clean test data

Database:
├── database/schema.sql                 # Database structure
├── database/insert_test_signal.sql     # Test signal generator
└── database/add_signal_tracking.sql    # Signal tracking schema
```

---

## 🎓 LEARNING RESOURCES

### For Beginners
1. **Understanding Forex Trading:** https://www.babypips.com/learn/forex
2. **Technical Analysis Basics:** https://www.investopedia.com/technical-analysis-4689657
3. **PostgreSQL Tutorial:** https://www.postgresqltutorial.com/

### For Advanced Users
1. **Quantitative Trading:** https://www.quantstart.com/
2. **Algorithmic Trading:** https://www.quantinsti.com/
3. **Machine Learning for Trading:** https://www.mltrading.io/

---

## 📞 SUPPORT & COMMUNITY

**Issues?** Create a GitHub Issue:
https://github.com/9dpi/ai-forecast-demo/issues

**Questions?** Contact:
- Telegram: (+84) 912580018
- Email: [Your Email]

**Contribute:**
Fork the repo and submit a Pull Request!

---

## 🏆 SUCCESS CRITERIA

Your system is **Production-Ready** when:

- ✅ Railway deployment uptime > 99% (7 days)
- ✅ No critical errors in logs (24h)
- ✅ Signal accuracy > 70% (30 signals)
- ✅ Data coverage > 95% (1 year historical)
- ✅ All health checks passing
- ✅ Telegram alerts working
- ✅ Documentation up-to-date

---

**Remember:** Continuous improvement is a marathon, not a sprint. Small daily improvements compound into massive results! 🚀

**Next Review:** 2026-01-18 (Weekly)
