// Định dạng cố định theo giờ Việt Nam để server và trình duyệt hiển thị giống nhau.
const TZ = "Asia/Ho_Chi_Minh";

const timeFmt = new Intl.DateTimeFormat("vi-VN", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
const dayFmt = new Intl.DateTimeFormat("vi-VN", { timeZone: TZ, day: "2-digit", month: "2-digit" });
const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });

export const vnd = (n: number) => n.toLocaleString("vi-VN") + "đ";

export const initials = (name: string) =>
  name.trim().split(/\s+/).slice(-2).map((w) => w[0]).join("").toUpperCase();

export const formatTime = (iso: string) => timeFmt.format(new Date(iso));

function dayDiff(iso: string) {
  const a = Date.parse(dayKey.format(new Date(iso)));
  const b = Date.parse(dayKey.format(new Date()));
  return Math.round((b - a) / 86_400_000);
}

// Dùng cho danh sách hội thoại: "09:41", "Hôm qua", "12/10"
export function formatListTime(iso: string) {
  const d = dayDiff(iso);
  if (d === 0) return formatTime(iso);
  if (d === 1) return "Hôm qua";
  return dayFmt.format(new Date(iso));
}

// Dùng cho lịch follow-up: "Hôm nay, 17:00", "Ngày mai, 10:00", "25/10, 09:00"
export function formatFollowUp(iso: string) {
  const d = dayDiff(iso);
  const label = d === 0 ? "Hôm nay" : d === -1 ? "Ngày mai" : d === 1 ? "Hôm qua" : dayFmt.format(new Date(iso));
  return `${label}, ${formatTime(iso)}`;
}

// Giá trị cho <input type="datetime-local"> theo giờ Việt Nam
export function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(new Date(iso).getTime() + 7 * 3_600_000);
  return d.toISOString().slice(0, 16);
}

export function fromLocalInput(v: string) {
  return v ? new Date(v + ":00+07:00").toISOString() : null;
}
