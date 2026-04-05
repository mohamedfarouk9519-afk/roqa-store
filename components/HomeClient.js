"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";

export default function HomeClient({ initialCategories = [], initialProducts = [] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [products, setProducts] = useState(initialProducts);
  const [cartCount, setCartCount] = useState(0);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    const stored = localStorage.getItem("roqa_cart");
    const parsed = stored ? JSON.parse(stored) : [];
    setCartCount(parsed.length);
  }, []);

  useEffect(() => {
    if (!supabase) return;

    const load = async () => {
      const [{ data: c }, { data: p }] = await Promise.all([
        supabase.from("categories").select("*").order("created_at", { ascending: true }),
        supabase.from("products").select("*, categories(name)").order("created_at", { ascending: true })
      ]);

      if (c) setCategories(c);
      if (p) {
        setProducts(
          p.map((item) => ({
            ...item,
            category_name: item.categories?.name || ""
          }))
        );
      }
    };

    load();

    const categoriesChannel = supabase
      .channel("categories-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, load)
      .subscribe();

    const productsChannel = supabase
      .channel("products-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, load)
      .subscribe();

    return () => {
      supabase.removeChannel(categoriesChannel);
      supabase.removeChannel(productsChannel);
    };
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products;

    if (activeCategory !== "all") {
      result = result.filter((product) => product.category_id === activeCategory);
    }

    if (search.trim()) {
      result = result.filter((product) =>
        `${product.name} ${product.category_name}`.toLowerCase().includes(search.toLowerCase())
      );
    }

    return result;
  }, [products, activeCategory, search]);

  const productsByCategory = useMemo(() => {
    if (activeCategory !== "all") {
      const category = categories.find((c) => c.id === activeCategory);
      if (!category) return [];

      return [
        {
          ...category,
          products: filteredProducts.filter((product) => product.category_id === category.id)
        }
      ];
    }

    return categories.map((category) => ({
      ...category,
      products: filteredProducts.filter((product) => product.category_id === category.id)
    }));
  }, [categories, filteredProducts, activeCategory]);

  function addToCart(product) {
    const stored = localStorage.getItem("roqa_cart");
    const parsed = stored ? JSON.parse(stored) : [];
    parsed.push(product);
    localStorage.setItem("roqa_cart", JSON.stringify(parsed));
    setCartCount(parsed.length);
    alert("تمت إضافة المنتج إلى السلة");
  }

  return (
    <>
      <Header cartCount={cartCount} />

      <main className="container">
        <section className="hero-section">
          <div className="hero-box hero-box-v2">
            <div className="hero-text">
              <span className="hero-badge">roqa store</span>
              <h1>أجمل تفاصيل الخطوبة وكتب الكتاب في مكان واحد</h1>
              <p>
                اختاري من مرايات الخطوبة والورد وورد الستان والكاسات ومناديل كتب الكتاب،
                وأضيفي المنتجات بسهولة إلى السلة لإتمام الطلب بسرعة.
              </p>
            </div>
          </div>
        </section>

        <section className="toolbar-section">
          <div className="toolbar-top">
            <input
              type="text"
              className="search-input"
              placeholder="ابحثي عن منتج أو قسم..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="category-tabs">
            <button
              className={`category-tab ${activeCategory === "all" ? "active" : ""}`}
              onClick={() => setActiveCategory("all")}
            >
              كل الأقسام
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                className={`category-tab ${activeCategory === category.id ? "active" : ""}`}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </section>

        {productsByCategory.map((category) => (
          <section className="category-block" key={category.id}>
            <div className="category-header category-header-v2">
              <div>
                <h2 className="category-title">{category.name}</h2>
                <p className="category-subtitle">
                  {category.products.length} منتج داخل هذا القسم
                </p>
              </div>

              {category.image_url ? (
                <img
                  src={category.image_url}
                  alt={category.name}
                  className="category-thumb"
                />
              ) : null}
            </div>

            {category.products.length === 0 ? (
              <div className="empty-category">لا توجد منتجات مطابقة الآن.</div>
            ) : (
              <div className="products-grid-new">
                {category.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={addToCart}
                  />
                ))}
              </div>
            )}
          </section>
        ))}

        {!productsByCategory.length && (
          <div className="empty-category" style={{ marginBottom: 30 }}>
            لا توجد أقسام أو منتجات متاحة الآن.
          </div>
        )}

        <div className="footer-space" />
      </main>
    </>
  );
}