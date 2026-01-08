# Cost Analysis: AI Vision Scraper Strategy

Bạn hoàn toàn đúng khi lo ngại về chi phí Token. Nếu dùng trực tiếp các Model khủng như GPT-4o hay Gemini Pro Vision để "nhìn" bảng điện liên tục, chi phí sẽ rất cao.

Dưới đây là bài toán chi phí và giải pháp tối ưu **Chi phí bằng 0 đồng** (Zero Cost).

## 1. Bài toán chi phí (Nếu dùng Cloud AI API)
Giả sử dùng GPT-4o để phân tích ảnh chụp màn hình bảng giá:
- **Đơn giá:** ~$0.0038 / 1 ảnh (độ phân giải trung bình).
- **Tần suất:** Quét 1 phút/lần trong phiên giao dịch (4 tiếng/ngày).
- **Số lượng request:** 4 giờ x 60 phút = 240 requests/ngày.
- **Tổng chi phí:** 240 * $0.0038 = **$0.91 / ngày** (~23,000 VNĐ).
- **Tháng (20 ngày giao dịch):** **~$18.2 / tháng**.

=> **Nhận định:** Chấp nhận được với quy mô doanh nghiệp, nhưng **lãng phí** với startup giai đoạn đầu. Hơn nữa, độ trễ mạng (Network Latency) khi gửi ảnh đi và chờ phản hồi sẽ làm chậm dữ liệu (3-5 giây).

## 2. Giải pháp Tối ưu: Local AI OCR (Chi phí $0)
Thay vì gửi ảnh lên Cloud, chúng ta chạy **AI Model ngay trên Server** (Github Actions hoặc VPS).

### Công nghệ đề xuất: **PaddleOCR** hoặc **EasyOCR**
Đây là các thư viện Open Source chuyên nhận diện chữ số, cực nhẹ và cực nhanh.

| Đặc điểm | Cloud AI (GPT-4o) | Local AI (PaddleOCR/EasyOCR) |
|----------|-------------------|------------------------------|
| **Chi phí** | ~$18/tháng | **$0 (Miễn phí)** |
| **Độ trễ** | 3-5 giây | **< 0.5 giây** |
| **Độ chính xác** | Rất cao (hiểu ngữ cảnh) | **Rất cao (với bảng số liệu)** |
| **Phụ thuộc** | Internet, API Key | Server CPU/GPU |

### Cơ chế hoạt động (Kiến trúc "Tiết kiệm")

1.  **Snapshot:** Puppeteer chụp ảnh màn hình bảng giá (chỉ cắt đúng phần bảng số để ảnh nhỏ, xử lý nhanh).
2.  **Local OCR:** Script Python dùng `PaddleOCR` đọc ảnh -> ra text (VD: `VIC: 45.5`).
3.  **Fallback (Dự phòng):** Chỉ khi nào Local OCR không đọc được (gặp số lạ, mờ), hệ thống mới gửi ảnh đó lên Cloud AI (Gemini Flash - rẻ hơn) để hỏi. -> Giảm 99% chi phí token.

## 3. Kết luận
Chúng ta sẽ đi theo hướng **Local OCR**.
- **Công cụ:** Python + Playwright (Chụp ảnh) + PaddleOCR (Đọc số).
- **Token Cost:** **0 VNĐ**.
- **Server Cost:** Tận dụng GitHub Actions (Free tier) hoặc VPS trọn gói giá rẻ.

=> Giải pháp này vừa **nhanh (Real-time)**, vừa **miễn phí**, đúng tinh thần startup!
