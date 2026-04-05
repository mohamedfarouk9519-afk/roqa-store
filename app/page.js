import HomeClient from "@/components/HomeClient";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let categories = [];
  let products = [];

  if (supabase) {
    const [{ data: c }, { data: p }] = await Promise.all([
      supabase.from("categories").select("*").order("created_at", { ascending: true }),
      supabase.from("products").select("*, categories(name)").order("created_at", { ascending: true })
    ]);

    categories = c || [];
    products = (p || []).map(item => ({ ...item, category_name: item.categories?.name || "" }));
  }

  return <HomeClient initialCategories={categories} initialProducts={products} />;
}
