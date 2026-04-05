"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import AdminGuard from "@/components/AdminGuard";
import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";

const emptyProduct = { id: "", name: "", price: "", image_url: "", category_id: "" };
const emptyCategory = { name: "", image_url: "" };

export default function AdminClient() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [editing, setEditing] = useState(false);
  const [info, setInfo] = useState("");

  async function loadAll() {
    if (!supabase) return;
    const [{ data: c }, { data: p }, { data: o }] = await Promise.all([
      supabase.from("categories").select("*").order("created_at", { ascending: true }),
      supabase.from("products").select("*, categories(name)").order("created_at", { ascending: true }),
      supabase.from("orders").select("*").order("created_at", { ascending: false })
    ]);
    setCategories(c || []);
    setProducts((p || []).map(item => ({ ...item, category_name: item.categories?.name || "" })));
    setOrders(o || []);
  }

  useEffect(() => { loadAll(); }, []);

  const salesTotal = useMemo(() => orders.reduce((sum, order) => sum + Number(order.total || 0), 0), [orders]);

  async function saveProduct(e) {
    e.preventDefault();
    setInfo("");
    if (!supabase) return;

    const payload = {
      name: productForm.name,
      price: Number(productForm.price || 0),
      image_url: productForm.image_url,
      category_id: productForm.category_id
    };

    const result = editing
      ? await supabase.from("products").update(payload).eq("id", productForm.id)
      : await supabase.from("products").insert(payload);

    if (result.error) {
      setInfo("حدث خطأ أثناء حفظ المنتج.");
      return;
    }

    setInfo(editing ? "تم حفظ التعديلات تلقائيًا." : "تمت إضافة المنتج تلقائيًا.");
    setProductForm(emptyProduct);
    setEditing(false);
    loadAll();
  }

  function startEdit(product) {
    setProductForm({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      category_id: product.category_id
    });
    setEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteProduct(id) {
    if (!confirm("هل تريد حذف المنتج؟")) return;
    await supabase.from("products").delete().eq("id", id);
    loadAll();
  }

  async function addCategory(e) {
    e.preventDefault();
    setInfo("");
    if (!categoryForm.name.trim()) return;
    const { error } = await supabase.from("categories").insert(categoryForm);
    if (error) {
      setInfo("حدث خطأ أثناء إضافة القسم.");
      return;
    }
    setInfo("تمت إضافة القسم.");
    setCategoryForm(emptyCategory);
    loadAll();
  }

  async function deleteCategory(id) {
    if (!confirm("حذف القسم سيحذف كل المنتجات التابعة له. هل أنت متأكد؟")) return;
    await supabase.from("categories").delete().eq("id", id);
    loadAll();
  }

  return (
    <AdminGuard>
      <Header cartCount={0} />
      <main className="container" style={{ padding: "24px 0 40px" }}>
        <div className="toolbar">
          <h1 className="section-title" style={{ margin: 0 }}>لوحة تحكم الأدمن</h1>
        </div>

        {info && <div className="success">{info}</div>}

        <section className="stats">
          <div className="stat">
            <h3>عدد الأقسام</h3>
            <strong>{categories.length}</strong>
          </div>
          <div className="stat">
            <h3>عدد المنتجات</h3>
            <strong>{products.length}</strong>
          </div>
          <div className="stat">
            <h3>عدد الطلبات</h3>
            <strong>{orders.length}</strong>
          </div>
          <div className="stat">
            <h3>إجمالي المبيعات</h3>
            <strong>{formatPrice(salesTotal)}</strong>
          </div>
        </section>

        <section className="panel" style={{ marginTop: 18 }}>
          <h2 style={{ marginTop: 0 }}>المنتجات</h2>
          <form onSubmit={saveProduct}>
            <div className="form-grid">
              <div>
                <label>اسم المنتج</label>
                <input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required />
              </div>
              <div>
                <label>سعر المنتج</label>
                <input type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} required />
              </div>
              <div>
                <label>رابط صورة المنتج</label>
                <input value={productForm.image_url} onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })} required />
              </div>
              <div>
                <label>القسم</label>
                <select value={productForm.category_id} onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })} required>
                  <option value="">اختر القسم</option>
                  {categories.map(category => <option value={category.id} key={category.id}>{category.name}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              <button className="btn" type="submit">{editing ? "حفظ التعديلات" : "إضافة المنتج"}</button>
              {editing && <button className="ghost-btn" type="button" onClick={() => { setEditing(false); setProductForm(emptyProduct); }}>إلغاء التعديل</button>}
            </div>
          </form>

          <div style={{ marginTop: 20 }} className="products-grid">
            {products.map(product => (
              <div className="card" key={product.id}>
                <img src={product.image_url} alt={product.name} className="cover-image" />
                <div className="card-body">
                  <h3 className="product-title">{product.name}</h3>
                  <div className="small">{product.category_name}</div>
                  <div className="price">{formatPrice(product.price)}</div>
                  <div className="product-actions">
                    <button className="btn" style={{ flex: 1 }} onClick={() => startEdit(product)}>تعديل</button>
                    <button className="danger-btn" onClick={() => deleteProduct(product.id)}>حذف</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2 style={{ marginTop: 0 }}>إدارة الأقسام</h2>
          <form onSubmit={addCategory}>
            <div className="form-grid">
              <div>
                <label>اسم القسم الجديد</label>
                <input value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} required />
              </div>
              <div>
                <label>رابط صورة القسم (اختياري)</label>
                <input value={categoryForm.image_url} onChange={(e) => setCategoryForm({ ...categoryForm, image_url: e.target.value })} />
              </div>
            </div>
            <button className="btn" style={{ marginTop: 14 }}>إضافة قسم</button>
          </form>

          <div style={{ marginTop: 20 }} className="form-grid">
            {categories.map(category => (
              <div className="panel" key={category.id} style={{ marginBottom: 0 }}>
                <strong>{category.name}</strong>
                <div style={{ marginTop: 12 }}>
                  <button className="danger-btn" onClick={() => deleteCategory(category.id)}>حذف القسم</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2 style={{ marginTop: 0 }}>إدارة الطلبات</h2>
          <div className="small" style={{ marginBottom: 12 }}>سجل الطلبات باليوم والتاريخ وإحصائية البيع.</div>

          {!orders.length && <div className="empty">لا توجد طلبات حتى الآن.</div>}
          {orders.map(order => (
            <div key={order.id} className="panel" style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <strong>{order.customer_name}</strong>
                <span className="small">{new Date(order.created_at).toLocaleString("ar-EG")}</span>
              </div>
              <div className="small" style={{ marginTop: 8 }}>
                الهاتف: {order.phone || "-"} | الاحتياطي: {order.backup_phone || "-"} | العنوان: {order.address || "-"}
              </div>
              <div className="price" style={{ marginTop: 8 }}>الإجمالي: {formatPrice(order.total)}</div>

              <div style={{ marginTop: 10 }}>
                {(order.items || []).map((item, index) => (
                  <div className="order-card" key={index}>
                    <img src={item.image_url} alt={item.name} />
                    <div>
                      <strong>{item.name}</strong>
                      <div className="small">{item.category_name}</div>
                      <div className="small">{formatPrice(item.price)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>
    </AdminGuard>
  );
}
