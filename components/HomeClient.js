"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";

export default function HomeClient({ initialCategories = [], initialProducts = [] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [products, setProducts] = useState(initialProducts);
  const [cartCount, setCartCount] = useState(0);

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
        setProducts(p.map(item => ({ ...item, category_name: item.categories?.name || "" })));
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

  const productsByCategory = useMemo(() => {
    return categories.map(category => ({
      ...category,
      products: products.filter(product => product.category_id === category.id)
    }));
  }, [categories, products]);

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
        <section className="hero">
          <div className="hero-card">
            <h1>أهلاً بك في Roqa Store</h1>
            <p>
              متجر متخصص في مرايات الخطوبة والورد وورد الستان والكاسات ومناديل كتب الكتاب.
              اختاري المنتجات المناسبة وأضيفيها إلى السلة ثم أتمي الطلب بسهولة.
            </p>
          </div>
        </section>

        {productsByCategory.map(category => (
          <section className="category-section" key={category.id}>
            <h2 className="section-title">{category.name}</h2>
            {category.products.length === 0 ? (
              <div className="panel empty">لا توجد منتجات داخل هذا القسم الآن.</div>
            ) : (
              <div className="products-grid">
                {category.products.map(product => (
                  <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                ))}
              </div>
            )}
          </section>
        ))}

        <div className="footer-space" />
      </main>
    </>
  );
}
