import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { searchProducts, getProducts } from "../utils/api";
import ProductCard from "../components/ProductCard";
import FilterSidebar from "../components/FilterSidebar";
import { ProductGridSkeleton } from "../components/Skeleton";

export default function SearchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({});
  const [brands, setBrands] = useState([]);

  const query = new URLSearchParams(location.search).get("q") || "";

  const fetchResults = useCallback(async (q) => {
    setLoading(true);
    try {
      let data;
      if (q.trim()) {
        data = await searchProducts(q, { limit: 100 });
      } else {
        data = await getProducts({ limit: 100 });
      }
      const items = data.products || data;
      setProducts(items);
      setTotal(data.total || items.length);
      const b = [...new Set(items.map((p) => p.brand))].sort();
      setBrands(b);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setFilters({});
    fetchResults(query);
  }, [query, fetchResults]);

  // Apply client-side filters on top of search results
  const filtered = products.filter((p) => {
    if (filters.brands?.length > 0 && !filters.brands.includes(p.brand)) return false;
    if (filters.priceMin != null && p.price < filters.priceMin) return false;
    if (filters.priceMax != null && p.price > filters.priceMax) return false;
    if (filters.inStock === true && p.stock <= 0) return false;
    return true;
  }).sort((a, b) => {
    if (!filters.sortBy) return 0;
    const dir = filters.order === "desc" ? -1 : 1;
    if (filters.sortBy === "price") return (a.price - b.price) * dir;
    if (filters.sortBy === "rating") return (a.rating - b.rating) * dir;
    if (filters.sortBy === "discount") return (a.discountPercentage - b.discountPercentage) * dir;
    return 0;
  });

  const maxPrice = products.length ? Math.ceil(Math.max(...products.map(p => p.price))) : 2000;
  const minPrice = products.length ? Math.floor(Math.min(...products.map(p => p.price))) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-12">
      {/* Title */}
      <div className="mb-5">
        <h1 className="font-display font-bold text-xl text-gray-900">
          {query ? (
            <>Results for <span className="text-primary-600">"{query}"</span></>
          ) : (
            "All Products"
          )}
        </h1>
        {!loading && (
          <p className="text-sm text-gray-500 mt-0.5">
            {filtered.length} products found
          </p>
        )}
      </div>

      <div className="flex gap-5">
        <FilterSidebar
          filters={filters}
          onChange={setFilters}
          brands={brands}
          minPrice={minPrice}
          maxPrice={maxPrice}
        />

        <div className="flex-1 min-w-0">
          {loading ? (
            <ProductGridSkeleton count={12} />
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <span className="text-6xl">🔍</span>
              <div>
                <h3 className="font-display font-bold text-lg text-gray-700">
                  {query ? `No results for "${query}"` : "No products found"}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Try a different search term or browse categories
                </p>
              </div>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-semibold hover:bg-primary-600 transition-colors"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
