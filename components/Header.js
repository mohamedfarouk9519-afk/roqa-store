"use client";

import { ShoppingCart, ScanFace } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Header({ cartCount = 0 }) {
  const [clicks, setClicks] = useState(0);
  const router = useRouter();

  function handleMirrorClick() {
    const next = clicks + 1;
    if (next >= 5) {
      const password = window.prompt("اكتب الباسورد للدخول إلى صفحة الأدمن");
      setClicks(0);
      if (password === (process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "859410")) {
        sessionStorage.setItem("roqa_admin_ok", "1");
        router.push("/admin");
      } else if (password !== null) {
        alert("الباسورد غير صحيح");
      }
      return;
    }
    setClicks(next);
    setTimeout(() => setClicks(0), 2500);
  }

  return (
    <header className="header">
      <div className="container header-inner">
        <div className="brand">
          <button className="mirror-btn" onClick={handleMirrorClick} title="admin access">
            <ScanFace size={20} />
          </button>
          <span>roqa store</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="icon-btn" onClick={() => router.back()}>
            رجوع
          </button>
          <button className="icon-btn" onClick={() => router.push("/cart")}>
            <ShoppingCart size={18} />
            <span>السلة</span>
            <span className="cart-badge">{cartCount}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
