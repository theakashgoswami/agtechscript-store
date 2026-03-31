import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProductById, getProductsByCategory } from "../utils/api";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { formatPrice, formatDiscount, discountedPrice } from "../utils/format";
import { addToRecent } from "../utils/storage";
import StarRating from "../components/StarRating";
import ProductCard from "../components/ProductCard";
import { ProductDetailSkeleton } from "../components/Skeleton";

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, isInCart, getQuantity, updateQuantity } = useCart();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [pincode, setPincode] = useState("");
  const [pincodeMsg, setPincodeMsg] = useState("");

  useEffect(() => {
    setLoading(true);
    setProduct(null);
    setActiveImg(0);
    window.scrollTo(0, 0);

    getProductById(id)
      .then((data) => {
        setProduct(data);
        addToRecent(data);
        return getProductsByCategory(data.category, { limit: 8 });
      })
      .then((data) => {
        const items = data.products || data;
        setRelated(items.filter((p) => String(p.id) !== id).slice(0, 8));
      })
      .catch(() => navigate("/404"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <ProductDetailSkeleton />;
  if (!product) return null;

  const images = product.images?.length ? product.images : [product.thumbnail];
  const finalPrice = discountedPrice(product.price, product.discountPercentage);
  const discountLabel = formatDiscount(product.discountPercentage);
  const inCart = isInCart(product.id);
  const cartQty = getQuantity(product.id);

  function handleAddToCart() {
    for (let i = 0; i < qty; i++) addToCart(product);
    toast.success(`Added ${qty} item${qty > 1 ? "s" : ""} to cart`);
    setQty(1);
  }

  function handleBuyNow() {
    addToCart(product);
    navigate("/checkout");
  }

  function handlePincodeCheck() {
    if (pincode.length !== 6 || isNaN(Number(pincode))) {
      setPincodeMsg("❌ Enter a valid 6-digit pincode");
      return;
    }
    setPincodeMsg("✅ Delivery available by tomorrow");
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-2">
        <nav className="text-xs text-gray-500 flex items-center gap-1 flex-wrap">
          <Link to="/" className="hover:text-primary-600">Home</Link>
          <span>/</span>
          <Link to={`/category/${product.category}`} className="hover:text-primary-600 capitalize">
            {product.category.replace(/-/g, " ")}
          </Link>
          <span>/</span>
          <span className="text-gray-800 truncate max-w-[200px]">{product.title}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 bg-white rounded-2xl shadow-card p-4 md:p-8">
          {/* Left: Image gallery */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
              <img
                src={images[activeImg]}
                alt={product.title}
                className="w-full h-full object-contain p-4 transition-all duration-300"
                onError={(e) => { e.target.src = "https://placehold.co/600x600/f3f4f6/9ca3af?text=No+Image"; }}
              />
              {discountLabel && (
                <span className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                  {discountLabel}
                </span>
              )}
              {product.stock < 10 && product.stock > 0 && (
                <span className="absolute top-3 right-3 bg-orange-100 text-orange-600 text-xs font-semibold px-2 py-1 rounded-lg">
                  Only {product.stock} left!
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      i === activeImg ? "border-primary-500 shadow-md" : "border-gray-200 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = "https://placehold.co/80x80/f3f4f6/9ca3af"; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product info */}
          <div className="py-2 space-y-4">
            <div>
              <span className="text-xs font-bold text-primary-500 uppercase tracking-wider">
                {product.brand}
              </span>
              <h1 className="font-display font-bold text-xl md:text-2xl text-gray-900 mt-1 leading-snug">
                {product.title}
              </h1>
            </div>

            <StarRating rating={product.rating} count={Math.floor(product.rating * 120)} size="md" />

            {/* Price */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="font-display font-bold text-3xl text-gray-900">
                  {formatPrice(finalPrice)}
                </span>
                {product.discountPercentage > 0 && (
                  <>
                    <span className="text-base price-original">{formatPrice(product.price)}</span>
                    <span className="text-emerald-600 font-bold text-sm bg-emerald-50 px-2 py-0.5 rounded-lg">
                      {discountLabel}
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes. Free delivery.</p>
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              {product.stock > 0 ? (
                <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-semibold">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="text-sm text-red-500 font-semibold">❌ Out of Stock</span>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-1">About this product</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Qty selector */}
            {product.stock > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-700">Qty:</span>
                <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-9 h-9 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors font-medium text-lg"
                  >
                    −
                  </button>
                  <span className="w-10 text-center font-bold text-gray-900">{qty}</span>
                  <button
                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                    className="w-9 h-9 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors font-medium text-lg"
                  >
                    +
                  </button>
                </div>
                {inCart && (
                  <span className="text-xs text-primary-600 font-medium">
                    {cartQty} already in cart
                  </span>
                )}
              </div>
            )}

            {/* CTA buttons */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 py-3 bg-accent text-white font-bold rounded-xl hover:bg-accent-dark active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {inCart ? "✓ Add More to Cart" : "🛒 Add to Cart"}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 py-3 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                ⚡ Buy Now
              </button>
            </div>

            {/* Delivery check */}
            <div className="border border-gray-200 rounded-xl p-3">
              <p className="text-xs font-bold text-gray-700 mb-2">📦 Check Delivery</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => { setPincode(e.target.value.replace(/\D/g, "").slice(0, 6)); setPincodeMsg(""); }}
                  placeholder="Enter pincode"
                  className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                  maxLength={6}
                />
                <button
                  onClick={handlePincodeCheck}
                  className="px-4 py-2 bg-primary-500 text-white text-xs font-bold rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Check
                </button>
              </div>
              {pincodeMsg && (
                <p className="text-xs mt-2 font-medium text-gray-700">{pincodeMsg}</p>
              )}
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display font-bold text-xl text-gray-900 mb-4">
              Similar Products
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
