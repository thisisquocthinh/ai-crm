// Dữ liệu giả để xem thử giao diện. Sẽ thay bằng dữ liệu thật từ Facebook/Zalo sau.

export type Channel = "facebook" | "zalo";
export type Stage = "moi" | "dang_tu_van" | "hen_ghe" | "da_chot" | "khong_mua";

export type Message = {
  id: string;
  from: "khach" | "minh";
  text: string;
  time: string;
};

export type Conversation = {
  id: string;
  name: string;
  channel: Channel;
  phone?: string;
  stage: Stage;
  unread: number;
  lastAt: string;
  interestedCodes: string[];
  note?: string;
  followUp?: string;
  hue: number;
  messages: Message[];
};

export type Product = {
  code: string;
  name: string;
  category: string;
  price: number;
  salePrice?: number;
  note?: string;
};

export const STAGES: { id: Stage; label: string; tone: string }[] = [
  { id: "moi", label: "Khách mới", tone: "bg-sky-100 text-sky-700" },
  { id: "dang_tu_van", label: "Đang tư vấn", tone: "bg-amber-100 text-amber-700" },
  { id: "hen_ghe", label: "Hẹn ghé shop", tone: "bg-violet-100 text-violet-700" },
  { id: "da_chot", label: "Đã chốt", tone: "bg-emerald-100 text-emerald-700" },
  { id: "khong_mua", label: "Không mua", tone: "bg-slate-200 text-slate-600" },
];

export const PRODUCTS: Product[] = [
  { code: "TV55QLED", name: "Smart Tivi QLED Samsung 4K 55 inch QA55Q65D", category: "Tivi", price: 16990000, salePrice: 13490000, note: "Bảo hành 2 năm, trả góp 0%" },
  { code: "TL-LG-635", name: "Tủ lạnh LG Inverter 635 lít Side by side", category: "Tủ lạnh", price: 24990000, salePrice: 19990000, note: "Tặng bình đun, giao lắp miễn phí" },
  { code: "MG-AQ-9KG", name: "Máy giặt Aqua Inverter 9 kg cửa trước", category: "Máy giặt", price: 8990000, salePrice: 6790000, note: "Bảo hành động cơ 12 năm" },
  { code: "ML-DK-1HP", name: "Máy lạnh Daikin Inverter 1 HP FTKB25", category: "Máy lạnh", price: 11490000, salePrice: 10290000, note: "Miễn phí công lắp, ống đồng 3m" },
  { code: "ML-PN-15HP", name: "Máy lạnh Panasonic Inverter 1.5 HP CU/CS-XU12", category: "Máy lạnh", price: 16990000, salePrice: 15490000 },
  { code: "NC-TSB-10", name: "Nồi cơm điện tử Toshiba 1.8 lít", category: "Gia dụng", price: 2290000, salePrice: 1590000 },
];

export const CONVERSATIONS: Conversation[] = [
  {
    id: "c1", name: "Nguyễn Thu Hà", channel: "facebook", phone: "0903 *** 218", stage: "dang_tu_van",
    unread: 2, lastAt: "09:41", interestedCodes: ["ML-DK-1HP", "ML-PN-15HP"], hue: 200,
    note: "Phòng ngủ 15m², hướng Tây", followUp: "Hôm nay, 17:00",
    messages: [
      { id: "m1", from: "khach", text: "Shop ơi máy lạnh Daikin 1 ngựa giá bao nhiêu vậy?", time: "21:04" },
      { id: "m2", from: "minh", text: "Dạ chào chị, Daikin Inverter 1 HP FTKB25 bên em đang giảm còn 10.290.000đ, miễn phí công lắp ạ. Phòng mình khoảng bao nhiêu m² chị?", time: "21:06" },
      { id: "m3", from: "khach", text: "Phòng ngủ 15m2, mà hướng Tây nắng lắm", time: "09:38" },
      { id: "m4", from: "khach", text: "Có trả góp không em?", time: "09:41" },
    ],
  },
  {
    id: "c2", name: "Trần Minh Khoa", channel: "zalo", phone: "0918 *** 554", stage: "hen_ghe",
    unread: 0, lastAt: "08:15", interestedCodes: ["TV55QLED"], hue: 150, followUp: "Thứ 7, 10:00",
    messages: [
      { id: "m1", from: "khach", text: "Tivi Samsung 55 inch QLED còn hàng không bạn", time: "07:58" },
      { id: "m2", from: "minh", text: "Dạ còn anh ạ, giá đang 13.490.000đ, trả góp 0%. Anh ghé shop xem trực tiếp không ạ?", time: "08:02" },
      { id: "m3", from: "khach", text: "Ok thứ 7 mình ghé nhé", time: "08:15" },
    ],
  },
  {
    id: "c3", name: "Lê Phương Anh", channel: "zalo", stage: "moi",
    unread: 1, lastAt: "Hôm qua", interestedCodes: ["MG-AQ-9KG"], hue: 330,
    messages: [{ id: "m1", from: "khach", text: "Máy giặt Aqua 9kg có màu trắng không shop", time: "20:12" }],
  },
  {
    id: "c4", name: "Phạm Quốc Bảo", channel: "facebook", phone: "0987 *** 001", stage: "da_chot",
    unread: 0, lastAt: "Hôm qua", interestedCodes: ["TL-LG-635"], hue: 30,
    messages: [
      { id: "m1", from: "khach", text: "Chốt tủ lạnh LG 635L nha em, giao chiều mai", time: "15:30" },
      { id: "m2", from: "minh", text: "Dạ em lên đơn rồi ạ, chiều mai 14h–16h kỹ thuật giao lắp cho anh nhé!", time: "15:33" },
    ],
  },
  {
    id: "c5", name: "Võ Thị Mai", channel: "facebook", stage: "khong_mua",
    unread: 0, lastAt: "12/10", interestedCodes: ["NC-TSB-10"], hue: 270,
    messages: [{ id: "m1", from: "khach", text: "Thôi để chị tham khảo thêm nha", time: "11:20" }],
  },
  {
    id: "c6", name: "Đỗ Hoàng Long", channel: "zalo", stage: "dang_tu_van",
    unread: 0, lastAt: "11/10", interestedCodes: ["ML-PN-15HP"], hue: 100,
    messages: [{ id: "m1", from: "khach", text: "Panasonic 1.5HP với Daikin cái nào êm hơn em?", time: "19:45" }],
  },
];

export const vnd = (n: number) => n.toLocaleString("vi-VN") + "đ";

export const initials = (name: string) =>
  name.split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase();

// Gợi ý giả lập — sau này sẽ gọi Claude API với hội thoại + sản phẩm liên quan.
export function mockSuggestions(conv: Conversation): string[] {
  const items = PRODUCTS.filter((p) => conv.interestedCodes.includes(p.code));
  const p = items[0];
  if (!p) return ["Dạ anh/chị đang quan tâm sản phẩm nào để em báo giá chính xác ạ?"];
  const price = vnd(p.salePrice ?? p.price);
  return [
    `Dạ ${p.name} bên em đang có giá ${price}${p.note ? ", " + p.note.toLowerCase() : ""} ạ.`,
    `Dạ sản phẩm này hỗ trợ trả góp 0% qua thẻ tín dụng, hoặc trả trước 30% qua công ty tài chính ạ. Anh/chị muốn em tính thử khoản góp hàng tháng không ạ?`,
    items[1]
      ? `Ngoài ra em gợi ý thêm ${items[1].name} giá ${vnd(items[1].salePrice ?? items[1].price)}, phù hợp nếu anh/chị cần công suất lớn hơn ạ.`
      : `Anh/chị ghé shop xem trực tiếp được không ạ? Em giữ giá khuyến mãi cho mình nhé.`,
  ];
}
