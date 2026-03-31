// utils/api.js
const API_BASE = 'https://store.agtechscript.in/api';

// Remove the quotes - they were causing issues
const WORKER_URL = 'https://store.agtechscript.in';
const DUMMY_BASE = 'https://dummyjson.com';
const USE_WORKER = true;  // Set to true for production

// Simple in-memory cache (5 minutes)
const _cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

function getCached(key) {
  const item = _cache.get(key);
  if (!item) return null;
  if (Date.now() - item.ts > CACHE_TTL) { 
    _cache.delete(key); 
    return null; 
  }
  return item.data;
}

function setCache(key, data) {
  _cache.set(key, { data, ts: Date.now() });
}

async function apiFetch(url, opts = {}) {
  const cached = getCached(url);
  if (cached) return cached;

  try {
    const res = await fetch(url, { 
      credentials: "omit", 
      ...opts 
    });
    
    if (!res.ok) {
      throw new Error(`API error ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    setCache(url, data);
    return data;
  } catch (err) {
    console.error(`Fetch error for ${url}:`, err);
    throw err;
  }
}

// ============================================================
// Products
// ============================================================

export async function getProducts({ limit = 30, skip = 0, sortBy, order, category } = {}) {
  if (USE_WORKER) {
    const p = new URLSearchParams({ limit, skip });
    if (sortBy) { 
      p.set("sortBy", sortBy); 
      p.set("order", order || "asc"); 
    }
    if (category) {
      return apiFetch(`${WORKER_URL}/api/products/category/${encodeURIComponent(category)}?${p}`);
    }
    return apiFetch(`${WORKER_URL}/api/products?${p}`);
  }
  
  // Fallback to dummyjson
  let url = `${DUMMY_BASE}/products?limit=${limit}&skip=${skip}`;
  if (category) {
    url = `${DUMMY_BASE}/products/category/${encodeURIComponent(category)}?limit=${limit}&skip=${skip}`;
  }
  if (sortBy) url += `&sortBy=${sortBy}&order=${order || "asc"}`;
  return apiFetch(url);
}

export async function getProductById(id) {
  if (USE_WORKER) {
    return apiFetch(`${WORKER_URL}/api/products/${id}`);
  }
  return apiFetch(`${DUMMY_BASE}/products/${id}`);
}

export async function searchProducts(q, { limit = 30, skip = 0 } = {}) {
  if (USE_WORKER) {
    return apiFetch(`${WORKER_URL}/api/products/search?q=${encodeURIComponent(q)}&limit=${limit}&skip=${skip}`);
  }
  return apiFetch(`${DUMMY_BASE}/products/search?q=${encodeURIComponent(q)}&limit=${limit}&skip=${skip}`);
}

export async function getProductsByCategory(category, { limit = 30, skip = 0, sortBy, order } = {}) {
  if (USE_WORKER) {
    const p = new URLSearchParams({ limit, skip });
    if (sortBy) { 
      p.set("sortBy", sortBy); 
      p.set("order", order || "asc"); 
    }
    return apiFetch(`${WORKER_URL}/api/products/category/${encodeURIComponent(category)}?${p}`);
  }
  
  let url = `${DUMMY_BASE}/products/category/${encodeURIComponent(category)}?limit=${limit}&skip=${skip}`;
  if (sortBy) url += `&sortBy=${sortBy}&order=${order || "asc"}`;
  return apiFetch(url);
}

export async function getCategories() {
  if (USE_WORKER) {
    return apiFetch(`${WORKER_URL}/api/products/categories`);
  }
  return apiFetch(`${DUMMY_BASE}/products/categories`);
}

// ============================================================
// Cart APIs (to be implemented)
// ============================================================

export async function getCart() {
  const res = await fetch(`${WORKER_URL}/api/cart`, {
    credentials: "include",
    headers: { "X-Client-Host": window.location.hostname }
  });
  return res.json();
}

export async function addToCart(productId, quantity = 1) {
  const res = await fetch(`${WORKER_URL}/api/cart`, {
    method: "POST",
    credentials: "include",
    headers: { 
      "Content-Type": "application/json",
      "X-Client-Host": window.location.hostname
    },
    body: JSON.stringify({ productId, quantity })
  });
  return res.json();
}

export async function updateCartItem(productId, quantity) {
  const res = await fetch(`${WORKER_URL}/api/cart`, {
    method: "PUT",
    credentials: "include",
    headers: { 
      "Content-Type": "application/json",
      "X-Client-Host": window.location.hostname
    },
    body: JSON.stringify({ productId, quantity })
  });
  return res.json();
}

export async function removeFromCart(productId) {
  const res = await fetch(`${WORKER_URL}/api/cart?productId=${productId}`, {
    method: "DELETE",
    credentials: "include",
    headers: { "X-Client-Host": window.location.hostname }
  });
  return res.json();
}

// ============================================================
// Orders APIs
// ============================================================

export async function createOrder(orderData) {
  const res = await fetch(`${WORKER_URL}/api/orders`, {
    method: "POST",
    credentials: "include",
    headers: { 
      "Content-Type": "application/json",
      "X-Client-Host": window.location.hostname
    },
    body: JSON.stringify(orderData)
  });
  return res.json();
}

export async function getUserOrders() {
  const res = await fetch(`${WORKER_URL}/api/orders/my-orders`, {
    credentials: "include",
    headers: { "X-Client-Host": window.location.hostname }
  });
  return res.json();
}

export async function getOrderById(id) {
  const res = await fetch(`${WORKER_URL}/api/orders/${id}`, {
    credentials: "include",
    headers: { "X-Client-Host": window.location.hostname }
  });
  return res.json();
}
// Validate coupon
export async function validateCoupon(code, subtotal) {
  const res = await fetch(`${WORKER_URL}/api/coupons/validate?code=${encodeURIComponent(code)}&subtotal=${subtotal}`);
  return res.json();
}

// Check pincode
export async function checkPincode(pincode) {
  const res = await fetch(`${WORKER_URL}/api/pincode/${pincode}`);
  return res.json();
}
// In worker.js - handleOrders function
export async function handleOrders(sub, request, env, cors) {
  const method = request.method;

  // POST /api/orders - Allow guest checkout
  if (method === "POST" && (sub === "" || sub === "/")) {
    return createOrder(request, env, cors);  // No auth required for COD
  }

  // GET /api/orders/my-orders - Auth required
  if (method === "GET" && sub === "/my-orders") {
    return getUserOrders(request, env, cors);
  }

  const idMatch = sub.match(/^\/(.+)$/);
  if (method === "GET" && idMatch) {
    return getOrderById(idMatch[1], request, env, cors);
  }

  return jsonResponse({ error: "Not found" }, 404, cors);
}

/**
 * Creates a new order.
 * @param {Request} request - The incoming request object.
 * @param {Object} env - Environment bindings.
 * @param {Object} cors - CORS headers.
 * @returns {Promise<Response>} JSON response with the following structure:
 * {
 *   success: boolean,
 *   order: {
 *     orderId: string,
 *     status: string,
 *     totalAmount: number,
 *     createdAt: string (ISO date)
 *   }
 * }
 */
 // Update createOrder function - Make user optional
async function createOrder(request, env, cors) {
  const body = await request.json();
  const match = cookieHeader.match(/session_id=([^;]+)/);
  return match ? match[1] : null;
}

// Update createOrder function - Make user optional
async function createOrder(request, env, cors) {
  const body = await request.json();
  
  // Try to get user from cookies, but don't require it
  let userId = null;
  try {
    const cookies = request.headers.get("Cookie");
    if (cookies) {
      const authRes = await fetch("https://api.agtechscript.in/api/auth/status", {
        headers: { "Cookie": cookies }
      });
      const authData = await authRes.json();
      if (authData.authenticated) {
        userId = authData.user_id;
      }
    }
  } catch (err) {
    console.error("Auth check error:", err);
  }

  const sessionId = getSessionIdFromRequest(request);
  
  const {
    items,
    shippingAddress,
    subtotal,
    discountAmount,
    totalAmount,
    couponCode,
    paymentMethod = 'cod'
  } = body;
    totalAmount,
    couponCode,
    paymentMethod = 'cod'
  } = body;

  const orderId = generateOrderId();

  // Insert order (userId can be null for guest)
  const orderResult = await env.DB.prepare(`
    INSERT INTO orders (
      order_id, user_id, session_id, status, payment_method, payment_status,
      subtotal, discount_amount, shipping_charges, tax_amount, total_amount,
      coupon_code, shipping_name, shipping_phone, shipping_email,
      shipping_address, shipping_city, shipping_state, shipping_pincode, shipping_landmark
    ) VALUES (?, ?, ?, 'confirmed', ?, 'pending', ?, ?, 0, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    orderId, userId, sessionId, paymentMethod,
    subtotal, discountAmount || 0, totalAmount, couponCode || null,
    shippingAddress.name, shippingAddress.phone, shippingAddress.email || null,
    shippingAddress.address, shippingAddress.city || null, shippingAddress.state || null,
    shippingAddress.pincode || null, shippingAddress.landmark || null
  ).run();

  if (!orderResult.meta || typeof orderResult.meta.last_row_id === "undefined") {
    throw new Error("Failed to create order: missing order ID from database result.");
  }
  const orderDbId = orderResult.meta.last_row_id;
    await env.DB.prepare(`
      INSERT INTO order_items (
        order_id, product_id, product_name, product_image,
        quantity, price, discount_percentage, total
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      orderDbId, item.product.id, item.product.title,
      item.product.thumbnail, item.quantity,
      item.product.price, item.product.discountPercentage || 0,
      item.total
    ).run();

    // Check stock before reducing
    const stockRow = await env.DB.prepare(
      "SELECT stock FROM products WHERE product_id = ?"
    ).bind(item.product.id).first();

    if (!stockRow || stockRow.stock < item.quantity) {
      throw new Error(`Insufficient stock for product ${item.product.id}`);
    }

    // Reduce stock
    await env.DB.prepare(`
      UPDATE products SET stock = stock - ? WHERE product_id = ?
    `).bind(item.quantity, item.product.id).run();
    await env.DB.prepare(`
      UPDATE products SET stock = stock - ? WHERE product_id = ?
    `).bind(item.quantity, item.product.id).run();
  }

  // Clear cart if user is logged in
  if (userId) {
    const cart = await env.DB.prepare(
      "SELECT id FROM carts WHERE user_id = ? AND status = 'active'"
    ).bind(userId).first();
    if (cart) {
      await env.DB.prepare("DELETE FROM cart_items WHERE cart_id = ?").bind(cart.id).run();
      await env.DB.prepare("UPDATE carts SET status = 'checked_out' WHERE id = ?").bind(cart.id).run();
    }
  }

  return jsonResponse({
    success: true,
    order: {
      orderId,
      status: 'confirmed',
      totalAmount,
      createdAt: new Date().toISOString()
    }
  }, 201, cors);
}