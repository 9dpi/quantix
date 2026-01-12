# 📂 DATA FOLDER

This folder contains historical market data for ingestion into the Quantix Core system.

## 📄 File Format

### CSV Template: `eurusd_sample.csv`

**Required Columns:**
```
timestamp,open,high,low,close,volume
```

**Format Specifications:**
- **timestamp:** `YYYY-MM-DD HH:MM:SS` (24-hour format, UTC timezone)
- **open:** Decimal (e.g., `1.0520`)
- **high:** Decimal (e.g., `1.0525`)
- **low:** Decimal (e.g., `1.0515`)
- **close:** Decimal (e.g., `1.0522`)
- **volume:** Integer or `0` (Forex typically has no volume)

**Example:**
```csv
timestamp,open,high,low,close,volume
2025-01-01 00:00:00,1.0520,1.0525,1.0515,1.0522,0
2025-01-01 01:00:00,1.0522,1.0530,1.0520,1.0528,0
```

---

## 📥 How to Export from MT5

### Step 1: Open MetaTrader 5
1. Launch MT5 platform
2. Navigate to **Tools → History Center** (F2)

### Step 2: Select Symbol & Timeframe
1. Find **EURUSD** in the symbol list
2. Select timeframe (e.g., **H1** for 1-hour candles)
3. Click **Export**

### Step 3: Save as CSV
1. Choose save location: `d:\Automator_Prj\AI_Smart_Forecast_Comercial\data\`
2. Filename: `eurusd_2025.csv`
3. Format: **CSV (Comma Separated Values)**

### Step 4: Verify Format
Open the CSV file and ensure it matches this format:
```
Date,Time,Open,High,Low,Close,Volume
2025.01.01,00:00,1.0520,1.0525,1.0515,1.0522,0
```

**⚠️ Important:** If MT5 format differs, you may need to convert it:
```bash
# Use the conversion script (if needed)
node scripts/convert-mt5-csv.js data/eurusd_mt5.csv data/eurusd_2025.csv
```

---

## 📥 How to Export from TradingView

### Step 1: Open Chart
1. Go to https://www.tradingview.com/symbols/EURUSD/
2. Select timeframe (e.g., **1H**)
3. Set date range to **2025**

### Step 2: Export Data
1. Click **...** (More) → **Export chart data**
2. Save as `eurusd_tradingview.csv`

### Step 3: Convert Format
TradingView format is usually compatible, but verify:
```csv
time,open,high,low,close,volume
2025-01-01 00:00:00,1.0520,1.0525,1.0515,1.0522,0
```

If column names differ, rename them to match our template.

---

## 🚀 Usage

Once you have your CSV file ready:

```bash
# 1. Place CSV in this folder
cp /path/to/your/data.csv data/eurusd_2025.csv

# 2. Update config in scripts/data-ingestion-2025.js
# Change DATA_SOURCE to 'CSV'
# Set CSV_PATH to './data/eurusd_2025.csv'

# 3. Run ingestion
npm run data:ingest

# 4. Validate data quality
npm run data:validate
```

---

## 📊 Supported Symbols

Currently configured for:
- **EURUSD** (EUR/USD Forex Pair)

To add more symbols:
1. Export data for the new symbol
2. Update `CONFIG.SYMBOL` in `scripts/data-ingestion-2025.js`
3. Ensure symbol exists in `assets_master` table

---

## 🗑️ .gitignore

Large CSV files are excluded from Git to save space:
```
data/*.csv
!data/eurusd_sample.csv
```

Only the sample template is tracked in version control.

---

## 📞 Support

**Issues with data format?**
- Check `DATA_INGESTION_GUIDE.md`
- Contact: Telegram (+84) 912580018

---

**Last Updated:** 2026-01-11
