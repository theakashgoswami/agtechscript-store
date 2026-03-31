import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { debounce } from "../utils/format";
import CartDrawer from "./CartDrawer";

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
  sunglasses:       "🕶️ Sunglasses",
  automotive:       "🚗 Automotive",
};

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);
  const categoryRef = useRef(null);

  const { itemCount } = useCart();
  const { user, isAuthenticated, logout, requireAuth, refreshAuth } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  // ── Check auth when returning from main site ─────────────────
  useEffect(() => {
    // Check if we came back from login
    const returnUrl = sessionStorage.getItem("returnAfterLogin");
    if (returnUrl) {
      sessionStorage.removeItem("returnAfterLogin");
      refreshAuth();
    }
  }, [refreshAuth]);

  // ── Sync search bar with URL ─────────────────────────────────
  useEffect(() => {
    const q = new URLSearchParams(location.search).get("q") || "";
    setSearchQuery(q);
  }, [location.search]);

  // ── Close dropdowns on outside click ─────────────────────────
  useEffect(() => {
    function handleClick(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(e.target)) {
        setCategoryOpen(false);
      }
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

  // ── User actions ─────────────────────────────────────────────
  function handleUserClick() {
    if (isAuthenticated) {
      setUserMenuOpen((v) => !v);
    } else {
      // Store return URL in sessionStorage (clears after session)
      sessionStorage.setItem("returnAfterLogin", window.location.href);
      window.location.href = "https://agtechscript.in#login";
    }
  }

  function handleOrders() {
    if (requireAuth()) {
      navigate("/orders");
    }
    setUserMenuOpen(false);
  }

  function handleProfile() {
    if (requireAuth()) {
      window.location.href = "https://account.agtechscript.in";
    }
    setUserMenuOpen(false);
  }

  function handleLogout() {
    logout();
    setUserMenuOpen(false);
  }

  return (
    <>
      <header className={`ag-header ${isScrolled ? "ag-header-hidden" : ""}`}>
        <div className="ag-shine-effect"></div>
        
        <div className="ag-header-inner">
          {/* Logo Section */}
          <div className="ag-logo-section">
            <div  className="ag-logo-link">
              <img
                src="https://cdn.agtechscript.in/AGTechScript.webp"
                alt="AG TechScript"
                className="ag-logo-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/60x60/0047ff/white?text=AG";
                }}
              />
             </div>
              <a className="ag-logo-text" href="https://agtechscript.in" target="_blank" rel="noopener noreferrer">
                AG TechScript
              </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="ag-hamburger"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>

          {/* Navigation */}
          <nav className={`ag-nav ${mobileMenuOpen ? "ag-nav-open" : ""}`}>
            <NavLink to="/" onClick={() => setMobileMenuOpen(false)}>
              <HomeIcon /> Home
            </NavLink>

            {/* Categories Dropdown */}
            <div className="ag-dropdown" ref={categoryRef}>
              <button 
                className="ag-dropdown-trigger"
                onClick={() => setCategoryOpen(!categoryOpen)}
              >
                <GridIcon /> Categories ▾
              </button>
              <div className={`ag-dropdown-menu ${categoryOpen ? "show" : ""}`}>
                {Object.entries(CATEGORIES_LABELS).map(([slug, label]) => (
                  <Link
                    key={slug}
                    to={`/category/${slug}`}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setCategoryOpen(false);
                    }}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="ag-search-form">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                placeholder="Search products..."
                className="ag-search-input"
              />
              <button type="submit" className="ag-search-btn">
                <SearchIcon />
              </button>
            </form>

            {/* User Menu */}
            <div className="ag-user-wrapper" ref={userMenuRef}>
              <button onClick={handleUserClick} className="ag-user-btn">
                {isAuthenticated && user?.profile_image ? (
                  <img src={user.profile_image} alt={user?.name} className="ag-user-avatar" />
                ) : (
                  <UserIcon />
                )}
              </button>

              {userMenuOpen && isAuthenticated && (
                <div className="ag-user-dropdown">
                  <div className="ag-user-info">
                    <div className="ag-user-name">{user?.name || user?.user_id || "User"}</div>
                    <div className="ag-user-email">{user?.email || user?.user_id}</div>
                  </div>
                  <DropBtn onClick={handleOrders} icon={<OrderIcon />} label="My Orders" />
                  <DropBtn onClick={handleProfile} icon={<ProfileIcon />} label="My Account" />
                  <DropBtn onClick={handleLogout} icon={<LogoutIcon />} label="Sign Out" danger />
                </div>
              )}
            </div>

            {/* Cart Button */}
            <button onClick={() => setCartOpen(true)} className="ag-cart-btn">
              <CartIcon />
              Cart
              {itemCount > 0 && (
                <span className="ag-cart-badge">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      <div className="ag-header-spacer"></div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

// Sub-components
function NavLink({ to, children, onClick }) {
  return (
    <Link to={to} onClick={onClick} className="ag-nav-link">
      {children}
    </Link>
  );
}

function DropBtn({ onClick, icon, label, danger }) {
  return (
    <button onClick={onClick} className={`ag-dropdown-item ${danger ? "danger" : ""}`}>
      {icon} {label}
    </button>
  );
}

// Icons
const HomeIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-5v-8H7v8H5a2 2 0 0 1-2-2z" /></svg>);
const GridIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>);
const SearchIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>);
const CartIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>);
const UserIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const OrderIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>);
const ProfileIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M5 20v-2a7 7 0 0 1 14 0v2"/></svg>);
const LogoutIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>);