import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatPrice, discountedPrice } from "../utils/format";

export default function CartDrawer({ open, onClose }) {
  const navigate = useNavigate();
  const { cart, itemCount, total, discount, subtotal, removeFromCart, updateQuantity } = useCart();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div className="cart-overlay absolute inset-0" style={{ background:"rgba(10,15,44,0.6)", backdropFilter:"blur(6px)" }}
        onClick={onClose} />

      {/* Drawer */}
      <div className="cart-drawer relative flex flex-col w-full max-w-md h-full bg-white shadow-2xl overflow-hidden">

        {/* Top accent bar */}
        <div className="h-1 w-full" style={{ background:"linear-gradient(90deg,#0047ff,#00e6ff)" }} />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-lg text-gray-900">Your Cart</h2>
            {itemCount > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                style={{ background:"#0047ff" }}>
                {itemCount}
              </span>
            )}
          </div>
          <button onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background:"rgba(0,71,255,0.08)" }}>
                <svg className="w-10 h-10" style={{ color:"rgba(0,71,255,0.3)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-gray-700">Your cart is empty</p>
                <p className="text-sm text-gray-400 mt-1">Add products to get started</p>
              </div>
              <button onClick={onClose}
                className="px-6 py-2 text-white text-sm font-bold rounded-xl transition-all hover:opacity-90"
                style={{ background:"linear-gradient(135deg,#0047ff,#0033ad)" }}>
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map(({ product, quantity }) => {
                const fp = discountedPrice(product.price, product.discountPercentage);
                return (
                  <div key={product.id}
                    className="flex gap-3 rounded-xl p-3 animate-fade-in"
                    style={{ background:"rgba(0,71,255,0.03)", border:"1px solid rgba(0,71,255,0.08)" }}>
                    <Link to={`/product/${product.id}`} onClick={onClose} className="shrink-0">
                      <img src={product.thumbnail} alt={product.title}
                        className="w-16 h-16 object-cover rounded-lg bg-white border border-gray-100"
                        onError={(e) => { e.target.src = "https://placehold.co/80x80/e8edf8/0047ff"; }} />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${product.id}`} onClick={onClose}
                        className="text-sm font-medium text-gray-800 line-clamp-2 hover:text-blue-700 transition-colors leading-snug">
                        {product.title}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">{product.brand}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-bold text-gray-900">{formatPrice(fp)}</span>
                        {/* Qty */}
                        <div className="flex items-center gap-0 bg-white border border-gray-200 rounded-lg overflow-hidden">
                          <button onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-base font-medium">−</button>
                          <span className="w-7 text-center text-sm font-bold text-gray-800">{quantity}</span>
                          <button onClick={() => updateQuantity(product.id, quantity + 1)}
                            disabled={quantity >= (product.stock || 99)}
                            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-base font-medium disabled:opacity-40">+</button>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(product.id)}
                      className="shrink-0 p-1 text-gray-300 hover:text-red-400 transition-colors self-start">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-3 bg-white">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal ({itemCount} items)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Discount</span><span>−{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery</span>
                <span className="text-emerald-600 font-medium">FREE</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <button onClick={() => { onClose(); navigate("/checkout"); }}
              className="w-full py-3 text-white font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all text-sm"
              style={{ background:"linear-gradient(135deg,#0047ff,#0033ad)", boxShadow:"0 6px 20px rgba(0,71,255,0.35)" }}>
              Proceed to Checkout →
            </button>
            <button onClick={onClose}
              className="w-full py-2.5 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm">
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
