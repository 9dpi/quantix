# 🚀 QUANTIX CORE - AI FOREX SIGNAL SYSTEM

**Version:** 1.5 (Production Ready)  
**Status:** ✅ Live on Railway Cloud  
**Last Updated:** 2026-01-11

---

## 📋 QUICK START

**New to the project?** Start here:

```bash
# 1. Install dependencies
npm install

# 2. Test database connection
npm run db:check

# 3. Read the quick start guide
# Open: QUICKSTART.md
```

**For detailed setup:** See [`QUICKSTART.md`](./QUICKSTART.md)

---

## 🎯 WHAT IS QUANTIX CORE?

A **production-grade AI trading system** that:
- 📊 Monitors EUR/USD 24/7 on Railway Cloud
- 🤖 Generates trading signals with AI confidence scores
- 📱 Sends real-time alerts via Telegram
- 📈 Tracks Entry, TP1, TP2, Stop Loss automatically
- 🌐 Displays live signals on GitHub Pages
- 💾 Stores historical data for backtesting

**Live Demo:** https://9dpi.github.io/ai-forecast-demo/#/mvp

---

## 🏗️ SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────┐
│                 QUANTIX CORE SYSTEM                 │
└─────────────────────────────────────────────────────┘

DATA SOURCES                 PROCESSING              OUTPUT
─────────────               ──────────────          ────────
Alpha Vantage  ──┐                                  
Yahoo Finance  ──┼──→ Price Watchdog ──→ Supabase ──→ Frontend
CSV (MT5/TV)   ──┘      (Railway)         (DB)       (GitHub)
                                            │
                                            ├──→ Telegram Bot
                                            └──→ Historical Data
```

**Key Components:**
- **Backend:** Node.js (Railway Cloud)
- **Database:** PostgreSQL (Supabase)
- **Frontend:** React + Vite (GitHub Pages)
- **Automation:** GitHub Actions (Cron jobs)
- **Alerts:** Telegram Bot API

---

## ✨ NEW: CONTINUOUS IMPROVEMENT SYSTEM

**Version 1.5 introduces:**

### 📥 Historical Data Ingestion
```bash
npm run data:ingest
```
- Import 1 year+ of EURUSD data
- Multi-source support (Alpha Vantage, CSV)
- Automatic data cleaning & validation
- Spike detection & timezone normalization

### 🔍 Data Quality Validation
```bash
npm run data:validate
```
- 7-point quality checks
- Missing candle detection
- Price anomaly detection
- Health score (0-100)

### 🏥 Railway Health Monitoring
- Daily deployment checks
- API health monitoring
- Resource usage tracking
- Error log analysis

**Full Guide:** [`CONTINUOUS_IMPROVEMENT.md`](./CONTINUOUS_IMPROVEMENT.md)

---

## 📚 DOCUMENTATION

### 🚀 Getting Started
- [`QUICKSTART.md`](./QUICKSTART.md) - 5-minute setup guide
- [`SYSTEM_STATUS_REPORT.md`](./SYSTEM_STATUS_REPORT.md) - Current system status
- [`README_PRODUCTION.md`](./README_PRODUCTION.md) - Production deployment

### 🔧 Development
- [`DATA_INGESTION_GUIDE.md`](./DATA_INGESTION_GUIDE.md) - Import historical data
- [`RAILWAY_HEALTH_CHECK.md`](./RAILWAY_HEALTH_CHECK.md) - Monitoring checklist
- [`CONTINUOUS_IMPROVEMENT.md`](./CONTINUOUS_IMPROVEMENT.md) - Daily workflows

### 🏗️ Architecture
- [`DISTRIBUTED_ARCHITECTURE.md`](./DISTRIBUTED_ARCHITECTURE.md) - System design
- [`DATA_ARCHITECTURE.md`](./DATA_ARCHITECTURE.md) - Database schema
- [`DATABASE_SETUP_GUIDE.md`](./DATABASE_SETUP_GUIDE.md) - DB configuration

### 🚀 Deployment
- [`RAILWAY_DEPLOYMENT_GUIDE.md`](./RAILWAY_DEPLOYMENT_GUIDE.md) - Railway setup
- [`CLOUD_DEPLOYMENT_TEST.md`](./CLOUD_DEPLOYMENT_TEST.md) - Deployment tests
- [`GITHUB_ACTIONS_SETUP.md`](./GITHUB_ACTIONS_SETUP.md) - CI/CD setup

### 📊 Reports
- [`IMPLEMENTATION_SUMMARY.md`](./IMPLEMENTATION_SUMMARY.md) - Feature overview
- [`MISSION_ACCOMPLISHED.md`](./MISSION_ACCOMPLISHED.md) - Latest achievements
- [`INTEGRATION_REPORT_DAY1.md`](./INTEGRATION_REPORT_DAY1.md) - Integration tests

---

## 🛠️ NPM SCRIPTS

```bash
# Development
npm run dev              # Start frontend dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Backend
npm start                # Start Price Watchdog (local)
npm run test:server      # Test backend server
npm run test:bridge      # Test Supabase connection

# Data Management (NEW!)
npm run data:ingest      # Import historical data
npm run data:validate    # Validate data quality
npm run db:check         # Test database connection
npm run db:clean         # Clean test data
```

---

## 📊 FEATURES

### ✅ Core Features (V1.0)
- [x] Real-time EUR/USD price monitoring
- [x] AI signal generation (LONG/SHORT)
- [x] Automatic Entry/TP/SL tracking
- [x] Telegram alerts
- [x] Live dashboard (GitHub Pages)
- [x] Supabase database integration

### ✅ New Features (V1.5)
- [x] Historical data ingestion pipeline
- [x] Data quality validation system
- [x] Railway health monitoring
- [x] Multi-source data support (API + CSV)
- [x] Batch processing (1000 records/batch)
- [x] Comprehensive documentation (1,800+ lines)

### 🔜 Roadmap (V2.0)
- [ ] Historical lookback for AI predictions
- [ ] Multi-symbol support (GBPUSD, USDJPY)
- [ ] Backtesting framework
- [ ] Machine learning model training
- [ ] Advanced analytics dashboard

---

## 🎯 SUCCESS METRICS

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| System Uptime | >99% | TBD | ⏳ |
| Signal Accuracy | >70% | TBD | ⏳ |
| Data Coverage | >95% | Ready | ✅ |
| API Response Time | <2s | ~1s | ✅ |
| Database Query | <500ms | ~50ms | ✅ |
| Documentation | 100% | 100% | ✅ |

---

## 🔗 IMPORTANT LINKS

**Production:**
- Live Website: https://9dpi.github.io/ai-forecast-demo/#/mvp
- Railway Dashboard: https://railway.app/dashboard
- Supabase Dashboard: https://supabase.com/dashboard/project/gvglzvjsexeaectypkyk

**Development:**
- GitHub Repo: https://github.com/9dpi/ai-forecast-demo
- GitHub Actions: https://github.com/9dpi/ai-forecast-demo/actions

**External APIs:**
- Alpha Vantage: https://www.alphavantage.co/
- TradingView: https://www.tradingview.com/symbols/EURUSD/

---

## 🏆 MILESTONES

### ✅ Milestone 1: Foundation (COMPLETED)
- [x] Project initialization (Vite + React)
- [x] Design system (Colors, Typography)
- [x] Landing page (Hero, Features)
- [x] Mock authentication
- [x] Responsive design

### ✅ Milestone 2: Backend Integration (COMPLETED)
- [x] Supabase database setup
- [x] Price Watchdog (Railway)
- [x] Scanner Engine (GitHub Actions)
- [x] Telegram bot integration
- [x] Real-time signal tracking

### ✅ Milestone 3: Continuous Improvement (COMPLETED)
- [x] Historical data ingestion
- [x] Data quality validation
- [x] Health monitoring system
- [x] Comprehensive documentation
- [x] Developer workflows

### 🔜 Milestone 4: AI Enhancement (IN PROGRESS)
- [ ] Historical lookback integration
- [ ] ML model training
- [ ] Backtesting framework
- [ ] Multi-symbol expansion

---

## 🤝 CONTRIBUTING

**Want to contribute?**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

**Issues?** Create a GitHub Issue: https://github.com/9dpi/ai-forecast-demo/issues

---

## 📞 SUPPORT

**Questions?**
- Telegram: (+84) 912580018
- Email: [Your Email]

**Documentation Issues?**
- Check [`CONTINUOUS_IMPROVEMENT.md`](./CONTINUOUS_IMPROVEMENT.md) troubleshooting section
- Review [`QUICKSTART.md`](./QUICKSTART.md) FAQ

---

## 📄 LICENSE

This project is proprietary software. All rights reserved.

---

## 🎉 ACKNOWLEDGMENTS

**Built with:**
- React + Vite
- Supabase (PostgreSQL)
- Railway (Cloud Hosting)
- Alpha Vantage API
- Telegram Bot API
- GitHub Actions

**Special Thanks:**
- Antigravity AI Assistant (Development)
- Community Contributors

---

**Ready to start?** Run:
```bash
npm run db:check
```

**Let's build the future of trading! 🚀**
