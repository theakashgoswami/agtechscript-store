/**
 * Format a price number to INR currency string
 * Database stores price in INR (rupees) already
 */
export function formatPrice(price) {
  // Convert to number if string
  const numPrice = Number(price);
  
  if (isNaN(numPrice)) {
    console.error('Invalid price:', price);
    return '₹0';
  }
  
  // 🔥 REMOVE the * 83 - price is already in INR
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(numPrice);
}

/**
 * Format a price in USD (if needed)
 */
export function formatUSD(price) {
  const numPrice = Number(price);
  if (isNaN(numPrice)) return '$0';
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(numPrice);
}

/**
 * Calculate discounted price
 */
export function discountedPrice(price, discountPercentage) {
  const numPrice = Number(price);
  const numDiscount = Number(discountPercentage) || 0;
  
  if (isNaN(numPrice)) return 0;
  if (!numDiscount) return numPrice;
  
  return numPrice - (numPrice * numDiscount) / 100;
}

/**
 * Format discount badge text
 */
export function formatDiscount(discountPercentage) {
  const numDiscount = Number(discountPercentage) || 0;
  if (!numDiscount) return null;
  return `${Math.round(numDiscount)}% off`;
}

/**
 * Truncate text to a given length
 */
export function truncate(text, maxLength = 100) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "…";
}

/**
 * Slugify a string for URLs
 */
export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
}

/**
 * Capitalize first letter of each word
 */
export function titleCase(text) {
  if (!text) return "";
  return text
    .split(/[-_\s]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Generate star rating array for rendering
 */
export function getStars(rating) {
  const numRating = Number(rating) || 0;
  const full = Math.floor(numRating);
  const half = numRating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return { full, half, empty };
}

/**
 * Format a date string
 */
export function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * Debounce a function
 */
export function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}