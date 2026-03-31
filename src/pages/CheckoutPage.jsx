import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { formatPrice, discountedPrice } from "../utils/format";


export default function CheckoutPage() {
  const { cart, subtotal, discount, total, itemCount, clearCart: clearCartCtx } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "", city: "", state: "", pincode: "", landmark: "",
  });
  const [errors, setErrors] = useState({});
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.phone.trim() || form.phone.length < 10) errs.phone = "Valid phone number required";
    if (!form.address.trim()) errs.address = "Address is required";
    if (!form.city.trim()) errs.city = "City is required";
    if (!form.state.trim()) errs.state = "State is required";
    if (!form.pincode.trim() || form.pincode.length !== 6) errs.pincode = "Valid 6-digit pincode required";
    return errs;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }));
  }

  async function handlePlaceOrder(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setPlacing(true);
    // Simulate order placement
    await new Promise((res) => setTimeout(res, 1500));

    const id = `SZ${Date.now().toString().slice(-8)}`;
    setOrderId(id);

    // Save order to localStorage
    const order = { id, items: cart, form, total, createdAt: new Date().toISOString() };
    const orders = JSON.parse(localStorage.getItem("shopzilla_orders") || "[]");
    orders.unshift(order);
    localStorage.setItem("shopzilla_orders", JSON.stringify(orders));

    clearCartCtx();
    setPlacing(false);
    setPlaced(true);
  }

  if (cart.length === 0 && !placed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <span className="text-6xl">🛒</span>
        <h2 className="font-display font-bold text-xl text-gray-800">Your cart is empty</h2>
        <p className="text-sm text-gray-500">Add some products before checking out</p>
        <Link to="/" className="px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors text-sm">
          Shop Now
        </Link>
      </div>
    );
  }

  // Success screen
  if (placed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 text-center px-4 animate-fade-in">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h2 className="font-display font-bold text-2xl text-gray-900">Order Placed! 🎉</h2>
          <p className="text-gray-500 mt-1">Order ID: <span className="font-bold text-primary-600">{orderId}</span></p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-5 max-w-sm w-full text-left space-y-2">
          <p className="text-sm text-gray-600"><span className="font-semibold">Name:</span> {form.name}</p>
          <p className="text-sm text-gray-600"><span className="font-semibold">Phone:</span> {form.phone}</p>
          <p className="text-sm text-gray-600"><span className="font-semibold">Address:</span> {form.address}, {form.city}, {form.state} - {form.pincode}</p>
          <p className="text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
            Total Paid: {formatPrice(total)}
          </p>
        </div>
        <p className="text-sm text-gray-500">Expected delivery: <span className="font-semibold text-gray-700">3-5 business days</span></p>
        <div className="flex gap-3">
          <Link to="/" className="px-6 py-2.5 bg-primary-500 text-white rounded-xl font-semibold text-sm hover:bg-primary-600 transition-colors">
            Continue Shopping
          </Link>
          <Link to="/orders" className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">
            My Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-12">
      <h1 className="font-display font-bold text-2xl text-gray-900 mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <form onSubmit={handlePlaceOrder} className="lg:col-span-2 space-y-5">
          {/* Delivery address */}
          <div className="bg-white rounded-2xl shadow-card p-5">
            <h2 className="font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
              Delivery Address
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Full Name*" name="name" value={form.name} onChange={handleChange} error={errors.name} placeholder="John Doe" />
              <Field label="Phone Number*" name="phone" value={form.phone} onChange={handleChange} error={errors.phone} placeholder="9876543210" type="tel" />
              <Field label="Email (optional)" name="email" value={form.email} onChange={handleChange} placeholder="john@email.com" type="email" className="sm:col-span-2" />
              <Field label="Address*" name="address" value={form.address} onChange={handleChange} error={errors.address} placeholder="House/Flat No., Street" className="sm:col-span-2" />
              <Field label="Landmark (optional)" name="landmark" value={form.landmark} onChange={handleChange} placeholder="Near landmark" className="sm:col-span-2" />
              <Field label="City*" name="city" value={form.city} onChange={handleChange} error={errors.city} placeholder="Mumbai" />
              <Field label="State*" name="state" value={form.state} onChange={handleChange} error={errors.state} placeholder="Maharashtra" />
              <Field label="Pincode*" name="pincode" value={form.pincode} onChange={handleChange} error={errors.pincode} placeholder="400001" maxLength={6} />
            </div>
          </div>

          {/* Payment placeholder */}
          <div className="bg-white rounded-2xl shadow-card p-5">
            <h2 className="font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
              Payment
            </h2>
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div>
                <p className="text-sm font-bold text-emerald-800">Cash on Delivery</p>
                <p className="text-xs text-emerald-600">Pay when your order arrives</p>
              </div>
              <div className="ml-auto">
                <div className="w-4 h-4 rounded-full border-2 border-emerald-500 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={placing}
            className="w-full py-4 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 active:scale-[0.98] transition-all disabled:opacity-70 text-base flex items-center justify-center gap-2"
          >
            {placing ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Placing Order…
              </>
            ) : (
              `Place Order — ${formatPrice(total)}`
            )}
          </button>
        </form>

        {/* Order summary */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-card p-4 sticky top-20">
            <h2 className="font-display font-bold text-gray-900 mb-3">
              Order Summary ({itemCount} items)
            </h2>
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {cart.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-2.5">
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="w-12 h-12 object-cover rounded-lg bg-gray-100 border border-gray-100 shrink-0"
                    onError={(e) => { e.target.src = "https://placehold.co/60x60/f3f4f6/9ca3af"; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 line-clamp-2 leading-snug">{product.title}</p>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs text-gray-500">×{quantity}</span>
                      <span className="text-xs font-bold text-gray-900">
                        {formatPrice(discountedPrice(product.price, product.discountPercentage) * quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 mt-3 pt-3 space-y-1.5">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Discount</span>
                  <span>−{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery</span>
                <span className="text-emerald-600 font-medium">FREE</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="font-display">{formatPrice(total)}</span>
              </div>
            </div>

            {discount > 0 && (
              <div className="mt-3 bg-emerald-50 rounded-xl p-2.5 text-center">
                <p className="text-xs text-emerald-700 font-semibold">
                  🎉 You save {formatPrice(discount)} on this order!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, error, placeholder, type = "text", className = "", maxLength }) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${
          error
            ? "border-red-300 focus:ring-red-300 bg-red-50"
            : "border-gray-200 focus:ring-primary-300"
        }`}
      />
      {error && <p className="text-red-500 text-xs mt-0.5">{error}</p>}
    </div>
  );
}
