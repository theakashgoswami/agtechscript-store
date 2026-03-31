import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getUserOrders } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { formatPrice, formatDate } from "../utils/format";
import { OrderSkeleton } from "../components/Skeleton";

export default function OrdersPage() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) return;

    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (isAuthenticated) {
          // Logged in user - fetch from API
          console.log("Fetching orders for user:", user?.user_id);
          const data = await getUserOrders();
          console.log("Orders API response:", data);
          
          if (data.orders) {
            setOrders(data.orders);
          } else if (Array.isArray(data)) {
            setOrders(data);
          } else {
            setOrders([]);
          }
        } else {
          // Guest user - show localStorage orders (fallback)
          const saved = JSON.parse(localStorage.getItem("shopzilla_orders") || "[]");
          setOrders(saved);
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError("Unable to load your orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, user, authLoading]);

  // Show loading skeleton while auth is loading
  if (authLoading || loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 pb-12">
        <h1 className="font-display font-bold text-2xl text-gray-900 mb-6">My Orders</h1>
        <OrderSkeleton count={2} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <span className="text-5xl">⚠️</span>
        <h2 className="font-display font-bold text-xl text-gray-800">Something went wrong</h2>
        <p className="text-sm text-gray-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-primary-500 text-white rounded-xl font-semibold text-sm hover:bg-primary-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <span className="text-6xl">📦</span>
        <h2 className="font-display font-bold text-xl text-gray-800">No orders yet</h2>
        <p className="text-sm text-gray-500">
          {isAuthenticated 
            ? "Your placed orders will appear here" 
            : "Login to view your orders"}
        </p>
        {isAuthenticated ? (
          <Link
            to="/"
            className="px-6 py-2.5 bg-primary-500 text-white rounded-xl font-semibold text-sm hover:bg-primary-600 transition-colors"
          >
            Start Shopping
          </Link>
        ) : (
          <button
            onClick={() => {
              localStorage.setItem("returnAfterLogin", window.location.href);
              window.location.href = "https://agtechscript.in#login";
            }}
            className="px-6 py-2.5 bg-primary-500 text-white rounded-xl font-semibold text-sm hover:bg-primary-600 transition-colors"
          >
            Login to View Orders
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-12">
      <h1 className="font-display font-bold text-2xl text-gray-900 mb-6">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.order_id || order.id} className="bg-white rounded-2xl shadow-card overflow-hidden">
            {/* Order header */}
            <button
              onClick={() => setExpanded(expanded === (order.order_id || order.id) ? null : (order.order_id || order.id))}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    Order #{order.order_id || order.id}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(order.created_at || order.createdAt)}
                  </p>
                </div>
              </div>
              <div className="text-right flex items-center gap-4">
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {formatPrice(order.total_amount || order.total)}
                  </p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    (order.status === 'delivered' || order.order_status === 'delivered') ? 'bg-emerald-50 text-emerald-600' :
                    (order.status === 'confirmed' || order.order_status === 'confirmed') ? 'bg-blue-50 text-blue-600' :
                    (order.status === 'processing' || order.order_status === 'processing') ? 'bg-amber-50 text-amber-600' :
                    (order.status === 'cancelled' || order.order_status === 'cancelled') ? 'bg-red-50 text-red-600' :
                    'bg-gray-50 text-gray-600'
                  }`}>
                    {order.status || order.order_status || 'Confirmed'}
                  </span>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${expanded === (order.order_id || order.id) ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Order details */}
            {expanded === (order.order_id || order.id) && (
              <div className="border-t border-gray-100 p-4 animate-fade-in">
                {/* Delivery info */}
                <div className="bg-gray-50 rounded-xl p-3 mb-3">
                  <p className="text-xs font-bold text-gray-700 mb-1">📍 Delivery Address</p>
                  <p className="text-xs text-gray-600">
                    {order.shipping_name || order.form?.name} · {order.shipping_phone || order.form?.phone}
                  </p>
                  <p className="text-xs text-gray-600">
                    {order.shipping_address || order.form?.address}
                    {order.shipping_city && `, ${order.shipping_city}`}
                    {order.shipping_state && `, ${order.shipping_state}`}
                    {order.shipping_pincode && ` - ${order.shipping_pincode}`}
                  </p>
                </div>

                {/* Items */}
                <div className="space-y-2.5">
                  {(order.items || order.order_items || []).map((item, idx) => (
                    <div key={idx} className="flex gap-3">
                      <img
                        src={item.product_image || item.thumbnail}
                        alt={item.product_name || item.title}
                        className="w-12 h-12 object-cover rounded-lg bg-gray-100 border border-gray-100 shrink-0"
                        onError={(e) => { e.target.src = "https://placehold.co/60x60/f3f4f6/9ca3af"; }}
                      />
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/product/${item.product_id || item.id}`}
                          className="text-xs font-medium text-gray-800 hover:text-primary-600 transition-colors line-clamp-2"
                        >
                          {item.product_name || item.title}
                        </Link>
                        <p className="text-xs text-gray-500">×{item.quantity}</p>
                      </div>
                      <p className="text-xs font-bold text-gray-900 shrink-0">
                        {formatPrice(item.total || (item.price * item.quantity))}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between">
                  <span className="text-sm font-bold text-gray-900">Total</span>
                  <span className="text-sm font-bold text-primary-600">
                    {formatPrice(order.total_amount || order.total)}
                  </span>
                </div>

                {/* Payment info */}
                <div className="mt-2 pt-2 text-xs text-gray-400 flex justify-between border-t border-gray-50">
                  <span>Payment: {order.payment_method || 'COD'}</span>
                  <span>Order ID: {order.order_id || order.id}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}