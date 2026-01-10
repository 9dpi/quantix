# Integration Test Guide

## 🚀 Quick Start

### Step 1: Start the MVP Receiver Server
```bash
node test-server.js
```

You should see:
```
╔═══════════════════════════════════════════════════════════╗
║  🚀 Signal Genius AI - MVP Receiver Server                ║
║  📡 Listening on: http://localhost:3001                   ║
║  🔐 Auth: ✅ Configured                                    ║
║  💾 Database: ✅ Connected                                 ║
╚═══════════════════════════════════════════════════════════╝
```

### Step 2: Run the Integration Tests
In a **new terminal window**:
```bash
node tests/test-bridge.js
```

## 📋 What Gets Tested

### Test 1: Health Check
- Verifies MVP server is running
- Checks authentication
- Validates endpoint availability

### Test 2: High Confidence Signal (95%)
- Dispatches a BUY signal for EUR/USD
- Entry: 1.08500 | SL: 1.08200 | TP: 1.09100
- Verifies signal is stored in Supabase
- Checks Telegram notification trigger

### Test 3: Status Update
- Updates the signal from ACTIVE to ENTRY_HIT
- Simulates real-time price monitoring
- Verifies database update

### Test 4: Low Confidence Signal (75%)
- Dispatches a SELL signal for GBP/USD
- Tests that lower confidence signals are also accepted
- Validates different signal types

## ✅ Expected Output

```
=============================================================
  🚀 SIGNAL GENIUS AI - BRIDGE INTEGRATION TEST
=============================================================

Testing communication between:
  🧠 Quantix AI Core (Brain)
  ↓
  📡 Signal Dispatcher
  ↓
  🎯 MVP Receiver (Face)

------------------------------------------------------------
MVP URL: http://localhost:3001/api/v1/internal/signals
Auth Key: ✅ Configured
------------------------------------------------------------

=============================================================
  TEST 1: Health Check
=============================================================

📡 Checking MVP server health...
✅ SUCCESS: MVP server is healthy and reachable

=============================================================
  TEST 2: Signal Dispatch (High Confidence)
=============================================================

📤 Dispatching signal test-1736531890123...
   Pair: EUR/USD BUY
   Entry: 1.085 | SL: 1.082 | TP: 1.091
   Confidence: 95%
✅ SUCCESS: Signal dispatched and validated by MVP
   Signal ID: test-1736531890123
   Stored at: 2026-01-11T00:11:30.456Z

=============================================================
  TEST 3: Status Update
=============================================================

📝 Updating signal test-1736531890123 to ENTRY_HIT...
✅ SUCCESS: Signal status updated
   New status: ENTRY_HIT

=============================================================
  TEST 4: Low Confidence Signal
=============================================================

📤 Dispatching low-confidence signal (75%)...
✅ SUCCESS: Low-confidence signal accepted

=============================================================
  📊 TEST RESULTS
=============================================================

Total Tests: 4
✅ Passed: 4
❌ Failed: 0

=============================================================

🎉 ALL TESTS PASSED! (100.0%)
The bridge between Core and MVP is working perfectly.
You can now proceed with production deployment.

=============================================================
```

## 🔧 Troubleshooting

### Error: "MVP server is not reachable"
**Solution**: Make sure `test-server.js` is running in another terminal

### Error: "Unauthorized"
**Solution**: Check that `INTERNAL_AUTH_KEY` in `.env` matches on both sides

### Error: "Database error"
**Solution**: Verify Supabase credentials in `.env`:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

### Error: "ECONNREFUSED"
**Solution**: Ensure port 3001 is not in use by another application

## 📊 Verify in Supabase

After successful tests, check your Supabase dashboard:

1. Go to Table Editor → `ai_signals`
2. You should see 2 new test signals:
   - EUR/USD BUY (95% confidence, status: ENTRY_HIT)
   - GBP/USD SELL (75% confidence, status: WAITING)

## 🎯 Next Steps After Successful Test

1. ✅ Integration test passed
2. ⏳ Integrate receiver into Vite dev server
3. ⏳ Deploy Core to cloud (Render/Railway)
4. ⏳ Update production MVP_API_URL
5. ⏳ Enable 24/7 watchdog monitoring

## 🔐 Security Notes

- The `INTERNAL_AUTH_KEY` in `.env` is for **local testing only**
- For production, generate a new 32+ character random key
- Never commit `.env` to Git (already in `.gitignore`)
- Use environment variables in deployment platforms

## 📝 Manual Test (Alternative)

If you prefer to test manually with curl:

```bash
curl -X POST http://localhost:3001/api/v1/internal/signals \
  -H "Content-Type: application/json" \
  -H "x-auth-token: signal-genius-ai-core-2026-secure-bridge-key-v1.5" \
  -d '{
    "signal_id": "manual-test-123",
    "timestamp": "2026-01-11T00:00:00Z",
    "pair": "EUR/USD",
    "timeframe": "M15",
    "type": "BUY",
    "entry_price": 1.08500,
    "sl": 1.08200,
    "tp": 1.09100,
    "confidence_score": 95,
    "sentiment": "STRONG BULLISH",
    "status": "ACTIVE",
    "version": "AI AGENT V1.5"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Signal received and processed",
  "signal_id": "manual-test-123",
  "stored_at": "2026-01-11T00:11:30.456Z"
}
```
