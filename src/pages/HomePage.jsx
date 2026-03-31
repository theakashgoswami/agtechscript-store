import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../utils/api";
import ProductCard from "../components/ProductCard";
import { ProductGridSkeleton } from "../components/Skeleton";

const HERO_BANNERS = [
  {
    title: "AG Tech Sale",
    subtitle: "Smartphones & Laptops at Unbeatable Prices",
    cta: "Shop Electronics",
    link: "/category/smartphones",
    gradient: "linear-gradient(135deg,#0a0f2c,#081b61,#0047ff)",
    accent: "#00e6ff",
    emoji: "📱",
  },
  {
    title: "Beauty & Skincare",
    subtitle: "Premium skincare products — delivered to you",
    cta: "Shop Skincare",
    link: "/category/skincare",
    gradient: "linear-gradient(135deg,#1a0533,#3d0b6b,#7b2fbf)",
    accent: "#e879f9",
    emoji: "✨",
  },
  {
    title: "Home Makeover",
    subtitle: "Transform your living space with AG Store",
    cta: "Shop Furniture",
    link: "/category/furniture",
    gradient: "linear-gradient(135deg,#0f2027,#203a43,#2c5364)",
    accent: "#38bdf8",
    emoji: "🛋️",
  },
];

const FEATURED_CATEGORIES = [
  { slug: "smartphones",    label: "Phones",     icon: "📱", color: "rgba(0,71,255,0.12)",   text: "#0047ff" },
  { slug: "laptops",        label: "Laptops",     icon: "💻", color: "rgba(0,71,255,0.12)",   text: "#0047ff" },
  { slug: "skincare",       label: "Skincare",    icon: "✨", color: "rgba(180,30,200,0.10)", text: "#9b34d0" },
  { slug: "furniture",      label: "Furniture",   icon: "🛋️", color: "rgba(0,150,100,0.10)",  text: "#007855" },
  { slug: "groceries",      label: "Groceries",   icon: "🛒", color: "rgba(20,160,50,0.10)",  text: "#0a8c2a" },
  { slug: "mens-shirts",    label: "Men",         icon: "👔", color: "rgba(50,50,80,0.10)",   text: "#333355" },
  { slug: "womens-dresses", label: "Women",       icon: "👗", color: "rgba(200,30,100,0.10)", text: "#c01860" },
  { slug: "automotive",     label: "Auto",        icon: "🚗", color: "rgba(100,60,0,0.10)",   text: "#7a4800" },
];

export default function HomePage() {
  const [products,     setProducts]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [page,         setPage]         = useState(0);
  const [hasMore,      setHasMore]      = useState(true);
  const [bannerIndex,  setBannerIndex]  = useState(0);
  const LIMIT = 20;

  useEffect(() => {
    loadProducts(0, true);
    const t = setInterval(() => setBannerIndex(i => (i + 1) % HERO_BANNERS.length), 5000);
    return () => clearInterval(t);
  }, []);

  async function loadProducts(pageNum, replace = false) {
    setLoading(true);
    try {
      const data = await getProducts({ limit: LIMIT, skip: pageNum * LIMIT });
      const items = data.products || data;
      setProducts(prev => replace ? items : [...prev, ...items]);
      setHasMore(items.length === LIMIT);
      setPage(pageNum);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const banner = HERO_BANNERS[bannerIndex];

  return (
    <div className="min-h-screen">

      {/* ── Hero Banner ── */}
      <div className="max-w-7xl mx-auto px-4 pt-5">
        <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden transition-all duration-700"
          style={{ background: banner.gradient }}>
          
          {/* Floating circles */}
          <div className="absolute top-4 right-8 w-32 h-32 rounded-full opacity-10"
            style={{ background: banner.accent, filter: "blur(30px)" }} />
          <div className="absolute bottom-2 right-20 w-20 h-20 rounded-full opacity-10"
            style={{ background: banner.accent, filter: "blur(20px)" }} />

          <div className="absolute inset-0 flex items-center px-8 md:px-12">
            <div className="text-white max-w-lg">
              <p className="text-5xl md:text-6xl mb-2 animate-fade-in">{banner.emoji}</p>
              <h1 className="font-bold text-2xl md:text-3xl leading-tight animate-slide-up"
                style={{ textShadow: `0 0 20px ${banner.accent}66` }}>
                {banner.title}
              </h1>
              <p className="text-sm md:text-base mt-1 mb-4 animate-fade-in"
                style={{ color: `${banner.accent}cc` }}>
                {banner.subtitle}
              </p>
              <Link to={banner.link}
                className="inline-block px-5 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 shadow-lg"
                style={{ background: banner.accent, color: "#0a0f2c" }}>
                {banner.cta} →
              </Link>
            </div>
          </div>

          {/* Dots */}
          <div className="absolute bottom-3 right-4 flex gap-1.5">
            {HERO_BANNERS.map((_, i) => (
              <button key={i} onClick={() => setBannerIndex(i)}
                className="h-1.5 rounded-full transition-all"
                style={{ width: i === bannerIndex ? "16px" : "6px", background: i === bannerIndex ? "#fff" : "rgba(255,255,255,0.4)" }} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Categories ── */}
      <div className="max-w-7xl mx-auto px-4 mt-5">
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {FEATURED_CATEGORIES.map(({ slug, label, icon, color, text }) => (
            <Link key={slug} to={`/category/${slug}`}
              className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-transform hover:scale-105 cursor-pointer"
              style={{ background: color, border: `1px solid ${text}22` }}>
              <span className="text-2xl">{icon}</span>
              <span className="text-[11px] font-semibold text-center leading-none" style={{ color: text }}>
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Trust badges ── */}
      <div className="max-w-7xl mx-auto px-4 mt-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon:"🚚", title:"Free Delivery", desc:"On orders above ₹499",    bg:"rgba(0,71,255,0.06)",  border:"rgba(0,71,255,0.15)" },
            { icon:"↩️", title:"Easy Returns",  desc:"30-day hassle-free returns", bg:"rgba(0,200,100,0.06)", border:"rgba(0,200,100,0.15)" },
            { icon:"🔒", title:"Secure Payments", desc:"100% secure checkout",   bg:"rgba(150,0,255,0.06)", border:"rgba(150,0,255,0.15)" },
          ].map(({ icon, title, desc, bg, border }) => (
            <div key={title}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: bg, border: `1px solid ${border}` }}>
              <span className="text-2xl">{icon}</span>
              <div>
                <p className="text-sm font-bold text-gray-800">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Products ── */}
      <div className="max-w-7xl mx-auto px-4 mt-8 pb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-xl text-gray-800" style={{ fontFamily:"system-ui" }}>
            🔥 Popular Products
          </h2>
          <Link to="/search?q=" className="text-sm font-semibold transition-colors"
            style={{ color:"#0047ff" }}>
            View all →
          </Link>
        </div>

        {loading && products.length === 0 ? (
          <ProductGridSkeleton count={20} />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-8">
                <button onClick={() => loadProducts(page + 1)} disabled={loading}
                  className="px-8 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                  style={{ background:"rgba(0,71,255,0.08)", border:"1px solid rgba(0,71,255,0.2)", color:"#0047ff" }}>
                  {loading ? "Loading…" : "Load More Products"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
