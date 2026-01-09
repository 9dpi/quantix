# 🚀 PHASE 2 ROADMAP: ADVANCED TRADING CONSOLE

**Mục tiêu:** Nâng cấp Dashboard từ "Signal Viewer" thành "Pro Trading Console" với các chỉ số thực chiến.

---

## 1️⃣ Last Updated Timestamp (Độ trễ dữ liệu)
**Vấn đề:** Trader sợ dữ liệu bị treo (frozen).
**Giải pháp:** 
- Thêm dòng nhỏ dưới giá EUR/USD: `Last updated: 10:56:02 AM`
- Tự động chuyển màu (Xám → Đỏ) nếu dữ liệu cũ quá 1 phút.
**Tác dụng:** Khẳng định tính "Live" và tạo niềm tin tuyệt đối.

---

## 2️⃣ Real-time P/L in Pips (Lãi/Lỗ thực tế)
**Vấn đề:** Khi lệnh đang chạy (`ENTRY_HIT`), Trader muốn biết đang lời/lỗ bao nhiêu mà không cần tính nhẩm.
**Giải pháp:**
- Hiển thị label cạnh cột Status.
- Logic: `(CurrentPrice - EntryPrice) * 10000` (với cặp EURUSD).
- **Màu sắc:**
  - Lời: `Floating: +12.5 pips` (Màu xanh neon / bg xanh nhạt)
  - Lỗ: `Floating: -5.2 pips` (Màu đỏ / bg đỏ nhạt)
**Tác dụng:** Biến Dashboard thành Terminal quản lý lệnh chuyên nghiệp.

---

## 3️⃣ Partial Take Profit Logic (Quản lý rủi ro)
**Vấn đề:** Trader chuyên nghiệp chốt lời từng phần (Scale out).
**Giải pháp:**
- Khi `TP1 Hit`:
  - Đổi Status thành: `TP1 Hit (Secured)` 🛡️
  - Đổi màu giá **Entry** thành màu xanh (ám chỉ "Risk Free" / "Breakeven").
- Khi `TP2 Hit`:
  - Status: `TP2 Hit (Full Profit)` 💰
**Tác dụng:** Thể hiện sự am hiểu sâu sắc về quản lý vốn (Risk Management) và tâm lý giao dịch.

---

## 🛠️ Kế hoạch kỹ thuật
1. **Frontend:**
   - Update `AppMVP.jsx` để tính toán Pips realtime.
   - Thêm logic render màu sắc cho Status và Entry.
   - Thêm state `lastUpdated` từ socket payload.
2. **Backend:**
   - Watchdog không cần thay đổi nhiều (chỉ cần đảm bảo đẩy timestamp chuẩn).

---
*Created: 09/01/2026*
