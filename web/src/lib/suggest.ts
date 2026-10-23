import { vnd } from "./format";
import type { ContactDTO, ProductDTO } from "./types";

// Gợi ý tạm thời bằng mẫu câu. Bước 2 sẽ thay bằng Claude API.
export function templateSuggestions(contact: ContactDTO, products: ProductDTO[]): string[] {
  const items = products.filter((p) => contact.productIds.includes(p.id));
  const p = items[0];
  if (!p) return ["Dạ anh/chị đang quan tâm sản phẩm nào để em báo giá chính xác ạ?"];
  const price = vnd(p.salePrice ?? p.price);
  return [
    `Dạ ${p.name} bên em đang có giá ${price}${p.note ? ", " + p.note.toLowerCase() : ""} ạ.`,
    "Dạ sản phẩm này hỗ trợ trả góp 0% qua thẻ tín dụng, hoặc trả trước 30% qua công ty tài chính ạ. Anh/chị muốn em tính thử khoản góp hàng tháng không ạ?",
    items[1]
      ? `Ngoài ra em gợi ý thêm ${items[1].name} giá ${vnd(items[1].salePrice ?? items[1].price)}, phù hợp nếu anh/chị cần công suất lớn hơn ạ.`
      : "Anh/chị ghé shop xem trực tiếp được không ạ? Em giữ giá khuyến mãi cho mình nhé.",
  ];
}
