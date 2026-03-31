/**
 * Format a price number to INR currency string
 */
export function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price * 83); // Convert USD to INR approx
}

/**
 * Format a price in USD
 */
export function formatUSD(price) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Calculate discounted price
 */
export function discountedPrice(price, discountPercentage) {
  if (!discountPercentage) return price;
  return price - (price * discountPercentage) / 100;
}

/**
 * Format discount badge text
 */
export function formatDiscount(discountPercentage) {
  if (!discountPercentage) return null;
  return `${Math.round(discountPercentage)}% off`;
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
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Generate star rating array for rendering
 */
export function getStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return { full, half, empty };
}

/**
 * Format a date string
 */
export function formatDate(dateStr) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));
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
