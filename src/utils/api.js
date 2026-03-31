/**
 * API Utility — products.agtechscript.in
 *
 * Priority:
 *   1. Cloudflare Worker (VITE_API_URL) → reads Google Sheets
 *   2. DummyJSON fallback (for local dev without worker)
 */

const WORKER_URL = import.meta.env.VITE_API_URL || "";
const DUMMY_BASE = "https://dummyjson.com";
const USE_WORKER = !!WORKER_URL;

// Simple in-memory cache (5 minutes)
const _cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

function getCached(key) {
  const item = _cache.get(key);
  if (!item) return null;
  if (Date.now() - item.ts > CACHE_TTL) { _cache.delete(key); return null; }
  return item.data;
}
function setCache(key, data) {
  _cache.set(key, { data, ts: Date.now() });
}

async function apiFetch(url, opts = {}) {
  const cached = getCached(url);
  if (cached) return cached;

  const res = await fetch(url, { credentials: "omit", ...opts });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  setCache(url, data);
  return data;
}

// ============================================================
// Products
// ============================================================

export async function getProducts({ limit = 30, skip = 0, sortBy, order } = {}) {
  if (USE_WORKER) {
    const p = new URLSearchParams({ limit, skip });
    if (sortBy) { p.set("sortBy", sortBy); p.set("order", order || "asc"); }
    return apiFetch(`${WORKER_URL}/api/products?${p}`);
  }
  let url = `${DUMMY_BASE}/products?limit=${limit}&skip=${skip}`;
  if (sortBy) url += `&sortBy=${sortBy}&order=${order || "asc"}`;
  return apiFetch(url);
}

export async function getProductById(id) {
  if (USE_WORKER) return apiFetch(`${WORKER_URL}/api/products/${id}`);
  return apiFetch(`${DUMMY_BASE}/products/${id}`);
}

export async function searchProducts(q, { limit = 30, skip = 0 } = {}) {
  if (USE_WORKER)
    return apiFetch(`${WORKER_URL}/api/products/search?q=${encodeURIComponent(q)}&limit=${limit}&skip=${skip}`);
  return apiFetch(`${DUMMY_BASE}/products/search?q=${encodeURIComponent(q)}&limit=${limit}&skip=${skip}`);
}

export async function getProductsByCategory(category, { limit = 30, skip = 0, sortBy, order } = {}) {
  if (USE_WORKER) {
    const p = new URLSearchParams({ limit, skip });
    if (sortBy) { p.set("sortBy", sortBy); p.set("order", order || "asc"); }
    return apiFetch(`${WORKER_URL}/api/products/category/${encodeURIComponent(category)}?${p}`);
  }
  let url = `${DUMMY_BASE}/products/category/${encodeURIComponent(category)}?limit=${limit}&skip=${skip}`;
  if (sortBy) url += `&sortBy=${sortBy}&order=${order || "asc"}`;
  return apiFetch(url);
}

export async function getCategories() {
  if (USE_WORKER) return apiFetch(`${WORKER_URL}/api/products/categories`);
  return apiFetch(`${DUMMY_BASE}/products/categories`);
}
