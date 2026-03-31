import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatPrice, discountedPrice } from "../utils/format";
import { createOrder } from "../utils/api";

// Payment methods configuration
const PAYMENT_METHODS = {
  cod: {
    id: "cod",
    name: "Cash on Delivery",
    description: "Pay when your order arrives",
    icon: "💰",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    textColor: "text-emerald-800",
    accentColor: "bg-emerald-500",
  },
  razorpay: {
    id: "razorpay",
    name: "Razorpay",
    description: "Pay securely via UPI, Card, NetBanking",
    icon: "💳",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-800",
    accentColor: "bg-blue-500",
  },
  card: {
    id: "card",
    name: "Credit/Debit Card",
    description: "Visa, Mastercard, RuPay accepted",
    icon: "💳",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-800",
    accentColor: "bg-purple-500",
  },
  upi: {
    id: "upi",
    name: "UPI",
    description: "Google Pay, PhonePe, Paytm",
    icon: "📱",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    textColor: "text-indigo-800",
    accentColor: "bg-indigo-500",
  },
};

// Coupon validation API endpoint
const COUPON_API = "https://store.agtechscript.in/api/coupons/validate";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, subtotal, discount, total, itemCount, clearCart } = useCart();
  const { user, isAuthenticated, checkAuthViaCookies } = useAuth();
  const toast = useToast();

  // Form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [userId, setUserId] = useState(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  // Payment state
  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Delivery pincode check
  const [pincodeValid, setPincodeValid] = useState(null);
  const [pincodeChecking, setPincodeChecking] = useState(false);

  // Load user details on mount
  useEffect(() => {
    const loadUserDetails = async () => {
      if (isAuthenticated && user) {
        setUserId(user.user_id);
        setForm((prev) => ({
          ...prev,
          name: user.name || prev.name,
          email: user.email || prev.email,
          phone: user.phone || prev.phone,
        }));
      } else {
        // Try to check auth again
        const authUser = await checkAuthViaCookies();
        if (authUser) {
          setUserId(authUser.user_id);
          setForm((prev) => ({
            ...prev,
            name: authUser.name || prev.name,
            email: authUser.email || prev.email,
            phone: authUser.phone || prev.phone,
          }));
        }
      }
    };
    loadUserDetails();
  }, [isAuthenticated, user, checkAuthViaCookies]);

  // Cart empty check
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

  // Validate form
  function validateForm() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.phone.trim() || form.phone.length < 10) errs.phone = "Valid 10-digit phone number required";
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) errs.email = "Valid email required";
    if (!form.address.trim()) errs.address = "Address is required";
    if (!form.city.trim()) errs.city = "City is required";
    if (!form.state.trim()) errs.state = "State is required";
    if (!form.pincode.trim() || !/^\d{6}$/.test(form.pincode)) errs.pincode = "Valid 6-digit pincode required";
    return errs;
  }

  // Handle form change
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  // Validate pincode
  async function handlePincodeBlur() {
    if (!form.pincode || !/^\d{6}$/.test(form.pincode)) return;

    setPincodeChecking(true);
    try {
      // Call your pincode validation API
      const res = await fetch(`https://api.agtechscript.in/api/pincode/${form.pincode}`);
      const data = await res.json();
      if (data.valid) {
        setPincodeValid(true);
        if (!form.city) setForm((prev) => ({ ...prev, city: data.city || "" }));
        if (!form.state) setForm((prev) => ({ ...prev, state: data.state || "" }));
      } else {
        setPincodeValid(false);
        setErrors((prev) => ({ ...prev, pincode: "Delivery not available at this pincode" }));
      }
    } catch (err) {
      setPincodeValid(null);
    } finally {
      setPincodeChecking(false);
    }
  }

  // Validate coupon
  async function applyCoupon() {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setCouponLoading(true);
    setCouponError("");
    setCouponApplied(null);

    try {
      const res = await fetch(`${COUPON_API}?code=${encodeURIComponent(couponCode)}&subtotal=${subtotal}`);
      const data = await res.json();

      if (data.valid) {
        setCouponApplied({
          code: couponCode,
          type: data.type, // 'percentage' or 'fixed'
          value: data.value,
          discountAmount: data.discountAmount,
        });
        toast.success(`Coupon applied! You saved ${formatPrice(data.discountAmount)}`);
      } else {
        setCouponError(data.message || "Invalid coupon code");
      }
    } catch (err) {
      setCouponError("Failed to validate coupon. Please try again.");
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCoupon() {
    setCouponApplied(null);
    setCouponCode("");
    setCouponError("");
  }

  // Calculate final total with coupon
  const finalTotal = couponApplied
    ? total - (couponApplied.discountAmount || 0)
    : total;
  const finalDiscount = discount + (couponApplied?.discountAmount || 0);

// In CheckoutPage.jsx - Update createOrderAPI function
async function createOrderAPI(paymentMethod, paymentId = null) {
  const orderItems = cart.map(({ product, quantity }) => ({
    product: {
      id: product.product_id || product.id,
      title: product.title,
      thumbnail: product.thumbnail,
      price: product.price,
      discountPercentage: product.discountPercentage || 0,
    },
    quantity,
    total: discountedPrice(product.price, product.discountPercentage) * quantity,
  }));

  const orderPayload = {
    items: orderItems,
    shippingAddress: {
      name: form.name,
      phone: form.phone,
      email: form.email,
      address: form.address,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
      landmark: form.landmark,
    },
    subtotal,
    discountAmount: finalDiscount,
    totalAmount: finalTotal,
    couponCode: couponApplied?.code || null,
    paymentMethod,
    paymentId,
    // Don't send userId - backend will detect from cookies
  };

  console.log("Sending order:", orderPayload); // Debug log

  const response = await fetch('https://store.agtechscript.in/api/orders', {
    method: "POST",
    credentials: "include",  // Important: sends cookies
    headers: { 
      "Content-Type": "application/json",
      "X-Client-Host": window.location.hostname
    },
    body: JSON.stringify(orderPayload)
  });

  const data = await response.json();
  console.log("Order response:", data); // Debug log
  
  if (!response.ok) {
    throw new Error(data.error || "Order creation failed");
  }
  
  return data;
}

  // Handle COD order
  async function handleCODOrder() {
    setLoading(true);
    try {
      const result = await createOrderAPI("cod");

      if (result.success) {
        // Clear cart and save order
        clearCart();
        setOrderData({
          orderId: result.order.orderId,
          total: result.order.totalAmount,
          ...form,
        });
        setPlaced(true);
        toast.success("Order placed successfully!");
      } else {
        toast.error(result.error || "Failed to place order");
      }
    } catch (err) {
      console.error("Order error:", err);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Handle Razorpay payment
  async function handleRazorpayPayment() {
    setPaymentProcessing(true);

    try {
      // Step 1: Create order in backend and get Razorpay order ID
      const orderResponse = await fetch("https://store.agtechscript.in/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalTotal,
          currency: "INR",
          receipt: `order_${Date.now()}`,
          notes: {
            userId: userId || "guest",
            coupon: couponApplied?.code || null,
          },
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.error || "Failed to create payment order");
      }

      // Step 2: Load Razorpay SDK and open payment modal
      await loadRazorpayScript();

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "AG TechScript Store",
        description: `Order #${orderData.orderId}`,
        order_id: orderData.razorpayOrderId,
        handler: async (response) => {
          // Step 3: Verify payment and create order
          const verifyResult = await fetch("https://store.agtechscript.in/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              orderData: {
                items: cart.map(({ product, quantity }) => ({
                  product: {
                    id: product.product_id || product.id,
                    title: product.title,
                    thumbnail: product.thumbnail,
                    price: product.price,
                    discountPercentage: product.discountPercentage || 0,
                  },
                  quantity,
                  total: discountedPrice(product.price, product.discountPercentage) * quantity,
                })),
                shippingAddress: form,
                subtotal,
                discountAmount: finalDiscount,
                totalAmount: finalTotal,
                couponCode: couponApplied?.code || null,
                userId,
              },
            }),
          });

          const verifyData = await verifyResult.json();

          if (verifyData.success) {
            clearCart();
            setOrderData({
              orderId: verifyData.order.orderId,
              total: verifyData.order.totalAmount,
              ...form,
            });
            setPlaced(true);
            toast.success("Payment successful! Order placed.");
          } else {
            toast.error(verifyData.error || "Payment verification failed");
          }
          setPaymentProcessing(false);
        },
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        theme: {
          color: "#0047ff",
        },
        modal: {
          ondismiss: () => {
            setPaymentProcessing(false);
            toast.info("Payment cancelled");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("Razorpay error:", err);
      toast.error(err.message || "Payment initialization failed");
      setPaymentProcessing(false);
    }
  }

  // Load Razorpay SDK
  function loadRazorpayScript() {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  // Handle order placement based on payment method
  async function handlePlaceOrder(e) {
    e.preventDefault();

    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error("Please fill all required fields");
      return;
    }

    if (!pincodeValid && pincodeValid !== null) {
      toast.error("Delivery not available at this pincode");
      return;
    }

    if (selectedPayment === "cod") {
      await handleCODOrder();
    } else if (selectedPayment === "razorpay" || selectedPayment === "card" || selectedPayment === "upi") {
      await handleRazorpayPayment();
    }
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
          <p className="text-gray-500 mt-1">
            Order ID: <span className="font-bold text-primary-600">{orderData?.orderId}</span>
          </p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-5 max-w-sm w-full text-left space-y-2">
          <p className="text-sm text-gray-600"><span className="font-semibold">Name:</span> {orderData?.name}</p>
          <p className="text-sm text-gray-600"><span className="font-semibold">Phone:</span> {orderData?.phone}</p>
          <p className="text-sm text-gray-600"><span className="font-semibold">Address:</span> {orderData?.address}, {orderData?.city}, {orderData?.state} - {orderData?.pincode}</p>
          <p className="text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
            Total Paid: {formatPrice(orderData?.total)}
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
        {/* Form Section */}
        <form onSubmit={handlePlaceOrder} className="lg:col-span-2 space-y-5">
          {/* Delivery Address */}
          <div className="bg-white rounded-2xl shadow-card p-5">
            <h2 className="font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
              Delivery Address
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Full Name*" name="name" value={form.name} onChange={handleChange} error={errors.name} />
              <Field label="Phone Number*" name="phone" value={form.phone} onChange={handleChange} error={errors.phone} type="tel" />
              <Field label="Email" name="email" value={form.email} onChange={handleChange} error={errors.email} type="email" className="sm:col-span-2" />
              <Field label="Address*" name="address" value={form.address} onChange={handleChange} error={errors.address} className="sm:col-span-2" />
              <Field label="Landmark" name="landmark" value={form.landmark} onChange={handleChange} className="sm:col-span-2" />
              <Field label="City*" name="city" value={form.city} onChange={handleChange} error={errors.city} />
              <Field label="State*" name="state" value={form.state} onChange={handleChange} error={errors.state} />
              <div>
                <Field
                  label="Pincode*"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  onBlur={handlePincodeBlur}
                  error={errors.pincode}
                  maxLength={6}
                />
                {pincodeChecking && <p className="text-xs text-gray-400 mt-1">Checking...</p>}
                {pincodeValid === true && !errors.pincode && (
                  <p className="text-xs text-emerald-600 mt-1">✓ Delivery available</p>
                )}
              </div>
            </div>
          </div>

          {/* Coupon Section */}
          <div className="bg-white rounded-2xl shadow-card p-5">
            <h2 className="font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
              Have a Coupon?
            </h2>

            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                disabled={!!couponApplied}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 disabled:bg-gray-100"
              />
              {!couponApplied ? (
                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={couponLoading}
                  className="px-5 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50"
                >
                  {couponLoading ? "Applying..." : "Apply"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-300 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
            {couponError && <p className="text-red-500 text-xs mt-2">{couponError}</p>}
            {couponApplied && (
              <div className="mt-3 bg-emerald-50 rounded-xl p-3 border border-emerald-200">
                <p className="text-sm font-semibold text-emerald-700">
                  ✓ Coupon "{couponApplied.code}" applied!
                </p>
                <p className="text-xs text-emerald-600">
                  You saved {formatPrice(couponApplied.discountAmount)}
                </p>
              </div>
            )}
          </div>

          {/* Payment Section */}
          <div className="bg-white rounded-2xl shadow-card p-5">
            <h2 className="font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
              Payment Method
            </h2>

            <div className="space-y-3">
              {Object.values(PAYMENT_METHODS).map((method) => (
                <div
                  key={method.id}
                  onClick={() => setSelectedPayment(method.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedPayment === method.id
                      ? `${method.bgColor} ${method.borderColor} border-opacity-100`
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-2xl">
                    {method.icon}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${method.textColor}`}>{method.name}</p>
                    <p className="text-xs text-gray-500">{method.description}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 ${
                    selectedPayment === method.id
                      ? `${method.accentColor} border-transparent`
                      : "border-gray-300"
                  } flex items-center justify-center`}>
                    {selectedPayment === method.id && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || paymentProcessing}
            className="w-full py-4 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 active:scale-[0.98] transition-all disabled:opacity-70 text-base flex items-center justify-center gap-2"
          >
            {loading || paymentProcessing ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {paymentProcessing ? "Redirecting to Payment..." : "Placing Order..."}
              </>
            ) : (
              `Place Order — ${formatPrice(finalTotal)}`
            )}
          </button>
        </form>

        {/* Order Summary */}
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
              {couponApplied && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Coupon Discount</span>
                  <span>−{formatPrice(couponApplied.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery</span>
                <span className="text-emerald-600 font-medium">FREE</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="font-display">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            {finalDiscount > 0 && (
              <div className="mt-3 bg-emerald-50 rounded-xl p-2.5 text-center">
                <p className="text-xs text-emerald-700 font-semibold">
                  🎉 You save {formatPrice(finalDiscount)} on this order!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Field Component
function Field({ label, name, value, onChange, onBlur, error, type = "text", className = "", maxLength }) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
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