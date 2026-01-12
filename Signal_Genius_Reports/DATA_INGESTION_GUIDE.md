# 📚 DATA INGESTION GUIDE - 2025 HISTORICAL DATA

## 🎯 Mục Đích

Nạp dữ liệu lịch sử 1 năm (2025) vào Supabase để:
- Xây dựng kho tri thức cho Quantix Core
- Tăng độ chính xác của AI predictions (Historical Lookback)
- Backtest trading strategies

---

## 🚀 QUICK START

### Bước 1: Chuẩn Bị

```bash
# Đảm bảo đã cài đặt dependencies
cd d:\Automator_Prj\AI_Smart_Forecast_Comercial
npm install
```

### Bước 2: Cấu Hình

Mở file `scripts/data-ingestion-2025.js` và điều chỉnh:

```javascript
const CONFIG = {
    SYMBOL: 'EURUSD=X',           // Cặp tiền cần nạp
    YEAR: 2025,                   // Năm dữ liệu
    TIMEFRAME: '60min',           // Khung thời gian
    DATA_SOURCE: 'ALPHA_VANTAGE', // Nguồn dữ liệu
    
    // Chất lượng dữ liệu
    MAX_ALLOWED_PIPS: 500,        // Loại bỏ nến spike > 500 pips
    BATCH_SIZE: 1000,             // Upload 1000 nến/lần
};
```

### Bước 3: Chạy Script

```bash
# Chạy data ingestion
node scripts/data-ingestion-2025.js
```

**Kết quả mong đợi:**
```
=============================================================
🚀 QUANTIX CORE - HISTORICAL DATA INGESTION
=============================================================
   Symbol:     EURUSD=X
   Year:       2025
   Timeframe:  60min
   Source:     ALPHA_VANTAGE
=============================================================

🔍 Fetching data from Alpha Vantage...
✅ Fetched 8760 candles from Alpha Vantage

🧹 Cleaning data...
✅ Cleaned: 8745 valid candles
   Skipped: 15 invalid candles

🕐 Normalizing timezone to UTC+0...

📤 Uploading to Supabase...
   [████████████████████████████████████████████████] 100.0% (8745/8745)

✅ Upload complete: 8745 candles inserted

=============================================================
📊 DATA INGESTION SUMMARY
=============================================================
   Total Fetched:  8,760
   Total Cleaned:  8,745
   Total Inserted: 8,745
   Total Skipped:  15
   Errors:         0
=============================================================
```

---

## 📊 TIMEFRAME OPTIONS

| Timeframe | Alpha Vantage Code | Candles/Year | API Calls Required |
|-----------|-------------------|--------------|-------------------|
| 1 phút    | `1min`            | ~525,600     | 21 calls (Premium) |
| 5 phút    | `5min`            | ~105,120     | 5 calls (Premium) |
| 15 phút   | `15min`           | ~35,040      | 2 calls (Premium) |
| 1 giờ     | `60min`           | ~8,760       | 1 call (Free) ✅ |
| 4 giờ     | `240min`          | ~2,190       | 1 call (Free) ✅ |
| 1 ngày    | `daily`           | ~365         | 1 call (Free) ✅ |

**Khuyến nghị:**
- **Free Tier:** Dùng `60min` hoặc `daily`
- **Premium Tier:** Dùng `5min` hoặc `15min` cho độ chi tiết cao

---

## 📂 IMPORT TỪ CSV

Nếu bạn có file CSV từ MT5/TradingView:

### Bước 1: Chuẩn Bị CSV File

**Format yêu cầu:**
```csv
timestamp,open,high,low,close,volume
2025-01-01 00:00:00,1.0520,1.0525,1.0515,1.0522,0
2025-01-01 01:00:00,1.0522,1.0530,1.0520,1.0528,0
...
```

**Lưu file tại:** `d:\Automator_Prj\AI_Smart_Forecast_Comercial\data\eurusd_2025.csv`

### Bước 2: Đổi Cấu Hình

```javascript
const CONFIG = {
    DATA_SOURCE: 'CSV',  // Đổi từ ALPHA_VANTAGE sang CSV
    CSV_PATH: './data/eurusd_2025.csv'
};
```

### Bước 3: Chạy Script

```bash
node scripts/data-ingestion-2025.js
```

---

## 🧹 DATA QUALITY CHECKS

Script tự động thực hiện các kiểm tra:

### 1. Missing Data Filter
Loại bỏ nến thiếu thông số (open, high, low, close)

### 2. Spike Detection
Loại bỏ nến có biên độ bất thường (> 500 pips)

**Ví dụ:**
```
⚠️ Spike detected: 2025-03-15T14:30:00Z (1250 pips)
```

### 3. Price Range Validation
EUR/USD phải nằm trong khoảng 0.8 - 1.5

### 4. Future Date Check
Loại bỏ dữ liệu có timestamp trong tương lai

### 5. Timezone Normalization
Tất cả timestamp được chuẩn hóa về UTC+0

---

## 🔧 TROUBLESHOOTING

### ❌ Error: "Alpha Vantage rate limit exceeded"

**Nguyên nhân:** Free tier chỉ cho phép 25 calls/day

**Giải pháp:**
1. Đợi 24h để reset quota
2. Hoặc upgrade Premium API key
3. Hoặc dùng CSV import

---

### ❌ Error: "No time series data found"

**Nguyên nhân:** API key không hợp lệ hoặc symbol sai

**Giải pháp:**
```bash
# Kiểm tra API key
echo $ALPHA_VANTAGE_KEY

# Test API manually
curl "https://www.alphavantage.co/query?function=FX_INTRADAY&from_symbol=EUR&to_symbol=USD&interval=60min&apikey=YOUR_KEY"
```

---

### ❌ Error: "Database connection timeout"

**Nguyên nhân:** Supabase connection string sai hoặc network issue

**Giải pháp:**
```bash
# Kiểm tra .env file
cat .env | grep DB_

# Test connection
node scripts/check_db.js
```

---

## 📈 VERIFY DATA INGESTION

Sau khi chạy xong, kiểm tra database:

```sql
-- Kiểm tra số lượng records
SELECT COUNT(*) FROM market_data WHERE symbol = 'EURUSD=X';

-- Kiểm tra time range
SELECT 
    MIN(timestamp_utc) as earliest,
    MAX(timestamp_utc) as latest,
    COUNT(*) as total_candles
FROM market_data 
WHERE symbol = 'EURUSD=X';

-- Kiểm tra data quality
SELECT 
    DATE(timestamp_utc) as date,
    COUNT(*) as candles_per_day,
    AVG(close) as avg_price,
    MIN(low) as daily_low,
    MAX(high) as daily_high
FROM market_data 
WHERE symbol = 'EURUSD=X'
GROUP BY DATE(timestamp_utc)
ORDER BY date DESC
LIMIT 10;
```

**Kết quả mong đợi (60min timeframe):**
- ~24 candles/day (24 giờ)
- ~8,760 candles/year (365 ngày)

---

## 🎯 NEXT STEPS

Sau khi nạp data thành công:

### 1. Enable Historical Lookback trong Quantix Core

```javascript
// backend/quantix_core.js
async function analyzeSignal(currentPrice, symbol) {
    // Tra cứu historical patterns
    const historicalMatches = await findSimilarPatterns(symbol, currentPrice);
    
    // Tính confidence score dựa trên lịch sử
    const winRate = calculateWinRate(historicalMatches);
    
    return {
        confidence: winRate,
        historical_matches: historicalMatches.length
    };
}
```

### 2. Backtest Trading Strategy

```bash
# Chạy backtest trên data 2025
node scripts/backtest-strategy.js --year=2025 --symbol=EURUSD
```

### 3. Train AI Model

```bash
# Sử dụng data để train model
python ai/train_model.py --data=market_data --symbol=EURUSD
```

---

## 📞 SUPPORT

**Issues?** Contact:
- Telegram: (+84) 912580018
- GitHub: https://github.com/9dpi/ai-forecast-demo/issues

---

**Last Updated:** 2026-01-11  
**Version:** 1.0
