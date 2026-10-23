// Dữ liệu mẫu để thử giao diện. Chạy: npm run db:seed (xóa sạch dữ liệu cũ rồi tạo lại).
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const PRODUCTS = [
  { code: "TV55QLED", name: "Smart Tivi QLED Samsung 4K 55 inch QA55Q65D", category: "Tivi", price: 16990000, salePrice: 13490000, note: "Bảo hành 2 năm, trả góp 0%" },
  { code: "TL-LG-635", name: "Tủ lạnh LG Inverter 635 lít Side by side", category: "Tủ lạnh", price: 24990000, salePrice: 19990000, note: "Tặng bình đun, giao lắp miễn phí" },
  { code: "MG-AQ-9KG", name: "Máy giặt Aqua Inverter 9 kg cửa trước", category: "Máy giặt", price: 8990000, salePrice: 6790000, note: "Bảo hành động cơ 12 năm" },
  { code: "ML-DK-1HP", name: "Máy lạnh Daikin Inverter 1 HP FTKB25", category: "Máy lạnh", price: 11490000, salePrice: 10290000, note: "Miễn phí công lắp, ống đồng 3m" },
  { code: "ML-PN-15HP", name: "Máy lạnh Panasonic Inverter 1.5 HP CU/CS-XU12", category: "Máy lạnh", price: 16990000, salePrice: 15490000 },
  { code: "NC-TSB-10", name: "Nồi cơm điện tử Toshiba 1.8 lít", category: "Gia dụng", price: 2290000, salePrice: 1590000 },
];

// Giờ Việt Nam tương đối so với hôm nay: [số ngày trước, giờ, phút]
const vnDay = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
const at = (daysAgo: number, h: number, m: number) => {
  const ymd = vnDay.format(new Date(Date.now() - daysAgo * 86_400_000));
  const pad = (n: number) => String(n).padStart(2, "0");
  return new Date(`${ymd}T${pad(h)}:${pad(m)}:00+07:00`);
};

type Msg = [dir: "in" | "out", text: string, when: Date];

const CONTACTS: {
  name: string; channel: string; phone?: string; stage: string; note?: string;
  followUpAt?: Date; hue: number; unread: number; codes: string[]; messages: Msg[];
}[] = [
  {
    name: "Nguyễn Thu Hà", channel: "facebook", phone: "0903 111 218", stage: "dang_tu_van", hue: 200, unread: 2,
    note: "Phòng ngủ 15m², hướng Tây", followUpAt: at(0, 17, 0), codes: ["ML-DK-1HP", "ML-PN-15HP"],
    messages: [
      ["in", "Shop ơi máy lạnh Daikin 1 ngựa giá bao nhiêu vậy?", at(1, 21, 4)],
      ["out", "Dạ chào chị, Daikin Inverter 1 HP FTKB25 bên em đang giảm còn 10.290.000đ, miễn phí công lắp ạ. Phòng mình khoảng bao nhiêu m² chị?", at(1, 21, 6)],
      ["in", "Phòng ngủ 15m2, mà hướng Tây nắng lắm", at(0, 9, 38)],
      ["in", "Có trả góp không em?", at(0, 9, 41)],
    ],
  },
  {
    name: "Trần Minh Khoa", channel: "zalo", phone: "0918 222 554", stage: "hen_ghe", hue: 150, unread: 0,
    followUpAt: at(-2, 10, 0), codes: ["TV55QLED"],
    messages: [
      ["in", "Tivi Samsung 55 inch QLED còn hàng không bạn", at(0, 7, 58)],
      ["out", "Dạ còn anh ạ, giá đang 13.490.000đ, trả góp 0%. Anh ghé shop xem trực tiếp không ạ?", at(0, 8, 2)],
      ["in", "Ok thứ 7 mình ghé nhé", at(0, 8, 15)],
    ],
  },
  {
    name: "Lê Phương Anh", channel: "zalo", stage: "moi", hue: 330, unread: 1, codes: ["MG-AQ-9KG"],
    messages: [["in", "Máy giặt Aqua 9kg có màu trắng không shop", at(1, 20, 12)]],
  },
  {
    name: "Phạm Quốc Bảo", channel: "facebook", phone: "0987 333 001", stage: "da_chot", hue: 30, unread: 0, codes: ["TL-LG-635"],
    messages: [
      ["in", "Chốt tủ lạnh LG 635L nha em, giao chiều mai", at(1, 15, 30)],
      ["out", "Dạ em lên đơn rồi ạ, chiều mai 14h–16h kỹ thuật giao lắp cho anh nhé!", at(1, 15, 33)],
    ],
  },
  {
    name: "Võ Thị Mai", channel: "facebook", stage: "khong_mua", hue: 270, unread: 0, codes: ["NC-TSB-10"],
    messages: [["in", "Thôi để chị tham khảo thêm nha", at(11, 11, 20)]],
  },
  {
    name: "Đỗ Hoàng Long", channel: "zalo", stage: "dang_tu_van", hue: 100, unread: 0, codes: ["ML-PN-15HP"],
    messages: [["in", "Panasonic 1.5HP với Daikin cái nào êm hơn em?", at(12, 19, 45)]],
  },
];

async function main() {
  await db.contact.deleteMany();
  await db.product.deleteMany();

  const products = await Promise.all(PRODUCTS.map((data) => db.product.create({ data })));
  const idByCode = new Map(products.map((p) => [p.code, p.id]));

  for (const c of CONTACTS) {
    await db.contact.create({
      data: {
        name: c.name, channel: c.channel, phone: c.phone, stage: c.stage, note: c.note,
        followUpAt: c.followUpAt, hue: c.hue, unread: c.unread,
        lastMessageAt: c.messages.at(-1)![2],
        messages: { create: c.messages.map(([direction, text, sentAt]) => ({ direction, text, sentAt })) },
        interests: { create: c.codes.map((code) => ({ productId: idByCode.get(code)! })) },
      },
    });
  }
  console.log(`Đã tạo ${products.length} sản phẩm, ${CONTACTS.length} khách hàng.`);
}

main().finally(() => db.$disconnect());
