# Commercial Data Architecture Specification (V1.0)

## 1. Challenges & Solutions Overview

| Challenge | Impact | Proposed Solution |
|-----------|--------|-------------------|
| **Multi-Timezone** | Dự báo sai lệch thời gian (ví dụ: ngày T+1 của VN khác Mỹ). | **UTC Core Strategy**: Lưu trữ mọi timestamp dưới dạng UTC. Frontend tự quy đổi múi giờ dựa trên `Asset_Config` (VN30: Global+7, NYSE: Global-4). |
| **Anti-Scraping Strictness** | Các trang tài chính chặn IP/API request. | **AI Vision Scraper (The "Secret Weapon")**: Sử dụng Headless Browser chụp ảnh màn hình bảng giá -> Dùng AI OCR (Tesseract/Vision Model) để "đọc" số liệu. Bỏ qua hoàn toàn việc can thiệp vào Network/DOM. |

## 2. The "Waterfall" Failover Mechanism
Hệ thống sẽ không bao giờ phụ thuộc vào 1 nguồn duy nhất.

```mermaid
graph TD
    A[Request Data] --> B{Source 1: Yahoo (Free)};
    B -- Success --> E[Validation Layer];
    B -- Fail/RateLimit --> C{Source 2: AI Vision Scraper (Anti-Block)};
    C -- Success --> E;
    C -- Fail/Slow --> D{Source 3: Paid API (Polygon/Binance)};
    D -- Success --> E;
    D -- Fail --> F[Alert Admin & Use Last Known Data];
```

## 3. Database Architecture (The "Single Source of Truth")
Thay vì dùng `data.json`, chúng ta sẽ chuyển sang mô hình Database (PostgreSQL hoặc Supabase) để hỗ trợ Backtesting và Real-time.

### Schema Design (Draft)

**Table: `assets_master`**
- `symbol` (PK): VN30F1M, BTC-USD, AAPL...
- `type`: Future, Crypto, Stock.
- `timezone`: 'Asia/Ho_Chi_Minh', 'America/New_York'.
- `data_priority`: ['yahoo', 'binance', 'polygon'].

**Table: `market_data_raw`**
- `id` (PK)
- `symbol` (FK)
- `timestamp_utc` (Index)
- `open`, `high`, `low`, `close`, `volume`
- `source`: 'yahoo', 'binance' (để trace nguồn dữ liệu).

**Table: `ai_signals`**
- `id` (PK)
- `symbol` (FK)
- `timestamp_utc`
- `prediction_value`: (Giá dự báo).
- `confidence_score`: (Độ tin cậy %).
- `signal_type`: LONG/SHORT/WATCH.
- `is_published`: Boolean (Dùng cho cơ chế Gatekeeper - chỉ publish khi đã kiểm duyệt).

## 4. Validation Layer (Clean Data Policy)
Trước khi dữ liệu được INSERT vào DB hoặc đưa vào AI Model, nó phải vượt qua các bài test:

1.  **Integrity Check**: `High` phải >= `Low`. `Volume` không được âm.
2.  **Completeness Check**: Không chấp nhận `NaN` hoặc `Null` ở các trường quan trọng (OHLC).
3.  **Anomaly Detection**: Giá không được biến động quá `X%` (ví dụ 50%) trong 1 phút (trừng trường hợp Crypto flash crash, nhưng cần flag để review).

## 5. Implementation Roadmap (Milestone 2)

- [ ] **Step 1: Database Setup:** Khởi tạo PostgreSQL (local hoặc cloud free tier như Supabase/Neon).
- [ ] **Step 2: Python Data Engine:** Viết lại script fetch data theo mô hình OOP, hỗ trợ đa nguồn.
- [ ] **Step 3: API Middleware:** Xây dựng API nhẹ (FastAPI hoặc Node.js) để Frontend React gọi data thay vì đọc file tĩnh.
