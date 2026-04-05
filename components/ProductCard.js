export default function ProductCard({ product, onAddToCart }) {
  return (
    <div className="product-card">
      <div className="product-image-wrap">
        <img
          src={product.image_url}
          alt={product.name}
          className="product-image"
        />
      </div>

      <div className="product-content">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">{formatPrice(product.price)}</p>

        <button
          className="product-add-btn"
          onClick={() => onAddToCart(product)}
        >
          أضف إلى السلة
        </button>
      </div>
    </div>
  );
}