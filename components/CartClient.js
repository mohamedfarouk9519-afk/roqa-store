"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";
import { buildWhatsAppUrl, formatPrice } from "@/lib/utils";

const PHONE = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "201028903780";

export default function CartClient() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    backup_phone: "",
    address: ""
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("roqa_cart");
    setItems(stored ? JSON.parse(stored) : []);
  }, []);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.price || 0), 0),
    [items]
  );

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

    if (!items.length) {
      setMessage("السلة فارغة.");
      return;
    }

    const payload = {
      customer_name: form.customer_name,
      phone: form.phone,
      backup_phone: form.backup_phone,
      address: form.address,
      total,
      items: items.map((item) => ({
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
        setMessage("حدث خطأ أثناء حفظ الطلب.");
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
    setItems([]);
    setForm({
      customer_name: "",
      phone: "",
      backup_phone: "",
      address: ""
    });

    window.open(url, "_blank");
    setMessage("تم تجهيز الطلب وفتح واتساب لإرسال التفاصيل.");
  }

  return (
    <>
      <Header cartCount={items.length} />

      <main className="container cart-page">
        <section className="page-hero">
          <div className="page-hero-box">
            <h1>سلة المشتريات</h1>
            <p>راجعي المنتجات المختارة وأكملي بيانات الطلب لإرساله بسهولة.</p>
          </div>
        </section>

        {message && (
          <div className={message.includes("تم") ? "success" : "notice"}>
            {message}
          </div>
        )}

        <div className="cart-layout-v2">
          <section className="cart-items-panel">
            <div className="panel-head">
              <h2>المنتجات المختارة</h2>
              <span>{items.length} منتج</span>
            </div>

            {!items.length && (
              <div className="empty-cart-box">لا توجد منتجات داخل السلة الآن.</div>
            )}

            <div className="cart-items-list">
              {items.map((item, index) => (
                <div className="cart-item-card" key={`${item.id}-${index}`}>
                  <img src={item.image_url} alt={item.name} className="cart-item-image" />

                  <div className="cart-item-content">
                    <h3>{item.name}</h3>
                    <p>{item.category_name}</p>
                    <strong>{formatPrice(item.price)}</strong>
                  </div>

                  <button
                    className="cart-remove-btn"
                    onClick={() => removeItem(index)}
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>
          </section>

          <aside className="cart-summary-panel">
            <div className="panel-head">
              <h2>بيانات العميل</h2>
            </div>

            <div className="order-form-grid">
              <div>
                <label>اسم العميل *</label>
                <input
                  value={form.customer_name}
                  onChange={(e) =>
                    setForm({ ...form, customer_name: e.target.value })
                  }
                />
              </div>

              <div>
                <label>رقم العميل</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div>
                <label>رقم احتياطي</label>
                <input
                  value={form.backup_phone}
                  onChange={(e) =>
                    setForm({ ...form, backup_phone: e.target.value })
                  }
                />
              </div>

              <div className="full-width">
                <label>العنوان</label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
            </div>

            <div className="summary-box">
              <div className="summary-row">
                <span>عدد المنتجات</span>
                <strong>{items.length}</strong>
              </div>

              <div className="summary-row total">
                <span>إجمالي السعر</span>
                <strong>{formatPrice(total)}</strong>
              </div>
            </div>

            <button
              className="checkout-btn"
              onClick={submitOrder}
              disabled={!items.length}
            >
              إتمام الطلب
            </button>

            <p className="summary-note">
              لن يتم تنفيذ الطلب إلا بعد كتابة اسم العميل على الأقل.
            </p>
          </aside>
        </div>
      </main>
    </>
  );
}