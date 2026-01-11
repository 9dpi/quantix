# 🤖 QUANTIX GEMINI AI BOT - SETUP GUIDE

## 📋 TỔNG QUAN
Quantix Telegram Bot được tích hợp Gemini AI để trở thành một **AI Trading Advisor** thông minh:
- Trả lời câu hỏi về thị trường
- Giải thích tín hiệu giao dịch
- Tư vấn dựa trên dữ liệu thực từ Supabase
- Phong cách: Chuyên nghiệp, thân thiện, ưu tiên quản trị rủi ro

---

## 🔧 CÀI ĐẶT

### 1. Thêm GEMINI_API_KEY vào `.env`

Mở file `.env` (tại thư mục gốc dự án) và thêm dòng sau:

```env
# Gemini AI Configuration
GEMINI_API_KEY=your_api_key_here
```

**Lấy API Key từ đâu?**
1. Truy cập: https://aistudio.google.com/app/apikey
2. Đăng nhập bằng Google Account
3. Click "Create API Key"
4. Copy key và paste vào `.env`

### 2. Kiểm tra các biến môi trường khác

Đảm bảo file `.env` có đầy đủ:
```env
# Database (Supabase)
DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com
DB_USER=postgres.xxx
DB_PASSWORD=your_password
DB_NAME=postgres
DB_PORT=6543

# Telegram Bot
TELEGRAM_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Gemini AI
GEMINI_API_KEY=your_gemini_key
```

---

## 🚀 CHẠY BOT

### Chạy tại Local (Máy cá nhân)
```bash
npm run bot
```

**Kết quả mong đợi:**
```
🤖 Quantix Telegram Bot is ONLINE...
✅ Bot is listening for messages...
```

### Test Bot
1. Mở Telegram
2. Tìm bot của bạn (tên bot bạn đã tạo với @BotFather)
3. Gửi lệnh: `/start`
4. Thử hỏi: "Tín hiệu gần nhất thế nào?"

---

## 💬 CÁC LỆNH BOT

| Lệnh | Mô tả |
| :--- | :--- |
| `/start` | Khởi động bot và xem hướng dẫn |
| `/status` | Kiểm tra trạng thái hệ thống và tín hiệu mới nhất |
| Bất kỳ câu hỏi nào | Bot sẽ dùng Gemini AI để trả lời dựa trên dữ liệu thực |

**Ví dụ câu hỏi:**
- "Chiến lược V1.5 là gì?"
- "Tín hiệu gần nhất có đáng tin không?"
- "EUR/USD hiện tại thế nào?"
- "Tôi nên vào lệnh bây giờ không?"

---

## 🌐 TRIỂN KHAI LÊN RAILWAY (CLOUD)

Khi bạn muốn bot chạy 24/7 trên Cloud:

### 1. Thêm biến môi trường trên Railway Dashboard
- Vào project Quantix Core trên Railway
- Tab **Variables**
- Thêm: `GEMINI_API_KEY = your_key_here`

### 2. Cập nhật lệnh Start (Tùy chọn)
Nếu bạn muốn Railway chạy Bot thay vì Watchdog:
- Sửa `package.json`:
  ```json
  "start": "node backend/bot.js"
  ```
- Hoặc chạy cả 2 bằng `concurrently` (cài thêm package).

### 3. Push code
```bash
git add .
git commit -m "feat: integrated Gemini AI into Telegram Bot"
git push origin main
```

Railway sẽ tự động deploy.

---

## 🧠 CÁCH HOẠT ĐỘNG

```
User Question (Telegram)
    ↓
backend/bot.js (Nhận tin nhắn)
    ↓
backend/ai_processor.js
    ├─ Fetch market data từ Supabase
    ├─ Tạo prompt với context
    └─ Gọi Gemini AI
    ↓
Gemini AI trả lời
    ↓
Gửi về Telegram
```

---

## ⚠️ LƯU Ý

1. **API Quota:** Gemini Free tier có giới hạn requests/phút. Nếu bot bị spam, có thể bị rate limit.
2. **Chi phí:** Gemini 1.5 Flash miễn phí cho usage thấp. Nếu traffic cao, cân nhắc nâng cấp.
3. **Bảo mật:** KHÔNG commit file `.env` lên GitHub (đã được gitignore).

---

## 🎯 NEXT STEPS

- [ ] Test bot với các câu hỏi khác nhau
- [ ] Tinh chỉnh prompt trong `ai_processor.js` để phù hợp phong cách
- [ ] Thêm lệnh `/backtest` để user có thể yêu cầu chạy backtest
- [ ] Tích hợp voice message (Gemini hỗ trợ audio)

*Documented by Quantix Core Team*
