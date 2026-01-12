# 🚀 QUICK START - CONTINUOUS IMPROVEMENT SYSTEM

**Last Updated:** 2026-01-11 13:20 GMT+7

---

## ⚡ 5-MINUTE SETUP

### Step 1: Verify Installation ✅
```bash
cd d:\Automator_Prj\AI_Smart_Forecast_Comercial
npm install  # Should already be done
```

### Step 2: Test Database Connection 🔌
```bash
npm run db:check
```

**Expected Output:**
```
✅ Database connection successful!
📊 Tables found: 4
   - assets_master
   - market_data
   - ai_signals
   - users
```

### Step 3: Run Your First Data Validation 📊
```bash
npm run data:validate
```

**Expected Output:**
```
🔍 DATA QUALITY VALIDATION REPORT
...
🎯 DATA QUALITY HEALTH SCORE
   Final Score: 0/100 (No data yet - this is normal!)
```

---

## 📥 YOUR FIRST DATA INGESTION

### Option A: Alpha Vantage (Recommended for Testing)

**1. Configure:**
```javascript
// Open: scripts/data-ingestion-2025.js
// Lines 29-35:

const CONFIG = {
    SYMBOL: 'EURUSD=X',
    YEAR: 2025,
    TIMEFRAME: '60min',        // ✅ Free tier friendly
    DATA_SOURCE: 'ALPHA_VANTAGE',
    MAX_ALLOWED_PIPS: 500,
    BATCH_SIZE: 1000,
};
```

**2. Run Ingestion:**
```bash
npm run data:ingest
```

**3. Monitor Progress:**
```
🔍 Fetching data from Alpha Vantage...
✅ Fetched 8760 candles

🧹 Cleaning data...
✅ Cleaned: 8745 valid candles

📤 Uploading to Supabase...
[████████████████████████] 100.0% (8745/8745)

✅ Upload complete!
```

**4. Validate Results:**
```bash
npm run data:validate
```

**Expected Score:** 90-100/100 ✅

---

### Option B: CSV Import (If You Have MT5 Data)

**1. Export from MT5:**
- Tools → History Center (F2)
- Select EURUSD → H1 (1 hour)
- Export → Save as `data/eurusd_2025.csv`

**2. Verify Format:**
```csv
timestamp,open,high,low,close,volume
2025-01-01 00:00:00,1.0520,1.0525,1.0515,1.0522,0
```

**3. Configure:**
```javascript
// scripts/data-ingestion-2025.js
const CONFIG = {
    DATA_SOURCE: 'CSV',  // Changed!
    CSV_PATH: './data/eurusd_2025.csv'
};
```

**4. Run:**
```bash
npm run data:ingest
npm run data:validate
```

---

## 🏥 DAILY HEALTH CHECK (3 Minutes)

### Morning Routine ☀️

**1. Check Railway Status:**
```
Open: https://railway.app/dashboard

Quick Check:
☐ Status: Running
☐ CPU: < 50%
☐ Memory: < 512 MB
☐ No red errors in logs
```

**2. Verify Live Price:**
```bash
# Compare with TradingView
https://www.tradingview.com/symbols/EURUSD/

# Check database
npm run db:check
```

**3. Document (Optional):**
```bash
# If issues found, fill out:
RAILWAY_HEALTH_CHECK.md
```

---

## 📊 WEEKLY DATA REFRESH (30 Minutes)

**Every Sunday:**

```bash
# 1. Backup current data (optional)
# Supabase Dashboard → Export table

# 2. Run fresh ingestion
npm run data:ingest

# 3. Validate quality
npm run data:validate

# 4. Update status report
# Edit: SYSTEM_STATUS_REPORT.md
```

---

## 🆘 TROUBLESHOOTING

### ❌ "Database connection failed"

**Fix:**
```bash
# Check .env file
cat .env | grep DB_

# Verify Supabase is online
https://status.supabase.com

# Test connection
npm run db:check
```

---

### ❌ "Alpha Vantage rate limit"

**Fix:**
```bash
# Option 1: Wait 24h for reset
# Option 2: Use CSV import instead
# Option 3: Get Premium API key
```

---

### ❌ "No data found in database"

**Fix:**
```bash
# Run data ingestion first
npm run data:ingest

# Then validate
npm run data:validate
```

---

## 📚 DOCUMENTATION MAP

**Need help?** Check these guides:

| Task | Document |
|------|----------|
| Daily operations | `CONTINUOUS_IMPROVEMENT.md` |
| Data ingestion | `DATA_INGESTION_GUIDE.md` |
| Health monitoring | `RAILWAY_HEALTH_CHECK.md` |
| System overview | `IMPLEMENTATION_SUMMARY.md` |
| CSV format | `data/README.md` |

---

## 🎯 SUCCESS CHECKLIST

Your system is ready when:

- ✅ `npm run db:check` passes
- ✅ `npm run data:ingest` completes successfully
- ✅ `npm run data:validate` shows 90%+ score
- ✅ Railway deployment is running
- ✅ Live website shows current EUR/USD price
- ✅ Telegram alerts working (if configured)

---

## 🚀 NEXT LEVEL

Once basics are working:

1. **Enable Historical Lookback**
   - Use `market_data` for pattern matching
   - Increase AI confidence scores

2. **Add More Symbols**
   - GBPUSD, USDJPY, GOLD
   - Multi-symbol watchdog

3. **Backtest Strategies**
   - Test on 2025 data
   - Optimize entry/exit rules

4. **Machine Learning**
   - Train models on historical data
   - Compare AI vs rule-based

---

## 📞 SUPPORT

**Stuck?**
1. Check `CONTINUOUS_IMPROVEMENT.md` troubleshooting section
2. Review `DATA_INGESTION_GUIDE.md` FAQ
3. Contact: Telegram (+84) 912580018

---

**Remember:** Start small, validate often, scale gradually! 🎯

**Ready?** Run your first command:
```bash
npm run db:check
```

**Let's go! 🚀**
