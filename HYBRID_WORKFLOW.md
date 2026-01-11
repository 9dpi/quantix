# 🌐 QUANTIX CORE: HYBRID OPERATIONS MANUAL
> **Philosophy:** "Train Heavy Locally, Serve Light on Cloud."
> **Cost Efficiency:** Maximize Local resources, Minimize Railway ($5/mo) load.

---

## 🏗️ KIẾN TRÚC HỆ THỐNG (ARCHITECTURE SPLIT)

| Thành phần | Môi trường | Nhiệm vụ (Role) | Tài nguyên |
| :--- | :--- | :--- | :--- |
| **THE BRAIN** | 🖥️ **LOCAL (PC)** | Nạp dữ liệu lớn, Backtest, Training, Tối ưu thuật toán. | Tận dụng CPU/RAM mạnh mẽ của máy cá nhân. |
| **THE MESSENGER** | ☁️ **CLOUD (Railway)** | Chạy Watchdog, Quét giá M15, Gửi Telegram, Host Dashboard. | 8GB RAM / 8 vCPU (Hobby Plan) - Dư sức chạy 24/7. |
| **THE HEART** | 🗄️ **DATABASE (Supabase)** | Lưu trữ tập trung. Cả Local và Cloud đều trỏ về đây. | Cloud Database (Shared). |

---

## 🛠️ PHẦN 1: CÁC LỆNH DÀNH RIÊNG CHO LOCAL (YOUR PC)
*Chỉ chạy các lệnh này trên Terminal của VS Code máy bạn.*

### 1. Nạp nhiên liệu ("Chiến dịch Đại bàng")
Dùng để tải lượng dữ liệu khổng lồ (10 năm) mà không làm treo server Railway.
```bash
# Nạp 10 năm dữ liệu cho EURUSD
npm run data:ingest:bulk -- --years=10 --assets=EURUSD

# Nạp 3 năm dữ liệu cho Vàng (XAUUSD)
npm run data:ingest:bulk -- --years=3 --assets=XAUUSD

# Nạp full thị trường (Tất cả cặp tiền)
npm run data:ingest:bulk -- --years=10 --assets=EURUSD,XAUUSD,GBPUSD
```

### 2. Tối ưu "Bộ não" (Backtesting)
Dùng để kiểm thử chiến thuật trước khi đưa lên Online.
```bash
# Chạy Backtest với cấu hình hiện tại
npm run backtest -- --asset=EURUSD

# Kiểm tra chất lượng dữ liệu (Health Check)
npm run data:validate
```

### 3. Quy trình "Silent Learning" (Hàng tuần)
1.  **Pull Data:** Tải dữ liệu tuần mới nhất về.
2.  **Verify:** Chạy `npm run backtest` để xem Strategy V1.5 còn hiệu quả không.
3.  **Adjust:** Nếu Winrate giảm, sửa code tại `backend/price_watchdog.js`.
4.  **Deploy:** Đẩy code mới lên Railway.

---

## ☁️ PHẦN 2: CÁC LỆNH DÀNH RIÊNG CHO CLOUD (RAILWAY)
*Những lệnh này chạy tự động trên Server, bạn KHÔNG CẦN gõ tay (trừ khi debug).*

### 1. The Watchdog (Mặc định)
Đây là tiến trình duy nhất Railway cần chạy (được định nghĩa trong `package.json` -> `start`).
```bash
# Lệnh này Railway tự chạy khi Deploy
npm start
# (Tương đương: node backend/price_watchdog.js)
```
*Nhiệm vụ:* Cứ 5 giây (hoặc 15 phút) thức dậy 1 lần, so sánh giá real-time với logic V1.5, bắn Telegram nếu khớp.

### 2. Scheduler (Tùy chọn)
Nếu bạn muốn Railway tự nạp dữ liệu mới mỗi ngày (nhẹ nhàng).
```bash
npm run scheduler
```

---

## 🚀 QUY TRÌNH DEPLOY CHUẨN (BRIDGE LOCAL -> CLOUD)

Khi bạn đã Backtest ở Local và thấy **LÃI (+)**, hãy làm theo bước sau để đưa nó lên mây:

1.  **Commit Code:**
    ```bash
    git add .
    git commit -m "feat: updated strategy logic based on backtest results"
    ```

2.  **Push to Cloud:**
    ```bash
    git push origin main
    ```

3.  **Relax:**
    Railway sẽ tự động phát hiện thay đổi -> Build lại -> Restart Watchdog với trí tuệ mới nhất.

---

## ⚠️ QUY TẮC BẤT DI BẤT DỊCH
1.  **KHÔNG** chạy `data:ingest:bulk` 10 năm trên Railway (Sẽ bị OOM - Out of Memory hoặc tốn CPU credit).
2.  **LUÔN** kiểm tra Backtest ở Local trước khi Push code sửa logic Watchdog.
3.  **LUÔN** giữ 2 file .env riêng biệt (Local dùng key nạp data, Railway dùng key chạy bot).

*Documented by Quantix Core AI Assistant*
