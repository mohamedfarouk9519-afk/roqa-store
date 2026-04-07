"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useMemo, useState } from "react";

export default function AdminPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editImageFile, setEditImageFile] = useState(null);

  async function loadProducts() {
    const res = await fetch("/api/products", { cache: "no-store" });
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
  }

  async function loadCategories() {
    const res = await fetch("/api/categories", { cache: "no-store" });
    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  useEffect(() => {
    async function checkAdmin() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const res = await fetch("/api/check-admin");
      const result = await res.json();

      if (!result.isAdmin) {
        alert("غير مصرح لك");
        window.location.href = "/";
      }
    }

    checkAdmin();
  }, []);

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (file) setImageFile(file);
  }

  function handleEditImageChange(e) {
    const file = e.target.files?.[0];
    if (file) setEditImageFile(file);
  }

  const totalProducts = products.length;
  const totalCategories = categories.length;
  const totalSales = useMemo(
    () => products.reduce((sum, p) => sum + Number(p.price || 0), 0),
    [products]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("category_id", categoryId);

    if (imageFile) formData.append("image", imageFile);
    if (imageUrl) formData.append("image_url", imageUrl);

    const res = await fetch("/api/products", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data?.error || "حصل خطأ أثناء إضافة المنتج");
      return;
    }

    setName("");
    setPrice("");
    setCategoryId("");
    setImageUrl("");
    setImageFile(null);

    await loadProducts();
    alert("تمت إضافة المنتج بنجاح");
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setEditName(product.name || "");
    setEditPrice(String(product.price ?? ""));
    setEditCategoryId(product.category_id || "");
    setEditImageUrl(product.image_url || "");
    setEditImageFile(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditPrice("");
    setEditCategoryId("");
    setEditImageUrl("");
    setEditImageFile(null);
  };

  const handleUpdate = async (id) => {
    const formData = new FormData();
    formData.append("name", editName);
    formData.append("price", editPrice);
    formData.append("category_id", editCategoryId);

    if (editImageFile) formData.append("image", editImageFile);
    if (editImageUrl) formData.append("image_url", editImageUrl);

    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data?.error || "حصل خطأ أثناء تعديل المنتج");
      return;
    }

    cancelEdit();
    await loadProducts();
    alert("تم تعديل المنتج بنجاح");
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("هل تريد حذف المنتج؟");
    if (!ok) return;

    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert(data?.error || "حصل خطأ أثناء حذف المنتج");
      return;
    }

    await loadProducts();
    alert("تم حذف المنتج");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    document.cookie =
      "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/login";
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#fcf5f7",
        padding: "24px",
        direction: "rtl",
      }}
    >
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h1 style={{ color: "#b44b73", fontSize: "40px", margin: 0 }}>
            roqa store
          </h1>

          <div style={{ display: "flex", gap: "12px" }}>
            <button type="button" style={smallBtn}>رجوع</button>
            <button type="button" style={smallBtn}>السلة</button>
            <button type="button" style={smallBtn} onClick={handleLogout}>
              تسجيل خروج
            </button>
          </div>
        </div>

        <section style={heroCard}>
          <h2 style={{ color: "#c0527c", margin: "0 0 8px 0", fontSize: "42px" }}>
            لوحة تحكم الأدمن
          </h2>
          <p style={{ color: "#8a6675", margin: 0 }}>
            إدارة كاملة للمنتجات والأقسام والطلبات والمبيعات
          </p>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          <StatCard title="عدد الأقسام" value={totalCategories} />
          <StatCard title="عدد المنتجات" value={totalProducts} />
          <StatCard title="عدد الطلبات" value={2} />
          <StatCard title="إجمالي المبيعات" value={`${totalSales} ج.م`} />
        </section>

        <section style={panel}>
          <h3 style={sectionTitle}>إضافة منتج جديد</h3>

          <form onSubmit={handleSubmit}>
            <div style={formGrid}>
              <div>
                <label style={label}>اسم المنتج</label>
                <input style={input} type="text" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div>
                <label style={label}>السعر</label>
                <input style={input} type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>

              <div>
                <label style={label}>القسم</label>
                <select style={input} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  <option value="">اختار القسم</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={label}>رابط الصورة</label>
                <input style={input} type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={label}>أو اختاري صورة من الجهاز</label>
                <input style={fileInput} type="file" accept="image/*" onChange={handleImageChange} />
                <p style={hint}>يمكنك إدخال رابط صورة أو اختيار صورة من الجهاز</p>
              </div>
            </div>

            <button type="submit" style={submitBtn}>إضافة المنتج</button>
          </form>
        </section>

        <section style={panel}>
          <h3 style={sectionTitle}>المنتجات الحالية</h3>

          <div style={productsGrid}>
            {products.map((product) => (
              <div key={product.id} style={productCard}>
                <img
                  src={product.image_url || "https://via.placeholder.com/400x300?text=No+Image"}
                  alt={product.name}
                  style={productImage}
                />

                <div style={{ padding: "14px" }}>
                  {editingId === product.id ? (
                    <>
                      <input
                        style={{ ...input, marginBottom: 10 }}
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="اسم المنتج"
                      />

                      <input
                        style={{ ...input, marginBottom: 10 }}
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        placeholder="السعر"
                      />

                      <select
                        style={{ ...input, marginBottom: 10 }}
                        value={editCategoryId}
                        onChange={(e) => setEditCategoryId(e.target.value)}
                      >
                        <option value="">اختار القسم</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>

                      <input
                        style={{ ...input, marginBottom: 10 }}
                        type="text"
                        value={editImageUrl}
                        onChange={(e) => setEditImageUrl(e.target.value)}
                        placeholder="رابط الصورة"
                      />

                      <input
                        style={{ ...fileInput, marginBottom: 10 }}
                        type="file"
                        accept="image/*"
                        onChange={handleEditImageChange}
                      />

                      <div style={{ display: "flex", gap: 8 }}>
                        <button type="button" style={saveBtn} onClick={() => handleUpdate(product.id)}>
                          حفظ
                        </button>
                        <button type="button" style={cancelBtn} onClick={cancelEdit}>
                          إلغاء
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h4 style={{ margin: "0 0 8px", fontSize: "22px", color: "#6c3a52" }}>
                        {product.name}
                      </h4>
                      <p style={{ margin: "0 0 6px", color: "#8f6a79" }}>
                        {product.price} ج.م
                      </p>
                      <p style={{ margin: "0 0 14px", color: "#8f6a79" }}>
                        {product.categories?.name || "بدون قسم"}
                      </p>

                      <div style={{ display: "flex", gap: 8 }}>
                        <button type="button" style={editBtn} onClick={() => startEdit(product)}>
                          تعديل
                        </button>
                        <button type="button" style={deleteBtn} onClick={() => handleDelete(product.id)}>
                          حذف
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({ title, value }) {
  return (
    <div style={statCard}>
      <div style={{ color: "#9c7a88", marginBottom: 8 }}>{title}</div>
      <div style={{ color: "#cb5d89", fontWeight: "700", fontSize: "26px" }}>{value}</div>
    </div>
  );
}

const heroCard = {
  background: "#f8e8ee",
  border: "1px solid #efc8d5",
  borderRadius: "28px",
  padding: "34px",
  marginBottom: "20px",
};

const panel = {
  background: "#fff",
  border: "1px solid #efc8d5",
  borderRadius: "24px",
  padding: "20px",
  marginBottom: "20px",
};

const sectionTitle = {
  color: "#c0527c",
  fontSize: "34px",
  margin: "0 0 18px 0",
};

const formGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "16px",
  marginBottom: "16px",
};

const label = {
  display: "block",
  marginBottom: "8px",
  color: "#6d4f5b",
  fontWeight: "600",
};

const input = {
  width: "100%",
  height: "46px",
  borderRadius: "14px",
  border: "1px solid #e9c7d3",
  padding: "0 14px",
  outline: "none",
  background: "#fff",
};

const fileInput = {
  width: "100%",
  borderRadius: "14px",
  border: "1px solid #e9c7d3",
  padding: "12px",
  background: "#fff",
};

const hint = {
  fontSize: "13px",
  color: "#8a7a81",
  marginTop: "8px",
};

const submitBtn = {
  width: "100%",
  height: "52px",
  border: "none",
  borderRadius: "16px",
  background: "#d86a97",
  color: "#fff",
  fontSize: "22px",
  fontWeight: "700",
  cursor: "pointer",
};

const statCard = {
  background: "#fff",
  border: "1px solid #efc8d5",
  borderRadius: "24px",
  padding: "20px",
  textAlign: "center",
};

const productsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "16px",
};

const productCard = {
  background: "#fff",
  border: "1px solid #efc8d5",
  borderRadius: "18px",
  overflow: "hidden",
};

const productImage = {
  width: "100%",
  height: "250px",
  objectFit: "cover",
  display: "block",
};

const editBtn = {
  flex: 1,
  border: "none",
  borderRadius: "12px",
  background: "#d86a97",
  color: "#fff",
  padding: "10px 12px",
  cursor: "pointer",
};

const deleteBtn = {
  flex: 1,
  border: "none",
  borderRadius: "12px",
  background: "#eee",
  color: "#444",
  padding: "10px 12px",
  cursor: "pointer",
};

const saveBtn = {
  flex: 1,
  border: "none",
  borderRadius: "12px",
  background: "#d86a97",
  color: "#fff",
  padding: "10px 12px",
  cursor: "pointer",
};

const cancelBtn = {
  flex: 1,
  border: "none",
  borderRadius: "12px",
  background: "#eee",
  color: "#444",
  padding: "10px 12px",
  cursor: "pointer",
};

const smallBtn = {
  border: "1px solid #e8c3cf",
  background: "#fff",
  color: "#5f4954",
  borderRadius: "14px",
  padding: "10px 16px",
  cursor: "pointer",
};