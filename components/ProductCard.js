"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/utils";

export default function ProductCard({ product, onAddToCart }) {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;

  return (
    <div className="card">
      <img src={product.image_url} alt={product.name} className="cover-image" />
      <div className="card-body">
        <h3 className="product-title">{product.name}</h3>
        <div className="price">{formatPrice(product.price)}</div>
        <div className="product-actions">
          <button className="remove-mark" onClick={() => setHidden(true)}>x</button>
          <button className="btn" style={{ flex: 1 }} onClick={() => onAddToCart(product)}>
            أضف إلى السلة
          </button>
        </div>
      </div>
    </div>
  );
}
