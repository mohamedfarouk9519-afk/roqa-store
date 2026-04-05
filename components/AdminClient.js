"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import AdminGuard from "@/components/AdminGuard";
import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";

const emptyProduct = {
  id: "",
  name: "",
  price: "",
  image_url: "",
  category_id: ""
};

const emptyCategory = {
  name: "",
  image_url: ""
};

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
    setProducts(
      (p || []).map((item) => ({
        ...item,
        category_name: item.categories?.name || ""
      }))
    );
    setOrders(o || []);
  }

  useEffect(() => {
    loadAll();
  }, []);

  const totalSales = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.total || 0), 0),
    [orders]
  );

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

    setInfo(editing ? "تم حفظ التعديلات بنجاح." : "تمت إضافة المنتج بنجاح.");
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

    const { error } = await supabase.from("categories").insert(categoryForm);
    if (error) {
      setInfo("حدث خطأ أثناء إضافة القسم.");
      return;
    }

    setInfo("تمت إضافة القسم بنجاح.");
    setCategoryForm(emptyCategory);
    loadAll();
  }

  async function deleteCategory(id) {
    if (!confirm("حذف القسم سيحذف المنتجات التابعة له، هل أنت متأكد؟")) return;
    await supabase.from("categories").delete().eq("id", id);
    loadAll();
  }

  return (
    <AdminGuard>
      <Header cartCount={0} />

      <main className="container admin-page">
        <section className="page-hero">
          <div className="page-hero-box">
            <h1>لوحة تحكم الأدمن</h1>
            <p>إدارة كاملة للمنتجات والأقسام والطلبات والمبيعات.</p>
          </div>
        </section>

        {info && <div className="success">{info}</div>}

        <section className="admin-stats-grid">
          <div className="admin-stat-card">
            <span>عدد الأقسام</span>
            <strong>{categories.length}</strong>
          </div>

          <div className="admin-stat-card">
            <span>عدد المنتجات</span>
            <strong>{products.length}</strong>
          </div>

          <div className="admin-stat-card">
            <span>عدد الطلبات</span>
            <strong>{orders.length}</strong>
          </div>

          <div className="admin-stat-card">
            <span>إجمالي المبيعات</span>
            <strong>{formatPrice(totalSales)}</strong>
          </div>
        </section>

        <section className="admin-section-card">
          <div className="panel-head">
            <h2>{editing ? "تعديل منتج" : "إضافة منتج جديد"}</h2>
          </div>

          <form onSubmit={saveProduct} className="admin-form-grid">
            <div>
              <label>اسم المنتج</label>
              <input
                value={productForm.name}
                onChange={(e) =>
                  setProductForm({ ...productForm, name: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label>السعر</label>
              <input
                type="number"
                value={productForm.price}
                onChange={(e) =>
                  setProductForm({ ...productForm, price: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label>رابط الصورة</label>
              <input
                value={productForm.image_url}
                onChange={(e) =>
                  setProductForm({ ...productForm, image_url: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label>اختر القسم</label>
              <select
                value={productForm.category_id}
                onChange={(e) =>
                  setProductForm({ ...productForm, category_id: e.target.value })
                }
                required
              >
                <option value="">اختر القسم</option>
                {categories.map((category) => (
                  <option value={category.id} key={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-form-actions full-width">
              <button className="save-btn" type="submit">
                {editing ? "حفظ التعديلات" : "إضافة المنتج"}
              </button>

              {editing && (
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setEditing(false);
                    setProductForm(emptyProduct);
                  }}
                >
                  إلغاء
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="admin-section-card">
          <div className="panel-head">
            <h2>المنتجات الحالية</h2>
          </div>

          <div className="admin-products-grid">
            {products.map((product) => (
              <div className="admin-product-card" key={product.id}>
                <img src={product.image_url} alt={product.name} />
                <div className="admin-product-content">
                  <h3>{product.name}</h3>
                  <p>{product.category_name}</p>
                  <strong>{formatPrice(product.price)}</strong>

                  <div className="admin-card-actions">
                    <button
                      className="edit-btn"
                      onClick={() => startEdit(product)}
                    >
                      تعديل
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => deleteProduct(product.id)}
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-section-card">
          <div className="panel-head">
            <h2>إدارة الأقسام</h2>
          </div>

          <form onSubmit={addCategory} className="admin-form-grid">
            <div>
              <label>اسم القسم</label>
              <input
                value={categoryForm.name}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, name: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label>رابط صورة القسم</label>
              <input
                value={categoryForm.image_url}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, image_url: e.target.value })
                }
              />
            </div>

            <div className="admin-form-actions full-width">
              <button className="save-btn" type="submit">
                إضافة قسم
              </button>
            </div>
          </form>

          <div className="admin-categories-wrap">
            {categories.map((category) => (
              <div className="admin-category-pill" key={category.id}>
                <span>{category.name}</span>
                <button onClick={() => deleteCategory(category.id)}>حذف</button>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-section-card">
          <div className="panel-head">
            <h2>إدارة الطلبات</h2>
          </div>

          {!orders.length && (
            <div className="empty-cart-box">لا توجد طلبات حتى الآن.</div>
          )}

          <div className="orders-list-admin">
            {orders.map((order) => (
              <div className="order-admin-card" key={order.id}>
                <div className="order-admin-top">
                  <div>
                    <h3>{order.customer_name}</h3>
                    <p>
                      {new Date(order.created_at).toLocaleString("ar-EG")}
                    </p>
                  </div>
                  <strong>{formatPrice(order.total)}</strong>
                </div>

                <div className="order-admin-info">
                  <span>الهاتف: {order.phone || "-"}</span>
                  <span>الاحتياطي: {order.backup_phone || "-"}</span>
                  <span>العنوان: {order.address || "-"}</span>
                </div>

                <div className="order-admin-items">
                  {(order.items || []).map((item, index) => (
                    <div className="order-admin-item" key={index}>
                      <img src={item.image_url} alt={item.name} />
                      <div>
                        <strong>{item.name}</strong>
                        <p>{item.category_name}</p>
                        <span>{formatPrice(item.price)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </AdminGuard>
  );
}