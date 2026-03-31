// Frontend constants — mirrors /shared/types.js for Vite compatibility

export const CATEGORIES = [
  "smartphones", "laptops", "fragrances", "skincare", "groceries",
  "home-decoration", "furniture", "tops", "womens-dresses", "womens-shoes",
  "mens-shirts", "mens-shoes", "mens-watches", "womens-watches",
  "womens-bags", "womens-jewellery", "sunglasses", "automotive", "motorcycle", "lighting",
];

export const CATEGORY_LABELS = {
  smartphones: "Smartphones", laptops: "Laptops", fragrances: "Fragrances",
  skincare: "Skincare", groceries: "Groceries", "home-decoration": "Home Decor",
  furniture: "Furniture", tops: "Tops", "womens-dresses": "Women's Dresses",
  "womens-shoes": "Women's Shoes", "mens-shirts": "Men's Shirts",
  "mens-shoes": "Men's Shoes", "mens-watches": "Men's Watches",
  "womens-watches": "Women's Watches", "womens-bags": "Women's Bags",
  "womens-jewellery": "Women's Jewellery", sunglasses: "Sunglasses",
  automotive: "Automotive", motorcycle: "Motorcycle", lighting: "Lighting",
};

export const SORT_OPTIONS = [
  { value: "default", label: "Relevance" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating-desc", label: "Top Rated" },
  { value: "discount-desc", label: "Biggest Discount" },
];
