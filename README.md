# AI CRM

Hộp thư gộp Fanpage Facebook + Zalo cá nhân, kèm nút gợi ý trả lời bằng AI dựa trên danh mục sản phẩm tự nhập. Dự án cá nhân.

Xem thiết kế: [docs/DESIGN.md](docs/DESIGN.md)

## Chạy trên máy

Cần Node.js 20 trở lên.

```bash
cd web
cp .env.example .env     # Windows: copy .env.example .env
npm install
npm run db:migrate       # tạo file database prisma/dev.db và nạp dữ liệu mẫu
npm run dev
```

Mở http://localhost:3000. Xem trên điện thoại cùng mạng Wi-Fi: `npm run dev -- -H 0.0.0.0` rồi mở `http://<IP-máy-tính>:3000`.

| Lệnh | Tác dụng |
|---|---|
| `npm run db:seed` | Xóa dữ liệu hiện có và nạp lại dữ liệu mẫu |
| `npm run db:reset` | Xóa sạch database và tạo lại từ đầu |
| `npx prisma studio` | Mở giao diện xem/sửa database trên trình duyệt |

Sao lưu dữ liệu: copy file `web/prisma/dev.db`.

Hiện tại tin nhắn gửi đi chỉ được lưu vào database (chưa kết nối Zalo/Facebook), nút "Gợi ý AI" dùng câu mẫu (chưa gọi AI thật).
