# 🏥 RAILWAY DEPLOYMENT - HEALTH CHECK REPORT

**Last Updated:** 2026-01-11 13:15 GMT+7  
**Deployment:** Quantix Core - Price Watchdog  
**Environment:** Production (Railway Cloud)

---

## 📋 CHECKLIST - AUDIT LOGS

### 1. ✅ DEPLOYMENT STATUS
- [ ] **Build Status:** Success / Failed
- [ ] **Runtime Status:** Running / Stopped / Crashed
- [ ] **Uptime:** _____ hours/days
- [ ] **Last Deployment:** YYYY-MM-DD HH:MM

**Action Required:**
```
1. Open Railway Dashboard: https://railway.app/dashboard
2. Navigate to: Your Project → Deployments
3. Check latest deployment status
4. Screenshot the deployment summary
```

---

### 2. 🔍 LOG ANALYSIS (Last 30 Minutes)

#### A. Scanning Frequency
**Expected Pattern:**
```
🔍 Watching X signals | Current Price: 1.XXXX
📊 Alpha Vantage EUR/USD: 1.XXXX
```

**Questions to Answer:**
- [ ] Logs xuất hiện đều đặn mỗi 10 giây?
- [ ] Có gaps (khoảng trống) trong timeline không?
- [ ] Timestamp có chính xác không?

**Copy Sample Logs Here:**
```
[Paste 10-20 lines of recent logs]
```

---

#### B. API Health Check

**🟢 HEALTHY INDICATORS:**
```
✅ Alpha Vantage EUR/USD: 1.0XXX
📍 Updated price for Signal xxx: 1.0XXX
```

**🔴 ERROR INDICATORS:**
```
❌ Alpha Vantage rate limit exceeded
⚠️ Alpha Vantage API Error: 429
❌ Cannot fetch current price
⚠️ Yahoo Finance (Fallback) activated
```

**Status:**
- [ ] ✅ Alpha Vantage working normally
- [ ] ⚠️ Fallback to Yahoo Finance (rate limit hit)
- [ ] ❌ Both sources failing

**API Calls Remaining Today:**
- Alpha Vantage Free Tier: ___/25 calls

**Action Required if Rate Limit Hit:**
```bash
# Option 1: Increase check interval (10s → 30s)
# Edit backend/price_watchdog.js line 362:
setInterval(async () => {
    await watchSignals();
}, 30000); // Changed from 10000 to 30000

# Option 2: Upgrade to Premium API Key
# Visit: https://www.alphavantage.co/premium/
```

---

#### C. Database Connectivity

**🟢 HEALTHY INDICATORS:**
```
✅ Updated Signal xxx → ENTRY_HIT (Price: 1.0XXX)
📍 Updated price for Signal xxx: 1.0XXX
```

**🔴 ERROR INDICATORS:**
```
❌ DB Update Error: connection timeout
❌ DB Update Error: SSL error
❌ Watchdog Error: ECONNREFUSED
```

**Status:**
- [ ] ✅ Supabase connection stable
- [ ] ⚠️ Intermittent connection issues
- [ ] ❌ Cannot connect to database

**Action Required if DB Issues:**
```bash
# Check Supabase status
1. Visit: https://status.supabase.com
2. Verify Mumbai region (ap-south-1) is operational
3. Check connection string in Railway env vars
```

---

#### D. Signal Tracking Logic

**Expected Behavior:**
```
⏳ No active signals to watch.
# OR
🔍 Watching 1 signals | Current Price: 1.0XXX
⏳ Price confirmation 1/2 for signal_xxx_1.0520
✅ Updated Signal xxx → ENTRY_HIT (Price: 1.0520)
```

**Questions:**
- [ ] Anti-wick confirmation working? (2x check required)
- [ ] Signal status transitions correct? (WAITING → ENTRY_HIT → TP1_HIT → TP2_HIT)
- [ ] Telegram alerts sent? (if configured)

---

### 3. 📊 RESOURCE USAGE

#### A. Memory Usage
**Healthy Range:** < 512 MB  
**Current Usage:** _____ MB

**Action if High Memory:**
```
- Check for memory leaks
- Restart deployment
- Review priceConfirmationBuffer cleanup logic
```

#### B. CPU Usage
**Healthy Range:** < 50%  
**Current Usage:** ____%

**Action if High CPU:**
```
- Check for infinite loops
- Review setInterval timing
- Verify API timeout settings
```

#### C. Network Activity
**Expected Pattern:**
- Outbound: API calls to Alpha Vantage/Yahoo (every 10s)
- Outbound: Database queries to Supabase (every 10s)
- Outbound: Telegram API (on signal events)

**Status:**
- [ ] Network activity matches expected pattern
- [ ] No unusual spikes
- [ ] No connection timeouts

---

### 4. 🔔 ERROR SUMMARY

**Total Errors (Last 24h):** _____

**Top 3 Error Types:**
1. ___________________________________
2. ___________________________________
3. ___________________________________

**Sample Error Stack Trace:**
```
[Paste full error if available]
```

---

## 🎯 HEALTH SCORE

Calculate overall health score:

| Component | Status | Weight | Score |
|-----------|--------|--------|-------|
| Deployment Status | ✅/⚠️/❌ | 25% | ___/25 |
| API Connectivity | ✅/⚠️/❌ | 25% | ___/25 |
| Database Connectivity | ✅/⚠️/❌ | 25% | ___/25 |
| Resource Usage | ✅/⚠️/❌ | 15% | ___/15 |
| Error Rate | ✅/⚠️/❌ | 10% | ___/10 |
| **TOTAL** | | **100%** | **___/100** |

**Rating:**
- 90-100: 🟢 Excellent
- 70-89: 🟡 Good (minor issues)
- 50-69: 🟠 Fair (needs attention)
- <50: 🔴 Critical (immediate action required)

---

## 🚨 IMMEDIATE ACTIONS REQUIRED

**Priority 1 (Critical):**
- [ ] _________________________________
- [ ] _________________________________

**Priority 2 (Important):**
- [ ] _________________________________
- [ ] _________________________________

**Priority 3 (Nice to Have):**
- [ ] _________________________________
- [ ] _________________________________

---

## 📸 SCREENSHOTS

**Deployment Dashboard:**
![Railway Deployment](paste_screenshot_here)

**Resource Metrics (24h):**
![CPU/Memory Graph](paste_screenshot_here)

**Recent Logs:**
![Log Output](paste_screenshot_here)

---

## 📞 SUPPORT CONTACTS

**Railway Support:** https://railway.app/help  
**Supabase Support:** https://supabase.com/support  
**Alpha Vantage Support:** support@alphavantage.co

---

## 📝 NOTES

**Observations:**
- _________________________________
- _________________________________
- _________________________________

**Recommendations:**
- _________________________________
- _________________________________
- _________________________________

---

**Report Completed By:** _________________  
**Date:** 2026-01-11  
**Next Review:** 2026-01-12
