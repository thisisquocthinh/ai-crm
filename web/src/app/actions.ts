"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { CHANNELS, STAGES, type Channel, type Stage } from "@/lib/types";

export type ActionResult = { ok: true } | { ok: false, error: string };

const done = (): ActionResult => {
  revalidatePath("/");
  return { ok: true };
};

const clean = (v: string | null | undefined) => (v?.trim() ? v.trim() : null);

/* ---------- Sản phẩm ---------- */

export type ProductInput = {
  code: string; name: string; category: string; price: number; salePrice: number | null; note: string | null;
};

function checkProduct(p: ProductInput): string | null {
  if (!p.code.trim() || !p.name.trim() || !p.category.trim()) return "Mã, tên và loại không được để trống";
  if (!Number.isInteger(p.price) || p.price <= 0) return "Giá gốc phải là số nguyên dương";
  if (p.salePrice !== null && (!Number.isInteger(p.salePrice) || p.salePrice <= 0 || p.salePrice > p.price))
    return "Giá bán phải là số dương và không lớn hơn giá gốc";
  return null;
}

export async function saveProduct(id: string | null, input: ProductInput): Promise<ActionResult> {
  const error = checkProduct(input);
  if (error) return { ok: false, error };
  const data = {
    code: input.code.trim().toUpperCase(), name: input.name.trim(), category: input.category.trim(),
    price: input.price, salePrice: input.salePrice, note: clean(input.note),
  };
  try {
    if (id) await db.product.update({ where: { id }, data });
    else await db.product.create({ data });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
      return { ok: false, error: `Mã "${data.code}" đã tồn tại` };
    throw e;
  }
  return done();
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  await db.product.delete({ where: { id } });
  return done();
}

/* ---------- Khách hàng ---------- */

export async function createContact(input: { name: string; channel: Channel; phone: string | null }): Promise<ActionResult> {
  if (!input.name.trim()) return { ok: false, error: "Tên khách không được để trống" };
  if (!CHANNELS.includes(input.channel)) return { ok: false, error: "Kênh không hợp lệ" };
  await db.contact.create({
    data: {
      name: input.name.trim(), channel: input.channel, phone: clean(input.phone),
      hue: Math.floor(Math.random() * 360),
    },
  });
  return done();
}

export async function updateContact(id: string, input: {
  name?: string; phone?: string | null; note?: string | null; stage?: Stage; followUpAt?: string | null;
}): Promise<ActionResult> {
  if (input.stage && !STAGES.some((s) => s.id === input.stage)) return { ok: false, error: "Trạng thái không hợp lệ" };
  if (input.name !== undefined && !input.name.trim()) return { ok: false, error: "Tên khách không được để trống" };
  await db.contact.update({
    where: { id },
    data: {
      name: input.name?.trim(),
      phone: input.phone === undefined ? undefined : clean(input.phone),
      note: input.note === undefined ? undefined : clean(input.note),
      stage: input.stage,
      followUpAt: input.followUpAt === undefined ? undefined : input.followUpAt ? new Date(input.followUpAt) : null,
    },
  });
  return done();
}

export async function deleteContact(id: string): Promise<ActionResult> {
  await db.contact.delete({ where: { id } });
  return done();
}

export async function markRead(id: string): Promise<ActionResult> {
  await db.contact.updateMany({ where: { id, unread: { gt: 0 } }, data: { unread: 0 } });
  return done();
}

export async function setInterest(contactId: string, productId: string, on: boolean): Promise<ActionResult> {
  if (on) {
    await db.contactProduct.upsert({
      where: { contactId_productId: { contactId, productId } }, create: { contactId, productId }, update: {},
    });
  } else {
    await db.contactProduct.deleteMany({ where: { contactId, productId } });
  }
  return done();
}

/* ---------- Tin nhắn ---------- */

// Hiện chỉ lưu vào database. Bước 3–4 sẽ gửi thật qua Zalo/Facebook.
export async function sendMessage(contactId: string, text: string): Promise<ActionResult> {
  const body = text.trim();
  if (!body) return { ok: false, error: "Tin nhắn trống" };
  const now = new Date();
  await db.$transaction([
    db.message.create({ data: { contactId, direction: "out", text: body, sentAt: now } }),
    db.contact.update({ where: { id: contactId }, data: { lastMessageAt: now } }),
  ]);
  return done();
}
