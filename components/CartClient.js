"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";
import { buildWhatsAppUrl, formatPrice } from "@/lib/utils";

const PHONE = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "201028903780";

export default function CartClient() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ customer_name: "", phone: "", backup_phone: "", address: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("roqa_cart");
    setItems(stored ? JSON.parse(stored) : []);
  }, []);

  const total = useMemo(() => items.reduce((sum, item) => sum + Number(item.price || 0), 0), [items]);

  function removeItem(index) {
    const next = items.filter((_, i) => i !== index);
    setItems(next);
    localStorage.setItem("roqa_cart", JSON.stringify(next));
  }

  async function submitOrder() {
    setMessage("");
    if (!form.customer_name.trim()) {
      setMessage("لا يمكن إتمام الطلب بدون كتابة اسم العميل.");
      return;
    }

    const payload = {
      customer_name: form.customer_name,
      phone: form.phone,
      backup_phone: form.backup_phone,
      address: form.address,
      total,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        image_url: item.image_url,
        category_name: item.category_name
      }))
    };

    if (supabase) {
      const { error } = await supabase.from("orders").insert(payload);
      if (error) {
        setMessage("حدث خطأ أثناء حفظ الطلب في قاعدة البيانات.");
        return;
      }
    }

    const url = buildWhatsAppUrl({
      phone: PHONE,
      customerName: form.customer_name,
      customerPhone: form.phone,
      backupPhone: form.backup_phone,
      address: form.address,
      items: payload.items,
      total
    });

    localStorage.removeItem("roqa_cart");
    window.open(url, "_blank");
    setItems([]);
    setForm({ customer_name: "", phone: "", backup_phone: "", address: "" });
    setMessage("تم تجهيز الطلب وفتح واتساب لإرسال التفاصيل.");
  }

  return (
    <>
      <Header cartCount={items.length} />
      <main className="container" style={{ padding: "24px 0 40px" }}>
        <div className="toolbar">
          <h1 className="section-title" style={{ margin: 0 }}>سلة العميل</h1>
        </div>

        {message && (
          <div className={message.includes("تم") ? "success" : "notice"}>{message}</div>
        )}

        <div className="cart-layout">
          <section className="panel">
            <h2 style={{ marginTop: 0 }}>المنتجات المختارة</h2>
            {!items.length && <div className="empty">السلة فارغة حاليًا.</div>}
            {items.map((item, index) => (
              <div className="order-card" key={`${item.id}-${index}`}>
                <img src={item.image_url} alt={item.name} />
                <div>
                  <h3 style={{ margin: "0 0 8px" }}>{item.name}</h3>
                  <div className="small" style={{ marginBottom: 8 }}>{item.category_name}</div>
                  <div className="price">{formatPrice(item.price)}</div>
                  <button className="danger-btn" onClick={() => removeItem(index)}>حذف من السلة</button>
                </div>
              </div>
            ))}
          </section>

          <aside className="panel">
            <h2 style={{ marginTop: 0 }}>بيانات العميل</h2>
            <div className="form-grid">
              <div>
                <label>اسم العميل *</label>
                <input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
              </div>
              <div>
                <label>رقم العميل</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label>رقم احتياطي</label>
                <input value={form.backup_phone} onChange={(e) => setForm({ ...form, backup_phone: e.target.value })} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label>العنوان</label>
                <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
            </div>

            <div className="panel" style={{ marginTop: 16, marginBottom: 0 }}>
              <strong>إجمالي السعر: {formatPrice(total)}</strong>
            </div>

            <button className="btn" style={{ width: "100%", marginTop: 16 }} onClick={submitOrder} disabled={!items.length}>
              إتمام الطلب
            </button>
            <p className="small">لن يتم إرسال الطلب إلا بعد كتابة اسم العميل على الأقل.</p>
          </aside>
        </div>
      </main>
    </>
  );
}
