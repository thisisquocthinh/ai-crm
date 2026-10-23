"use client";

import { useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { deleteProduct, saveProduct } from "@/app/actions";
import { vnd } from "@/lib/format";
import type { ProductDTO } from "@/lib/types";
import { Field, Modal, PrimaryButton, inputCls, useRun } from "./ui";

export function Products({ products }: { products: ProductDTO[] }) {
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<ProductDTO | "new" | null>(null);
  const [, run] = useRun();

  const list = products.filter((p) => (p.code + " " + p.name + " " + p.category).toLowerCase().includes(q.toLowerCase()));
  const remove = (p: ProductDTO) => {
    if (confirm(`Xóa sản phẩm ${p.code}?`)) run(() => deleteProduct(p.id));
  };

  return (
    <section className="glass flex min-h-0 flex-1 flex-col rounded-[32px] p-4 md:p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="tile flex flex-1 items-center gap-2 rounded-full px-4 py-2.5 md:max-w-sm">
          <Search className="size-4 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo mã, tên, loại…"
            className="w-full bg-transparent text-sm outline-none" />
        </div>
        <PrimaryButton onClick={() => setEditing("new")} className="ml-auto" aria-label="Thêm sản phẩm">
          <Plus className="size-4" /> <span className="hidden sm:inline">Thêm sản phẩm</span>
        </PrimaryButton>
      </div>

      {list.length === 0 && (
        <p className="py-12 text-center text-sm text-slate-500">
          {products.length === 0 ? "Chưa có sản phẩm. Bấm “Thêm sản phẩm” để bắt đầu." : "Không tìm thấy sản phẩm"}
        </p>
      )}

      {/* Bảng trên màn rộng */}
      <div className="no-scrollbar hidden min-h-0 flex-1 overflow-y-auto md:block">
        {list.length > 0 && (
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-slate-500">
              <tr className="border-b border-white/80">
                <th className="py-3 pl-2 font-normal">Mã</th><th className="font-normal">Tên sản phẩm</th>
                <th className="font-normal">Loại</th><th className="font-normal">Giá gốc</th>
                <th className="font-normal">Giá bán</th><th />
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} className="border-b border-white/50">
                  <td className="py-3.5 pl-2 font-mono text-xs font-semibold">{p.code}</td>
                  <td className="pr-4">{p.name}{p.note && <div className="text-xs text-slate-500">{p.note}</div>}</td>
                  <td><span className="whitespace-nowrap rounded-full bg-sky-500/90 px-3 py-1 text-xs text-white">{p.category}</span></td>
                  <td className="whitespace-nowrap pr-3 text-slate-400 line-through">{p.salePrice ? vnd(p.price) : ""}</td>
                  <td className="whitespace-nowrap font-semibold text-rose-600">{vnd(p.salePrice ?? p.price)}</td>
                  <td className="whitespace-nowrap pr-1 text-right">
                    <button onClick={() => setEditing(p)} className="round-btn inline-grid size-9" aria-label={`Sửa ${p.code}`}><Pencil className="size-4" /></button>
                    <button onClick={() => remove(p)} className="round-btn ml-1.5 inline-grid size-9 text-rose-600" aria-label={`Xóa ${p.code}`}><Trash2 className="size-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Thẻ trên màn ngoài */}
      <div className="no-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto md:hidden">
        {list.map((p) => (
          <button key={p.id} onClick={() => setEditing(p)} className="tile block w-full rounded-[20px] p-3.5 text-left">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold text-slate-500">{p.code}</span>
              <span className="ml-auto rounded-full bg-sky-500/90 px-2.5 py-0.5 text-[11px] text-white">{p.category}</span>
            </div>
            <div className="mt-1 text-sm font-medium">{p.name}</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-bold text-rose-600">{vnd(p.salePrice ?? p.price)}</span>
              {p.salePrice && <span className="text-xs text-slate-400 line-through">{vnd(p.price)}</span>}
            </div>
          </button>
        ))}
      </div>

      {editing && (
        <ProductForm product={editing === "new" ? null : editing}
          categories={[...new Set(products.map((p) => p.category))]}
          onDelete={editing === "new" ? undefined : () => { remove(editing); setEditing(null); }}
          onClose={() => setEditing(null)} />
      )}
    </section>
  );
}

const digits = (s: string) => s.replace(/\D/g, "");
const toInt = (s: string) => (digits(s) ? parseInt(digits(s), 10) : 0);
const pretty = (s: string) => (digits(s) ? toInt(s).toLocaleString("vi-VN") : "");

function ProductForm({ product, categories, onClose, onDelete }: {
  product: ProductDTO | null; categories: string[]; onClose: () => void; onDelete?: () => void;
}) {
  const [f, setF] = useState({
    code: product?.code ?? "",
    name: product?.name ?? "",
    category: product?.category ?? "",
    price: product ? String(product.price) : "",
    salePrice: product?.salePrice ? String(product.salePrice) : "",
    note: product?.note ?? "",
  });
  const [pending, run] = useRun();
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF({ ...f, [k]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    run(() => saveProduct(product?.id ?? null, {
      code: f.code, name: f.name, category: f.category,
      price: toInt(f.price), salePrice: digits(f.salePrice) ? toInt(f.salePrice) : null, note: f.note,
    }), onClose);
  };

  return (
    <Modal title={product ? "Sửa sản phẩm" : "Thêm sản phẩm"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Mã sản phẩm *">
            <input required value={f.code} onChange={set("code")} placeholder="ML-DK-1HP" className={`${inputCls} font-mono uppercase`} />
          </Field>
          <Field label="Loại *">
            <input required value={f.category} onChange={set("category")} list="categories" placeholder="Máy lạnh" className={inputCls} />
            <datalist id="categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>
          </Field>
        </div>
        <Field label="Tên sản phẩm *">
          <input required value={f.name} onChange={set("name")} className={inputCls} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Giá gốc (đ) *">
            <input required inputMode="numeric" value={pretty(f.price)} onChange={set("price")} className={inputCls} />
          </Field>
          <Field label="Giá khuyến mãi (đ)">
            <input inputMode="numeric" value={pretty(f.salePrice)} onChange={set("salePrice")} placeholder="Bỏ trống nếu không giảm" className={inputCls} />
          </Field>
        </div>
        <Field label="Ghi chú (bảo hành, quà tặng, trả góp…)">
          <textarea rows={2} value={f.note} onChange={set("note")} className={`${inputCls} resize-none`} />
        </Field>
        <div className="flex gap-2 pt-2">
          {onDelete && (
            <button type="button" onClick={onDelete} className="round-btn h-11 px-4 text-sm text-rose-600">
              <span className="flex items-center gap-1.5"><Trash2 className="size-4" /> Xóa</span>
            </button>
          )}
          <PrimaryButton type="submit" disabled={pending} className="ml-auto">
            {pending ? "Đang lưu…" : "Lưu"}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
