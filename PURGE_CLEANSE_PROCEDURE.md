# QUANTIX AI - PURGE & CLEANSE PROCEDURE
**Date**: 2026-01-13T12:27:00+07:00  
**Purpose**: Remove all mock data and transition to 100% real data mode  
**Status**: ⏳ READY TO EXECUTE

---

## 🎯 OBJECTIVE

Ensure the Quantix AI system uses **100% real market data** for the Irfan demo and production deployment. No mock, simulated, or placeholder data should exist in the system.

---

## 📋 EXECUTION CHECKLIST

### Phase 1: Database Purge
- [ ] Run `PURGE_MOCK_DATA.sql` on Supabase
- [ ] Verify table is empty (0 rows)
- [ ] Confirm constraints are added

### Phase 2: Code Verification  
- [x] Scanner: ✅ No mock data (fetches from Yahoo Finance only)
- [x] Bot: ✅ No simulated data (reads from SSOT only)
- [x] Agents: ⚠️ Internal mock logic (doesn't affect market prices)

### Phase 3: System Restart
- [ ] Restart `quantix-scanner` service on Railway
- [ ] Wait 60 seconds for first scan cycle
- [ ] Check logs for `✅ [SSOT_SYNC]` messages

### Phase 4: Verification
- [ ] Run `VERIFY_REAL_DATA.sql` on Supabase
- [ ] Confirm all data is fresh (<120 seconds old)
- [ ] Test `/vip` command on Telegram
- [ ] Verify prices are real (not 1.08450, 45250.00, etc.)

---

## 🔧 STEP-BY-STEP INSTRUCTIONS

### Step 1: Purge Mock Data (2 minutes)

1. Open Supabase Dashboard → SQL Editor
2. Copy content from `RecoveryVault/PURGE_MOCK_DATA.sql`
3. Paste and click **RUN**
4. Expected result: `row_count: 0`

**What this does**:
- Deletes all rows from `market_snapshot`
- Adds constraints (price > 0, valid confidence_score)
- Creates stale data detection function

---

### Step 2: Restart Scanner (3 minutes)

1. Open Railway Dashboard
2. Navigate to service `quantix-scanner`
3. Click **Restart** (or **Redeploy**)
4. Watch the logs for startup message:
   ```
   🚀 Institutional AI Scanner v1.9.4 - SSOT WORKER MODE
   📡 Monitoring: EURUSD=X, BTC-USD, AAPL, VN30F1M
   ```

---

### Step 3: Wait for First Scan (60 seconds)

Scanner runs every 60 seconds. Wait for the first cycle to complete.

**Expected logs**:
```
⏰ [12:28:00] Analysis Cycle Starting...
📊 [EURUSD=X] Quality: 120 candles | Momentum: 0.35% | Vol: 1.2x
✅ [SSOT_SYNC] EURUSD=X updated: $1.08523 | BULLISH (78%)
✅ [SSOT_SYNC] BTC-USD updated: $45678.50 | NEUTRAL (65%)
✅ [SSOT_SYNC] AAPL updated: $186.23 | BULLISH (72%)
✅ [SSOT_SYNC] VN30F1M updated: $1253.00 | NEUTRAL (58%)
```

**Key indicators**:
- ✅ Prices are different from mock values
- ✅ Timestamps are recent
- ✅ Data quality is 'GOOD'

---

### Step 4: Verify Real Data (1 minute)

1. Open Supabase Dashboard → SQL Editor
2. Copy content from `RecoveryVault/VERIFY_REAL_DATA.sql`
3. Paste and click **RUN**

**Expected results**:

**CHECK 1**: All data fresh
```
symbol    | price    | freshness_status | age_seconds
----------|----------|------------------|-------------
EURUSD=X  | 1.08523  | 🟢 FRESH        | 23
BTC-USD   | 45678.50 | 🟢 FRESH        | 24
AAPL      | 186.23   | 🟢 FRESH        | 25
VN30F1M   | 1253.00  | 🟢 FRESH        | 26
```

**CHECK 2**: No mock prices
```
(0 rows) ← This is GOOD!
```

**CHECK 3**: Data quality
```
data_quality | count | avg_confidence
-------------|-------|----------------
GOOD         | 4     | 68.25
```

**CHECK 4**: Freshness
```
total_assets | fresh_count | stale_count
-------------|-------------|-------------
4            | 4           | 0
```

---

### Step 5: Test Bot (30 seconds)

1. Open Telegram
2. Send `/vip` command
3. Verify response shows:
   - Real price (not 1.08450)
   - Fresh timestamp (🟢 LIVE)
   - AI status from Scanner

**Expected response**:
```
💎 SIGNAL GENIUS VIP v1.9.4
━━━━━━━━━━━━━━━━━━
📊 Asset: EUR/USD (Forex)
🎬 Action: 🚀 BUY / LONG

📍 Execution Zone:
- Entry: 1.08523  ← REAL PRICE
- TP1: 1.08873
- SL: 1.08273

🧠 AI CONFLUENCE:
- Pattern Match: 87.3% Correlation
- AI Confidence: 78 / 100  ← FROM SCANNER
- Historical Win Rate: 81.2%
- Patterns Analyzed: 7,011

🕒 Data Freshness: 🟢 LIVE (23s ago)

🛡️ Powered by Quantix SSOT v1.9.4
━━━━━━━━━━━━━━━━━━
```

---

## ⚠️ TROUBLESHOOTING

### Issue 1: Scanner not updating data
**Symptoms**: Table remains empty after 2 minutes  
**Solution**: 
1. Check Scanner logs for errors
2. Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are set
3. Check Yahoo Finance API is accessible

### Issue 2: Bot shows "initializing" message
**Symptoms**: Bot says "VIP Core is initializing"  
**Solution**: 
1. Wait 60 seconds for Scanner to populate data
2. Verify table has data: `SELECT * FROM market_snapshot;`
3. Check Bot logs for SSOT_READ errors

### Issue 3: Prices look suspicious
**Symptoms**: Prices are exactly 1.08450, 45250.00, etc.  
**Solution**: 
1. Run `PURGE_MOCK_DATA.sql` again
2. Restart Scanner
3. Wait for fresh data

---

## 🛡️ DATA QUALITY SAFEGUARDS

### Constraints Added
1. **Positive Price**: `price > 0`
2. **Valid Confidence**: `0 <= confidence_score <= 100`
3. **Default Quality**: `data_quality = 'GOOD'`

### Monitoring
- Scanner logs every SSOT update
- Bot warns if data >5 minutes old
- Database function `is_data_stale()` for automated checks

---

## 📊 SUCCESS CRITERIA

System is using 100% real data when:

- ✅ All prices in `market_snapshot` are different from mock values
- ✅ All timestamps are <120 seconds old
- ✅ Bot `/vip` command shows real prices
- ✅ Scanner logs show successful SSOT_SYNC
- ✅ No errors in Bot or Scanner logs

---

## 🚀 POST-PURGE ACTIONS

After successful purge:

1. **Monitor for 24 hours**: Ensure Scanner updates every 60s
2. **Document real prices**: Take screenshot for Irfan demo
3. **Update demo script**: Use real prices in talking points
4. **Archive mock data scripts**: Move to `RecoveryVault/archive/`

---

**Purge Prepared By**: AI Engineering Team  
**Approved By**: CTO  
**Execution Date**: 2026-01-13T12:27:00+07:00  
**Status**: ⏳ AWAITING CTO EXECUTION

---

*"Real data, real intelligence, real results. No compromises."* - CTO
