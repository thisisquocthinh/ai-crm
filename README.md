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

## Kết nối Zalo cá nhân

1. Chạy app, vào mục **Kết nối** → **Đăng nhập bằng mã QR**.
2. Mở Zalo trên điện thoại → Quét mã QR → xác nhận đăng nhập.
3. Tin nhắn 1-1 mới sẽ tự hiện trong Hộp thư; khách mới nhắn tự được tạo hồ sơ.

Phiên đăng nhập được lưu trong database, lần sau mở app sẽ tự kết nối lại.

Lưu ý:
- Dùng thư viện không chính thức [zca-js](https://github.com/RFS-ADRENO/zca-js): có rủi ro bị khóa tài khoản.
- Chỉ một phiên Zalo Web chạy được cùng lúc: mở Zalo Web trên trình duyệt sẽ làm app bị ngắt.
- Chỉ nhận tin khi app đang chạy. Tin nhắn nhóm bị bỏ qua.
- File `prisma/dev.db` chứa phiên đăng nhập Zalo: không chia sẻ file này cho người khác.

Facebook chưa kết nối (tin gửi cho khách Facebook chỉ lưu trong app). Nút "Gợi ý AI" đang dùng câu mẫu, chưa gọi AI thật.
