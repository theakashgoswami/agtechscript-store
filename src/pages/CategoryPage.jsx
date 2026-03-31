import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getProductsByCategory } from "../utils/api";
import ProductCard from "../components/ProductCard";
import FilterSidebar from "../components/FilterSidebar";
import { ProductGridSkeleton } from "../components/Skeleton";
import { titleCase } from "../utils/format";

const PAGE_SIZE = 20;

export default function CategoryPage() {
  const { name } = useParams();
  const [allProducts, setAllProducts] = useState([]);
  const [displayed, setDisplayed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({});
  const [brands, setBrands] = useState([]);

  // Load all products for category once
  useEffect(() => {
    setLoading(true);
    setAllProducts([]);
    setPage(0);
    setFilters({});

    getProductsByCategory(name, { limit: 100 })
      .then((data) => {
        const items = data.products || data;
        setAllProducts(items);
        const b = [...new Set(items.map((p) => p.brand))].sort();
        setBrands(b);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [name]);

  // Apply filters whenever allProducts or filters change
  useEffect(() => {
    let filtered = [...allProducts];

    // Brand filter
    if (filters.brands?.length > 0) {
      filtered = filtered.filter((p) => filters.brands.includes(p.brand));
    }

    // Price filter
    if (filters.priceMin != null) {
      filtered = filtered.filter((p) => p.price >= filters.priceMin);
    }
    if (filters.priceMax != null) {
      filtered = filtered.filter((p) => p.price <= filters.priceMax);
    }

    // Availability
    if (filters.inStock === true) {
      filtered = filtered.filter((p) => p.stock > 0);
    }

    // Sort
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        const dir = filters.order === "desc" ? -1 : 1;
        if (filters.sortBy === "price") return (a.price - b.price) * dir;
        if (filters.sortBy === "rating") return (a.rating - b.rating) * dir;
        if (filters.sortBy === "discount") return (a.discountPercentage - b.discountPercentage) * dir;
        return 0;
      });
    }

    setDisplayed(filtered.slice(0, (page + 1) * PAGE_SIZE));
  }, [allProducts, filters, page]);

  const hasMore = displayed.length < allProducts.filter(p => {
    if (filters.brands?.length > 0 && !filters.brands.includes(p.brand)) return false;
    if (filters.priceMin != null && p.price < filters.priceMin) return false;
    if (filters.priceMax != null && p.price > filters.priceMax) return false;
    if (filters.inStock === true && p.stock <= 0) return false;
    return true;
  }).length;

  const maxPrice = allProducts.length ? Math.ceil(Math.max(...allProducts.map(p => p.price))) : 2000;
  const minPrice = allProducts.length ? Math.floor(Math.min(...allProducts.map(p => p.price))) : 0;

  function handleFiltersChange(newFilters) {
    setFilters(newFilters);
    setPage(0);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-12">
      {/* Page title */}
      <div className="mb-5">
        <h1 className="font-display font-bold text-2xl text-gray-900">
          {titleCase(name.replace(/-/g, " "))}
        </h1>
        {!loading && (
          <p className="text-sm text-gray-500 mt-0.5">
            {allProducts.length} products found
          </p>
        )}
      </div>

      <div className="flex gap-5">
        {/* Sidebar */}
        <FilterSidebar
          filters={filters}
          onChange={handleFiltersChange}
          brands={brands}
          minPrice={minPrice}
          maxPrice={maxPrice}
        />

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <ProductGridSkeleton count={12} />
          ) : displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <span className="text-5xl">🔍</span>
              <h3 className="font-display font-bold text-lg text-gray-700">No products match your filters</h3>
              <p className="text-sm text-gray-400">Try adjusting your filters or clearing them</p>
              <button
                onClick={() => { setFilters({}); setPage(0); }}
                className="px-5 py-2 bg-primary-500 text-white rounded-xl text-sm font-semibold hover:bg-primary-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {displayed.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setPage(page + 1)}
                    className="px-8 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-primary-300 hover:text-primary-600 transition-all text-sm shadow-sm"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
