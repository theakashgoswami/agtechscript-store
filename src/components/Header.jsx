import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { debounce } from "../utils/format";
import CartDrawer from "./CartDrawer";

const NAV_LINKS = [
  { label: "All",        to: "/",                     icon: "🏠" },
  { label: "Phones",     to: "/category/smartphones",  icon: "📱" },
  { label: "Laptops",    to: "/category/laptops",       icon: "💻" },
  { label: "Skincare",   to: "/category/skincare",      icon: "✨" },
  { label: "Furniture",  to: "/category/furniture",     icon: "🛋️" },
  { label: "Groceries",  to: "/category/groceries",     icon: "🛒" },
  { label: "Men",        to: "/category/mens-shirts",   icon: "👔" },
  { label: "Women",      to: "/category/womens-dresses",icon: "👗" },
];

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { itemCount } = useCart();
  const { user, logout, isAuthenticated } = useAuth();

  const [searchQuery,    setSearchQuery]    = useState("");
  const [cartOpen,       setCartOpen]       = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen,   setUserMenuOpen]   = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const q = new URLSearchParams(location.search).get("q") || "";
    setSearchQuery(q);
  }, [location.search]);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = debounce((q) => {
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  }, 400);

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (searchQuery.trim())
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  }

  function handleLogout() {
    logout();
    setUserMenuOpen(false);
    navigate("/");
  }

  const glassBg  = "rgba(255,255,255,0.10)";
  const glassBrd = "1px solid rgba(255,255,255,0.18)";

  return (
    <>
      <header
        className="sticky top-0 z-50 overflow-hidden"
        style={{
          background: "linear-gradient(135deg,#0a0f2c,#081b61,#0047ff)",
          borderRadius: "0 0 18px 18px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.45)",
        }}
      >
        {/* Shine overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent)",
            animation: "glassShine 8s linear infinite",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4">
          {/* Top row */}
          <div className="flex items-center gap-3 h-[68px]">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: glassBg, border: glassBrd }}
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="hidden sm:block leading-tight">
                <p className="font-bold text-[17px] text-white" style={{ textShadow: "0 0 10px rgba(0,230,255,0.5)" }}>
                  AG TechScript
                </p>
                <p className="text-[9px] text-cyan-300 tracking-widest font-semibold">STORE</p>
              </div>
            </Link>

            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl mx-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); handleSearch(e.target.value); }}
                  placeholder="Search products, brands…"
                  className="w-full pl-4 pr-11 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60 transition-all"
                  style={{ background: glassBg, border: glassBrd, color: "#fff", backdropFilter: "blur(8px)" }}
                />
                <style>{`.ag-search::placeholder{color:rgba(255,255,255,0.45)}`}</style>
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg"
                  style={{ background: "rgba(0,230,255,0.15)" }}>
                  <svg className="w-4 h-4 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">

              {/* User */}
              <div className="relative" ref={userMenuRef}>
                {isAuthenticated ? (
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all"
                    style={{ background: glassBg, border: glassBrd }}>
                    <img
                      src={user?.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.user_id || "ag"}`}
                      alt={user?.name}
                      className="w-7 h-7 rounded-full"
                      style={{ border: "2px solid #00e6ff", boxShadow: "0 0 10px rgba(0,230,255,0.4)" }}
                    />
                    <span className="hidden md:block text-sm font-medium text-white max-w-[70px] truncate">
                      {user?.name?.split(" ")[0]}
                    </span>
                  </button>
                ) : (
                  <a href="https://account.agtechscript.in"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-sm font-medium transition-all"
                    style={{ background: glassBg, border: glassBrd }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="hidden sm:block">Login</span>
                  </a>
                )}

                {/* Dropdown */}
                {userMenuOpen && isAuthenticated && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl z-50 py-1 animate-fade-in overflow-hidden"
                    style={{
                      background: "rgba(10,15,44,0.97)",
                      border: "1px solid rgba(0,71,255,0.3)",
                      backdropFilter: "blur(20px)",
                      boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                    }}>
                    <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                      <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                      <p className="text-[11px] text-cyan-400 truncate">{user?.user_id}</p>
                    </div>
                    <Link to="/orders" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-blue-200 hover:text-white hover:bg-white/10 transition-colors">
                      📦 My Orders
                    </Link>
                    <a href="https://account.agtechscript.in"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-blue-200 hover:text-white hover:bg-white/10 transition-colors">
                      👤 My Account
                    </a>
                    <button onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                      🚪 Sign Out
                    </button>
                  </div>
                )}
              </div>

              {/* Cart */}
              <button onClick={() => setCartOpen(true)}
                className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-white transition-all"
                style={{ background: glassBg, border: glassBrd }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 text-[10px] font-bold rounded-full flex items-center justify-center"
                    style={{ background: "#00e6ff", color: "#0a0f2c" }}>
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
                <span className="hidden sm:block text-sm font-medium">Cart</span>
              </button>

              {/* Hamburger */}
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden p-2 rounded-xl text-white transition-all"
                style={{ background: glassBg, border: glassBrd }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1 pb-2.5 overflow-x-auto">
            {NAV_LINKS.map(({ label, to, icon }) => (
              <Link key={to} to={to}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  location.pathname === to
                    ? "bg-white/20 text-white shadow-sm"
                    : "text-blue-200 hover:text-white hover:bg-white/10"
                }`}>
                <span>{icon}</span>{label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile nav drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden px-4 pb-4 animate-slide-up"
            style={{ background: "rgba(8,10,30,0.97)", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="grid grid-cols-4 gap-2 pt-3">
              {NAV_LINKS.map(({ label, to, icon }) => (
                <Link key={to} to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-medium text-blue-200 hover:text-white hover:bg-white/10 transition-colors text-center">
                  <span className="text-xl">{icon}</span>
                  <span className="truncate w-full text-center">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Keyframe for shine animation */}
      <style>{`
        @keyframes glassShine {
          0%   { transform: skewX(-25deg) translateX(-100%); }
          100% { transform: skewX(-25deg) translateX(100%); }
        }
      `}</style>
    </>
  );
}
