import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { debounce } from "../utils/format";
import CartDrawer from "./CartDrawer";
import { CATEGORY_LABELS } from "../utils/constants.js";

// Condensed category list for dropdown
const CATEGORIES_LABELS = {
  smartphones:      "📱 Smartphones",
  skincare:         "✨ Skincare",
  fragrances:       "🌸 Fragrances",
  groceries:        "🛒 Groceries",
  furniture:        "🛋️ Furniture", 
  "home-decoration":"🏠 Home Decor",
  "mens-shirts":    "👔 Men's Shirts",
  "mens-shoes":     "👟 Men's Shoes",
  "womens-dresses": "👗 Women's Dresses",
  "womens-shoes":   "👠 Women's Shoes",
  smartphones:      "📱 Smartphones",
  sunglasses:       "🕶️ Sunglasses",
  automotive:       "🚗 Automotive",
};

export default function Header() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const headerRef = useRef(null);
  const userMenuRef = useRef(null);

  const { itemCount }                                      = useCart();
  const { user, isAuthenticated, logout, requireAuth,
          checkAuthViaCookies }                            = useAuth();

  const [searchQuery,    setSearchQuery]    = useState("");
  const [cartOpen,       setCartOpen]       = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen,   setUserMenuOpen]   = useState(false);
  const [isScrolled,     setIsScrolled]     = useState(false);

  // ── On mount: return-after-login check ──────────────────────
  useEffect(() => {
    const returnUrl = localStorage.getItem("returnAfterLogin");
    if (returnUrl && !isAuthenticated) {
      checkAuthViaCookies().then((authUser) => {
        if (authUser) localStorage.removeItem("returnAfterLogin");
      });
    } else if (returnUrl && isAuthenticated) {
      localStorage.removeItem("returnAfterLogin");
    }
  }, [isAuthenticated, checkAuthViaCookies]);

  // ── Sync search bar with URL ─────────────────────────────────
  useEffect(() => {
    const q = new URLSearchParams(location.search).get("q") || "";
    setSearchQuery(q);
  }, [location.search]);

  // ── Close dropdown on outside click ─────────────────────────
  useEffect(() => {
    function handleClick(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setUserMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ── Hide header on scroll down ───────────────────────────────
  useEffect(() => {
    let lastScroll = 0;
    function handleScroll() {
      const cur = window.scrollY;
      setIsScrolled(cur > lastScroll && cur > 100);
      lastScroll = cur;
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Search ───────────────────────────────────────────────────
  const handleSearch = debounce((q) => {
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  }, 400);

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (searchQuery.trim())
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  }

  // ── User icon click ──────────────────────────────────────────
  function handleUserClick() {
    if (isAuthenticated) {
      setUserMenuOpen((v) => !v);
    } else {
      localStorage.setItem("returnAfterLogin", window.location.href);
      window.location.href = "https://agtechscript.in#login";
    }
  }

  function handleOrders() {
    if (requireAuth()) navigate("/orders");
    setUserMenuOpen(false);
  }

  function handleLogout() {
    logout();
    setUserMenuOpen(false);
  }

  return (
    <>
      {/* ═══ HEADER ═══════════════════════════════════════════════ */}
      <header
        ref={headerRef}
        style={{
          background:    "linear-gradient(135deg,#0a0f2c,#081b61,#0047ff)",
          position:      "fixed",
          top:           0,
          left:          0,
          width:         "100%",
          zIndex:        9999,
          padding:       "12px 0",
          borderRadius:  "0 0 18px 18px",
          boxShadow:     "0 4px 20px rgba(0,0,0,0.4)",
          transition:    "transform 0.3s",
          transform:     isScrolled ? "translateY(-100%)" : "translateY(0)",
          overflow:      "hidden",
        }}
      >
        {/* Shine effect */}
        <div style={{
          position:"absolute", top:0, left:"-100%",
          width:"200%", height:"100%", pointerEvents:"none",
          background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent)",
          animation:"glassShine 8s linear infinite",
        }} />

        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 20px",
                      display:"flex", alignItems:"center", justifyContent:"space-between",
                      position:"relative", zIndex:1 }}>

          {/* ── Logo + Title ── */}
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <Link to="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
              <img
                src="https://cdn.agtechscript.in/AGTechScript.webp"
                alt="AG TechScript"
                style={{ height:42, borderRadius:8, transition:"transform 0.3s" }}
                onError={(e) => { e.target.src = "https://placehold.co/60x60/0047ff/white?text=AG"; }}
                onMouseOver={(e) => { e.target.style.transform = "scale(1.05)"; }}
                onMouseOut={(e)  => { e.target.style.transform = "scale(1)"; }}
              />
              <span style={{
                fontSize:"1.4rem", fontWeight:700, color:"#fff",
                textShadow:"0 0 10px rgba(0,230,255,0.5)",
                fontFamily:"system-ui,sans-serif",
              }}>
                AG TechScript
              </span>
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display:"none", background:"rgba(255,255,255,0.1)", border:"none",
                color:"#fff", fontSize:"1.5rem", cursor:"pointer",
                borderRadius:8, padding:"6px 10px",
              }}
              className="ag-hamburger"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>

          {/* ── Nav ── */}
          <nav style={{ display:"flex", alignItems:"center", gap:4 }}
            className={`ag-nav${mobileMenuOpen ? " ag-nav-open" : ""}`}>

            {/* Home */}
            <NavLink to="/" onClick={() => setMobileMenuOpen(false)}>
              <HomeIcon /> Home
            </NavLink>

            {/* Categories dropdown */}
            <div className="ag-dropdown-wrap" style={{ position:"relative" }}>
              <NavLink as="button">
                <GridIcon /> Categories ▾
              </NavLink>
              <div className="ag-dropdown-menu">
                {Object.entries(CATEGORIES_LABELS).map(([slug, label]) => (
                  <Link key={slug} to={`/category/${slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ display:"block", padding:"10px 16px", color:"#fff",
                             textDecoration:"none", fontSize:14, transition:"background 0.2s",
                             whiteSpace:"nowrap" }}
                    onMouseOver={(e) => { e.currentTarget.style.background = "rgba(0,230,255,0.15)"; }}
                    onMouseOut={(e)  => { e.currentTarget.style.background = "transparent"; }}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Search */}
            <form onSubmit={handleSearchSubmit}
              style={{ display:"flex", alignItems:"center", background:"rgba(255,255,255,0.1)",
                       border:"1px solid rgba(255,255,255,0.2)", borderRadius:30,
                       overflow:"hidden", backdropFilter:"blur(8px)" }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); handleSearch(e.target.value); }}
                placeholder="Search products..."
                style={{
                  background:"transparent", border:"none", outline:"none",
                  color:"#fff", padding:"9px 14px", fontSize:14, width:180,
                }}
              />
              <button type="submit"
                style={{ background:"rgba(0,230,255,0.2)", border:"none", cursor:"pointer",
                         color:"#00e6ff", padding:"9px 14px", display:"flex", alignItems:"center" }}>
                <SearchIcon />
              </button>
            </form>

            {/* User icon */}
            <div style={{ position:"relative" }} ref={userMenuRef}>
              <button onClick={handleUserClick}
                style={{
                  background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)",
                  borderRadius:"50%", width:40, height:40, cursor:"pointer",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  transition:"all 0.3s", overflow:"hidden", padding:0,
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; }}
                onMouseOut={(e)  => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
                title={isAuthenticated ? user?.name : "Login"}
              >
                {isAuthenticated && user?.profile_image ? (
                  <img src={user.profile_image} alt={user?.name}
                    style={{ width:"100%", height:"100%", objectFit:"cover",
                             border:"2px solid #00e6ff", borderRadius:"50%",
                             boxShadow:"0 0 10px rgba(0,230,255,0.4)" }} />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="#fff" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                )}
              </button>

              {/* Dropdown — only when logged in */}
              {userMenuOpen && isAuthenticated && (
                <div style={{
  position:"absolute", right:0, top:"calc(100% + 8px)",
  minWidth:190, background:"#0d1535",
  border:"1px solid rgba(0,71,255,0.4)", borderRadius:16,
  boxShadow:"0 20px 50px rgba(0,0,0,0.7)",
  overflow:"hidden", animation:"fadeIn 0.2s ease-out", zIndex:99999,
}}>
                  {/* User info */}
                  <div style={{ padding:"14px 16px", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ fontWeight:700, color:"#fff", fontSize:14,
                                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {user?.name || user?.user_id}
                    </div>
                    <div style={{ color:"#00e6ff", fontSize:12, marginTop:2,
                                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {user?.email || user?.user_id}
                    </div>
                  </div>

                  <DropBtn onClick={handleOrders} icon={<OrderIcon />} label="My Orders" />
                  <DropBtn
                    onClick={() => { window.location.href = "https://account.agtechscript.in"; }}
                    icon={<ProfileIcon />} label="My Account"
                  />
                  <DropBtn onClick={handleLogout} icon={<LogoutIcon />}
                    label="Sign Out" danger />
                </div>
              )}
            </div>

            {/* Cart */}
            <button onClick={() => setCartOpen(true)}
              style={{
                position:"relative", background:"rgba(255,255,255,0.1)",
                border:"1px solid rgba(255,255,255,0.2)", borderRadius:30,
                color:"#fff", cursor:"pointer", display:"flex",
                alignItems:"center", gap:6, padding:"8px 16px",
                fontSize:14, fontWeight:500, transition:"all 0.3s",
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; }}
              onMouseOut={(e)  => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}>
              <CartIcon />
              Cart
              {itemCount > 0 && (
                <span style={{
                  position:"absolute", top:-6, right:-6,
                  background:"#00e6ff", color:"#0a0f2c",
                  fontSize:10, fontWeight:800, borderRadius:"50%",
                  width:18, height:18, display:"flex",
                  alignItems:"center", justifyContent:"center",
                  boxShadow:"0 0 8px rgba(0,230,255,0.6)",
                }}>
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* ── Spacer (fixed header ke liye) ── */}
      <div style={{ height: 72 }} />

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* ── Styles ── */}
      <style>{`
        @keyframes glassShine {
          0%   { transform: skewX(-25deg) translateX(-100%); }
          100% { transform: skewX(-25deg) translateX(100%); }
        }
        @keyframes fadeIn {
          from { opacity:0; transform:translateY(-8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        input::placeholder { color: rgba(255,255,255,0.45) !important; }

        /* Dropdown */
        .ag-dropdown-wrap { position:relative; }
      .ag-dropdown-menu {
  display: none;
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  min-width: 220px;
  background: #0d1535 !important;
  border: 1px solid rgba(0,71,255,0.4);
  border-radius: 14px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.7);
  overflow: hidden;
  z-index: 99999 !important;
  max-height: 70vh;
  overflow-y: auto;
}
.ag-dropdown-menu a {
  color: #e0e8ff !important;
  display: block;
  padding: 10px 16px;
  text-decoration: none;
  font-size: 14px;
  transition: background 0.2s;
  white-space: nowrap;
  background: transparent !important;
}
.ag-dropdown-menu a:hover {
  background: rgba(0,230,255,0.15) !important;
  color: #fff !important;
}
.ag-dropdown-wrap:hover .ag-dropdown-menu { display: block; animation: fadeIn 0.2s; }

        /* Mobile */
        @media (max-width: 768px) {
          .ag-hamburger { display: flex !important; }
          .ag-nav {
            display: none !important;
            position: absolute;
            top: 100%;
            left: 0; right: 0;
            background: rgba(8,10,30,0.98);
            padding: 12px 16px 16px;
            flex-direction: column;
            gap: 8px;
            border-top: 1px solid rgba(255,255,255,0.08);
            border-radius: 0 0 18px 18px;
          }
          .ag-nav.ag-nav-open { display: flex !important; }
          .ag-nav form input { width: 100% !important; }
          .ag-nav form { width: 100%; }
          .ag-dropdown-menu { position: static !important; display: none; }
          .ag-dropdown-wrap:hover .ag-dropdown-menu { display: none; }
          .ag-dropdown-wrap.open .ag-dropdown-menu { display: block; }
        }
      `}</style>
    </>
  );
}

/* ── Small sub-components ────────────────────────────────────── */

function NavLink({ to, children, onClick, as: Tag = "div" }) {
  const base = {
    display:"flex", alignItems:"center", gap:6,
    color:"#ffffffcc", textDecoration:"none", fontWeight:500,
    padding:"9px 14px", borderRadius:30, fontSize:14,
    cursor:"pointer", background:"transparent", border:"none",
    transition:"all 0.25s", whiteSpace:"nowrap", fontFamily:"inherit",
  };
  if (to) return (
    <Link to={to} onClick={onClick} style={base}
      onMouseOver={(e) => { e.currentTarget.style.background="rgba(255,255,255,0.12)"; e.currentTarget.style.color="#fff"; }}
      onMouseOut={(e)  => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#ffffffcc"; }}>
      {children}
    </Link>
  );
  return (
    <button style={base}
      onMouseOver={(e) => { e.currentTarget.style.background="rgba(255,255,255,0.12)"; e.currentTarget.style.color="#fff"; }}
      onMouseOut={(e)  => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#ffffffcc"; }}>
      {children}
    </button>
  );
}

function DropBtn({ onClick, icon, label, danger }) {
  return (
    <button onClick={onClick}
      style={{
        width:"100%", display:"flex", alignItems:"center", gap:10,
        padding:"11px 16px", background:"transparent", border:"none",
        color: danger ? "#f87171" : "#e0e8ff", fontSize:14, cursor:"pointer",
        transition:"background 0.2s", fontFamily:"inherit", textAlign:"left",
      }}
      onMouseOver={(e) => { e.currentTarget.style.background = danger ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.08)"; }}
      onMouseOut={(e)  => { e.currentTarget.style.background = "transparent"; }}>
      {icon} {label}
    </button>
  );
}

/* ── Icons ── */
const HomeIcon    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-5v-8H7v8H5a2 2 0 0 1-2-2z"/></svg>;
const GridIcon    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const SearchIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const CartIcon    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
const OrderIcon   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
const ProfileIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M5 20v-2a7 7 0 0 1 14 0v2"/></svg>;
const LogoutIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
