import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { formatPrice, formatDate } from "../utils/format";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("shopzilla_orders") || "[]");
    setOrders(saved);
  }, []);

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <span className="text-6xl">📦</span>
        <h2 className="font-display font-bold text-xl text-gray-800">No orders yet</h2>
        <p className="text-sm text-gray-500">Your placed orders will appear here</p>
        <Link
          to="/"
          className="px-6 py-2.5 bg-primary-500 text-white rounded-xl font-semibold text-sm hover:bg-primary-600 transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-12">
      <h1 className="font-display font-bold text-2xl text-gray-900 mb-6">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-2xl shadow-card overflow-hidden">
            {/* Order header */}
            <button
              onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Order #{order.id}</p>
                  <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                </div>
              </div>
              <div className="text-right flex items-center gap-4">
                <div>
                  <p className="text-sm font-bold text-gray-900">{formatPrice(order.total)}</p>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Confirmed
                  </span>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${expanded === order.id ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Order details */}
            {expanded === order.id && (
              <div className="border-t border-gray-100 p-4 animate-fade-in">
                {/* Delivery info */}
                <div className="bg-gray-50 rounded-xl p-3 mb-3">
                  <p className="text-xs font-bold text-gray-700 mb-1">📍 Delivery Address</p>
                  <p className="text-xs text-gray-600">
                    {order.form?.name} · {order.form?.phone}
                  </p>
                  <p className="text-xs text-gray-600">
                    {order.form?.address}{order.form?.landmark ? `, ${order.form.landmark}` : ""}, {order.form?.city}, {order.form?.state} - {order.form?.pincode}
                  </p>
                </div>

                {/* Items */}
                <div className="space-y-2.5">
                  {order.items?.map(({ product, quantity }) => (
                    <div key={product.id} className="flex gap-3">
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="w-12 h-12 object-cover rounded-lg bg-gray-100 border border-gray-100 shrink-0"
                        onError={(e) => { e.target.src = "https://placehold.co/60x60/f3f4f6/9ca3af"; }}
                      />
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/product/${product.id}`}
                          className="text-xs font-medium text-gray-800 hover:text-primary-600 transition-colors line-clamp-2"
                        >
                          {product.title}
                        </Link>
                        <p className="text-xs text-gray-500">{product.brand} · ×{quantity}</p>
                      </div>
                      <p className="text-xs font-bold text-gray-900 shrink-0">
                        {formatPrice(product.price * quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between">
                  <span className="text-sm font-bold text-gray-900">Total</span>
                  <span className="text-sm font-bold text-primary-600">{formatPrice(order.total)}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
