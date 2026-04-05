"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/utils";

export default function ProductCard({ product, onAddToCart }) {
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  return (
    <div className="product-card">
      <div className="product-image-wrap">
        <img src={product.image_url} alt={product.name} className="product-image" />
        <button
          className="product-remove-btn"
          onClick={() => setHidden(true)}
          title="إخفاء المنتج"
        >
          ×
        </button>
      </div>

      <div className="product-content">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">{formatPrice(product.price)}</p>

        <button className="product-add-btn" onClick={() => onAddToCart(product)}>
          أضف إلى السلة
        </button>
      </div>
    </div>
  );
}