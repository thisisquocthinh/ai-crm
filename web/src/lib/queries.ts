import { db } from "./db";
import type { Channel, ContactDTO, ProductDTO, Stage } from "./types";

export async function loadData(): Promise<{ contacts: ContactDTO[]; products: ProductDTO[] }> {
  const [contacts, products] = await Promise.all([
    db.contact.findMany({
      orderBy: { lastMessageAt: "desc" },
      include: { messages: { orderBy: { sentAt: "asc" } }, interests: { select: { productId: true } } },
    }),
    db.product.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] }),
  ]);

  return {
    contacts: contacts.map((c) => ({
      id: c.id,
      name: c.name,
      channel: c.channel as Channel,
      phone: c.phone,
      stage: c.stage as Stage,
      note: c.note,
      followUpAt: c.followUpAt?.toISOString() ?? null,
      hue: c.hue,
      unread: c.unread,
      lastMessageAt: c.lastMessageAt.toISOString(),
      productIds: c.interests.map((i) => i.productId),
      messages: c.messages.map((m) => ({
        id: m.id, direction: m.direction as "in" | "out", text: m.text, sentAt: m.sentAt.toISOString(),
      })),
    })),
    products: products.map(({ id, code, name, category, price, salePrice, note }) => ({
      id, code, name, category, price, salePrice, note,
    })),
  };
}
