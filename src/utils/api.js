// utils/api.js
const API_BASE = 'https://store.agtechscript.in/api';
const WORKER_URL = 'https://store.agtechscript.in';
const DUMMY_BASE = 'https://dummyjson.com';
const USE_WORKER = true;

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
// Cart APIs
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

// ============================================================
// Coupon APIs
// ============================================================

export async function validateCoupon(code, subtotal) {
  const res = await fetch(`${WORKER_URL}/api/coupons/validate?code=${encodeURIComponent(code)}&subtotal=${subtotal}`, {
    credentials: "include",
    headers: { "X-Client-Host": window.location.hostname }
  });
  return res.json();
}

// ============================================================
// Pincode APIs
// ============================================================

export async function checkPincode(pincode) {
  const res = await fetch(`${WORKER_URL}/api/pincode/${pincode}`, {
    credentials: "include",
    headers: { "X-Client-Host": window.location.hostname }
  });
  return res.json();
}