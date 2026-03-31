import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { formatPrice, formatDiscount, discountedPrice } from "../utils/format";
import StarRating from "./StarRating";

export default function ProductCard({ product }) {
  const { addToCart, isInCart } = useCart();
  const toast = useToast();
  const [imgLoaded, setImgLoaded] = useState(false);
  const imgRef = useRef(null);
  const inCart = isInCart(product.id);
  const finalPrice   = discountedPrice(product.price, product.discountPercentage);
  const discountLabel = formatDiscount(product.discountPercentage);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.src = product.thumbnail; obs.disconnect(); }
    }, { rootMargin: "200px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [product.thumbnail]);

  function handleAdd(e) {
    e.preventDefault(); e.stopPropagation();
    addToCart(product);
    toast.success(`"${product.title.slice(0, 28)}…" added to cart`);
  }

  return (
    <Link to={`/product/${product.id}`}
      className="product-card block rounded-xl overflow-hidden group"
      style={{ boxShadow: "0 2px 8px rgba(0,71,255,0.07)" }}>

      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {!imgLoaded && <div className="skeleton absolute inset-0" />}
        <img ref={imgRef} alt={product.title}
          className={`lazy w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${imgLoaded ? "loaded" : ""}`}
          onLoad={() => setImgLoaded(true)}
          onError={(e) => { setImgLoaded(true); e.target.src = `https://placehold.co/400x400/e8edf8/0047ff?text=${encodeURIComponent(product.brand || "AG")}`; }}
        />
        {discountLabel && (
          <span className="absolute top-2 left-2 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md"
            style={{ background: "linear-gradient(135deg,#0047ff,#00a8ff)" }}>
            {discountLabel}
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-500 bg-white px-2 py-1 rounded-full border">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-[11px] font-bold uppercase tracking-wide truncate" style={{ color: "#0047ff" }}>
          {product.brand}
        </p>
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug mt-0.5">
          {product.title}
        </h3>
        <div className="mt-1"><StarRating rating={product.rating} /></div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-2 flex-wrap">
          <span className="text-base font-bold text-gray-900">{formatPrice(finalPrice)}</span>
          {product.discountPercentage > 0 && (
            <span className="text-xs price-original">{formatPrice(product.price)}</span>
          )}
        </div>

        {/* Add to cart */}
        <button onClick={handleAdd} disabled={product.stock === 0}
          className={`mt-2 w-full py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
            inCart
              ? "border text-emerald-700 bg-emerald-50 border-emerald-200"
              : product.stock === 0
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "text-white hover:opacity-90 active:scale-95"
          }`}
          style={!inCart && product.stock > 0 ? { background:"linear-gradient(135deg,#0047ff,#0033ad)", boxShadow:"0 4px 12px rgba(0,71,255,0.3)" } : {}}>
          {inCart ? "✓ Added" : product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </Link>
  );
}
