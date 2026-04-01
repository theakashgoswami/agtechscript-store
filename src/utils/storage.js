const CART_KEY = "AGTechScript_cart";
const AUTH_KEY = "AGTechScript_auth";
const WISHLIST_KEY = "AGTechScript_wishlist";
const RECENT_KEY = "AGTechScript_recent";

// ===== Cart Storage =====

export function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (e) {
    console.warn("Failed to save cart:", e);
  }
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
}

// ===== Auth Storage =====

export function loadAuth() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAuth(auth) {
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  } catch (e) {
    console.warn("Failed to save auth:", e);
  }
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}

// ===== Wishlist Storage =====

export function loadWishlist() {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveWishlist(wishlist) {
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  } catch (e) {
    console.warn("Failed to save wishlist:", e);
  }
}

// ===== Recently Viewed =====

export function addToRecent(product) {
  try {
    const recent = loadRecent();
    const filtered = recent.filter((p) => p.id !== product.id);
    const updated = [product, ...filtered].slice(0, 10);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Failed to update recent:", e);
  }
}

export function loadRecent() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
