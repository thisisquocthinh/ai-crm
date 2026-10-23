// Kiểu dữ liệu gửi từ server xuống giao diện (ngày tháng ở dạng chuỗi ISO).

export type Channel = "facebook" | "zalo";
export type Stage = "moi" | "dang_tu_van" | "hen_ghe" | "da_chot" | "khong_mua";

export type MessageDTO = {
  id: string;
  direction: "in" | "out";
  text: string;
  sentAt: string;
};

export type ContactDTO = {
  id: string;
  name: string;
  channel: Channel;
  phone: string | null;
  stage: Stage;
  note: string | null;
  followUpAt: string | null;
  hue: number;
  unread: number;
  lastMessageAt: string;
  productIds: string[];
  messages: MessageDTO[];
};

export type ProductDTO = {
  id: string;
  code: string;
  name: string;
  category: string;
  price: number;
  salePrice: number | null;
  note: string | null;
};

export const STAGES: { id: Stage; label: string; tone: string }[] = [
  { id: "moi", label: "Khách mới", tone: "bg-sky-100 text-sky-700" },
  { id: "dang_tu_van", label: "Đang tư vấn", tone: "bg-amber-100 text-amber-700" },
  { id: "hen_ghe", label: "Hẹn ghé shop", tone: "bg-violet-100 text-violet-700" },
  { id: "da_chot", label: "Đã chốt", tone: "bg-emerald-100 text-emerald-700" },
  { id: "khong_mua", label: "Không mua", tone: "bg-slate-200 text-slate-600" },
];

export const CHANNELS: Channel[] = ["facebook", "zalo"];
