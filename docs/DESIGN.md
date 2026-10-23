# AI CRM – Tài liệu thiết kế (v0.1)

Công cụ cá nhân giúp tư vấn bán hàng online: gộp tin nhắn **Fanpage Facebook** và **Zalo cá nhân** vào một hộp thư, có thông báo đẩy, và nút **"Gợi ý AI"** soạn câu trả lời dựa trên danh mục sản phẩm/giá/mã do mình tự nhập.

> Dùng cá nhân, không kinh doanh. Quy mô: < 10 khách/ngày, 1 người dùng.

## 1. Phạm vi

### Có
- Hộp thư gộp (Facebook Page + Zalo cá nhân), gửi/nhận tin, xem lịch sử.
- Thông báo đẩy (Web Push trên PWA) khi có tin mới.
- Danh mục sản phẩm nhập tay: mã, tên, giá, giá khuyến mãi, ghi chú (bảo hành, trả góp…).
- Nút **Gợi ý AI**: AI đọc hội thoại + sản phẩm liên quan → soạn nháp vào ô nhập. **Mình luôn là người bấm gửi.**
- Hồ sơ khách: tên, SĐT, sản phẩm quan tâm, trạng thái, ghi chú, ngày hẹn follow-up.

### Không (ít nhất ở v1)
- AI tự trả lời / tự chốt đơn.
- RAG/vector search (danh mục nhỏ → đưa thẳng vào prompt hoặc lọc theo từ khóa/mã).
- App native (dùng PWA, cài lên màn hình chính điện thoại).
- Nhiều người dùng / phân quyền.

## 2. Kiến trúc

```
 Facebook Page ──webhook──▶ ┐
                            │   ┌──────────────┐     ┌────────────┐
                            ├──▶│  Server Node │────▶│ PostgreSQL │
 Zalo cá nhân ◀──zca-js────▶┘   │ (API + worker)│     └────────────┘
                                └──────┬───────┘
                                       │ REST + SSE/WebSocket + Web Push
                                       ▼
                                 Web/PWA (điện thoại + máy tính)
                                       │ "Gợi ý AI"
                                       ▼
                                   Claude API
```

- **Một process Node chạy 24/7** trên VPS nhỏ (Zalo cần giữ kết nối liên tục → không dùng serverless).
- Facebook: Messenger Platform, app ở chế độ Development (chỉ mình dùng → không cần App Review). Nhận qua webhook (cần HTTPS công khai), gửi qua Send API.
- Zalo: thư viện không chính thức `zca-js` (đăng nhập QR / cookie). **Rủi ro chấp nhận:** có thể bị khóa tài khoản hoặc hỏng khi Zalo cập nhật → tách thành adapter riêng để dễ thay.

## 3. Công nghệ đề xuất

| Phần | Lựa chọn |
|---|---|
| Frontend | Next.js (App Router) + Tailwind, PWA |
| Backend | Next.js route handlers + 1 worker Node (Zalo listener) |
| DB | SQLite (Prisma ORM); chuyển PostgreSQL khi cần mở rộng |
| Realtime | Server-Sent Events |
| Thông báo | Web Push (VAPID) |
| AI | Claude API |
| Hosting | VPS + Docker Compose + Caddy (HTTPS tự động) |

## 4. Mô hình dữ liệu (sơ bộ)

Xem chi tiết ở `web/prisma/schema.prisma`.

- `Contact` – một danh tính trên một kênh kèm hội thoại: channel (`facebook`/`zalo`), externalId, name, phone, stage (`moi`, `dang_tu_van`, `hen_ghe`, `da_chot`, `khong_mua`), note, followUpAt, unread, lastMessageAt
- `Message` – contactId, direction (`in`/`out`), text, externalId, sentAt
- `Product` – code (mã, duy nhất), name, category, price, salePrice, note
- `ContactProduct` – sản phẩm khách quan tâm

## 5. Nút "Gợi ý AI"

1. Lấy ~20 tin gần nhất của hội thoại.
2. Chọn sản phẩm liên quan: khớp mã/tên xuất hiện trong hội thoại + sản phẩm đã gắn cho khách (danh mục nhỏ thì gửi toàn bộ).
3. Prompt: vai trò tư vấn viên điện máy, xưng hô lịch sự, **chỉ dùng giá trong danh mục, không bịa giá/khuyến mãi**; nếu thiếu thông tin thì hỏi lại khách.
4. Trả về 1–3 phương án ngắn → bấm chọn để đưa vào ô nhập, sửa rồi gửi.

## 6. Ràng buộc nền tảng cần nhớ

- **Messenger – luật 24h:** chỉ nhắn tự do trong 24h kể từ tin cuối của khách. Ngoài khung → UI cảnh báo, gợi ý chuyển sang Zalo/gọi điện.
- Dữ liệu khách là dữ liệu cá nhân → lưu trên máy chủ của mình, có đăng nhập bảo vệ, không chia sẻ.

## 7. Lộ trình

1. **M1 – Khung dự án + lưu dữ liệu (SQLite):** ✅ giao diện, sản phẩm, khách hàng, trạng thái, follow-up. Còn lại: đăng nhập, Docker.
2. **M2 – Facebook:** webhook, lưu tin, gửi tin, hộp thư realtime.
3. **M3 – Zalo:** ✅ adapter `zca-js` (`web/src/server/zalo.ts`), đăng nhập QR, nhận/gửi tin 1-1, cập nhật realtime qua SSE.
4. **M4 – Thông báo đẩy + PWA.**
5. **M5 – Danh mục sản phẩm + nút Gợi ý AI.**
6. **M6 – Hồ sơ khách, trạng thái, nhắc follow-up.**
