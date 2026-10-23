# AI CRM – Hướng dẫn cho Claude

## Về dự án và người dùng

- Công cụ **cá nhân** (không kinh doanh) của một nhân viên tư vấn bán hàng online tại cửa hàng điện máy (Điện Máy Xanh). Quy mô: 1 người dùng, dưới 10 khách/ngày.
- Mục tiêu: gộp tin nhắn **Fanpage Facebook** và **Zalo cá nhân** vào một hộp thư để không phải chuyển qua lại giữa hai app, kèm nút **"Gợi ý AI"** soạn câu trả lời dựa trên mã/giá sản phẩm do người dùng tự nhập.
- **AI không tự trả lời khách.** AI chỉ soạn nháp, người dùng luôn là người bấm gửi.
- Người dùng giao tiếp bằng **tiếng Việt** và không phải lập trình viên chuyên nghiệp: trả lời bằng tiếng Việt, giải thích đơn giản, đưa lệnh cụ thể để chạy, nói rõ lệnh nào nguy hiểm (xóa dữ liệu).
- Máy chính để xem giao diện: **HONOR Magic V5** (điện thoại gập). Giao diện phải dùng tốt trên cả hai màn hình.
- Chưa có VPS: hiện chạy trên máy tính cá nhân (Windows). Facebook sẽ dùng **Cloudflare Tunnel** để có HTTPS. Khi có server sẽ cân nhắc Google Cloud e2-micro (Always Free).

Thiết kế chi tiết và lộ trình: `docs/DESIGN.md`.

## Công nghệ và các quyết định đã chốt

| Phần | Lựa chọn | Lý do |
|---|---|---|
| Web | Next.js 15 (App Router) + React 19 + TypeScript | Một codebase cho giao diện và server |
| Giao diện | Tailwind CSS v4 + `lucide-react` + font Be Vietnam Pro | Phong cách kính mờ, bo góc lớn, nút tròn, mục đang chọn là viên thuốc màu đen (theo mẫu SugarCRM "Customer Journeys") |
| Database | **SQLite** qua Prisma 6 | Không cần cài đặt, nhẹ RAM. Chỉ dùng tính năng mà cả SQLite và PostgreSQL đều có, để sau này chuyển PostgreSQL dễ |
| Zalo | `zca-js` (không chính thức, giả lập Zalo Web) | Người dùng **đã chấp nhận rủi ro** khóa tài khoản |
| Facebook | Messenger Platform (webhook + Send API), app ở chế độ Development | Chỉ Fanpage, không có API cho Facebook cá nhân |
| Realtime | Server-Sent Events (`/api/events`) | Báo giao diện gọi `router.refresh()` khi có tin mới |
| AI | Claude API (chưa làm) | |

Không dùng: MongoDB, MySQL, shared hosting, serverless (Zalo cần tiến trình chạy liên tục), app native (dùng PWA).

## Cấu trúc code (`web/`)

```
prisma/schema.prisma        Contact, Message, Product, ContactProduct, Setting
prisma/seed.ts              Dữ liệu mẫu (giờ theo Asia/Ho_Chi_Minh)
src/app/page.tsx            Server component: loadData() → <AppShell>
src/app/actions.ts          Server actions (sản phẩm, khách, tin nhắn, đăng nhập Zalo)
src/app/api/events/         SSE
src/app/api/zalo/           Trạng thái kết nối Zalo
src/instrumentation.ts      Khi server khởi động: khôi phục phiên Zalo
src/server/zalo.ts          Kết nối zca-js, nhận/gửi tin, lưu phiên vào bảng Setting
src/server/events.ts        EventEmitter dùng chung (trên globalThis)
src/lib/                    db, queries (DTO), types, format (giờ VN), suggest (gợi ý mẫu)
src/components/             app-shell, inbox, overview (pipeline + báo cáo), products, connections, ui
```

- Một `Contact` = một danh tính trên một kênh (`channel` + `externalId` là duy nhất), chứa luôn hội thoại. `externalId` null nghĩa là khách thêm tay.
- Trạng thái khách (`stage`): `moi`, `dang_tu_van`, `hen_ghe`, `da_chot`, `khong_mua`.
- Giá lưu dạng số nguyên VND.
- Dữ liệu từ server xuống client là DTO, ngày tháng dạng chuỗi ISO. Luôn định dạng giờ bằng `src/lib/format.ts` (cố định múi giờ `Asia/Ho_Chi_Minh`) để server và trình duyệt hiển thị giống nhau.
- Trạng thái dùng chung trên server (Zalo, EventEmitter, Prisma) đặt trên `globalThis` để hot-reload không tạo nhiều bản.

## Giao diện responsive (Magic V5)

- `< md` (màn ngoài khi gập, khoảng 404px): một khung, thanh điều hướng dưới đáy. Bấm hội thoại thì mở chat toàn màn, thông tin khách là bảng trượt.
- `md` đến `xl` (màn trong khi mở, khoảng 880px): thanh icon bên trái, danh sách và chat nằm cạnh nhau.
- `xl+` (máy tính): thêm cột thông tin khách bên phải.
- Dùng `h-dvh` và `env(safe-area-inset-*)`. Hộp thoại (`Modal`) trượt từ dưới lên trên màn nhỏ.
- Chữ trên giao diện và comment trong code viết bằng tiếng Việt.

## Lệnh (chạy trong thư mục `web/`)

```bash
npm install
npm run db:migrate   # áp migration (và seed nếu database mới tạo). Giữ nguyên dữ liệu
npm run dev
npm run lint
npx tsc --noEmit
npm run build
npm run db:seed      # ⚠️ XÓA HẾT dữ liệu rồi nạp dữ liệu mẫu
npm run db:reset     # ⚠️ XÓA SẠCH database
npx prisma studio    # xem/sửa database trên trình duyệt
```

Thay đổi schema thì chạy `npx prisma migrate dev --name <tên>` và commit thư mục migration.

## Lưu ý quan trọng

- `web/prisma/dev.db` chứa dữ liệu khách và **phiên đăng nhập Zalo** (cookie). Không commit (đã có trong `.gitignore`), không đọc nội dung bảng `Setting` ra màn hình.
- Không bao giờ chạy `db:seed` hoặc `db:reset` trên dữ liệu thật nếu người dùng chưa đồng ý.
- Zalo: chỉ một phiên Zalo Web chạy được cùng lúc. Tin nhóm bị bỏ qua. Tin mình gửi được lưu **trước khi** gửi, để tin Zalo dội lại (`selfListen`) gắn `externalId` vào thay vì tạo bản trùng.
- Messenger chỉ cho nhắn tự do trong **24h** kể từ tin cuối của khách.
- Chạy lệnh `npm` trong `web/`, không chạy ở thư mục gốc.
- Trước khi báo xong: chạy `npx tsc --noEmit`, `npm run lint`, `npm run build`. Kiểm tra giao diện ở cả 404px và 880px.

## Tiến độ

1. ✅ Giao diện, lưu dữ liệu SQLite: sản phẩm, khách hàng, trạng thái, follow-up, báo cáo.
2. ⬜ **Gợi ý AI thật**: gọi Claude API với khoảng 20 tin gần nhất và các sản phẩm liên quan. Prompt yêu cầu chỉ dùng giá trong danh mục, không bịa giá hay khuyến mãi, trả về 1–3 phương án. Thay `src/lib/suggest.ts`. Cần `ANTHROPIC_API_KEY` trong `.env`.
3. ✅ Zalo cá nhân: đăng nhập QR, nhận/gửi tin 1-1, realtime. **Chưa thử với tài khoản Zalo thật**, cần người dùng thử trên máy.
4. ⬜ Fanpage Facebook qua Cloudflare Tunnel (webhook, Send API, cảnh báo hết 24h).
5. ⬜ Thông báo đẩy (Web Push) và PWA cài lên màn hình chính.
6. ⬜ Đăng nhập bảo vệ app, đóng gói Docker khi lên server.
