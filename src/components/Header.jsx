import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { debounce } from "../utils/format";
import CartDrawer from "./CartDrawer";

const CATEGORIES_LABELS = {
  smartphones: "📱 Smartphones",
  laptops: "💻 Laptops",
  skincare: "✨ Skincare",
  fragrances: "🌸 Fragrances",
  groceries: "🛒 Groceries",
  furniture: "🛋️ Furniture",
  "home-decoration": "🏠 Home Decor",
  "mens-shirts": "👔 Men's Shirts",
  "mens-shoes": "👟 Men's Shoes",
  "womens-dresses": "👗 Women's Dresses",
  "womens-shoes": "👠 Women's Shoes",
  sunglasses: "🕶️ Sunglasses",
  automotive: "🚗 Automotive",
};

// Main API endpoint for user profile
const MAIN_API = "https://api.agtechscript.in";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);
  const categoryRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const { itemCount } = useCart();
  const { user, isAuthenticated, logout, requireAuth, refreshAuth } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [fullUserProfile, setFullUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Check if mobile view
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 🔥 Fetch full user profile from main API when user is authenticated
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isAuthenticated && user?.user_id) {
        setLoadingProfile(true);
        try {
          const response = await fetch(`${MAIN_API}/api/user/profile?user_id=${user.user_id}`, {
            credentials: "include",
            headers: {
              "X-Client-Host": window.location.hostname
            }
          });
          const data = await response.json();
          if (data.success) {
            setFullUserProfile(data);
          }
        } catch (err) {
          console.error("Failed to fetch user profile:", err);
        } finally {
          setLoadingProfile(false);
        }
      }
    };
    
    fetchUserProfile();
  }, [isAuthenticated, user?.user_id]);

  // ── Close all menus when clicking outside ─────────────────────────
  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(e.target)) {
        setCategoryOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target) && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen]);

  // ── Close mobile menu when navigating ───────────────────────────────
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    setCategoryOpen(false);
  }, [location.pathname]);

  // ── Check auth when returning from main site ───────────────────────
  useEffect(() => {
    const returnUrl = sessionStorage.getItem("returnAfterLogin");
    if (returnUrl) {
      sessionStorage.removeItem("returnAfterLogin");
      if (refreshAuth) refreshAuth();
    }
  }, [refreshAuth]);

  // ── Sync search bar with URL ───────────────────────────────────────
  useEffect(() => {
    const q = new URLSearchParams(location.search).get("q") || "";
    setSearchQuery(q);
  }, [location.search]);

  // ── Hide header on scroll down ─────────────────────────────────────
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

  // ── Search ─────────────────────────────────────────────────────────
  const handleSearch = debounce((q) => {
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  }, 400);

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
    setMobileMenuOpen(false);
  }

  // ── Close all menus helper ─────────────────────────────────────────
  const closeAllMenus = () => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    setCategoryOpen(false);
  };

  // ── Toggle mobile menu ─────────────────────────────────────────────
  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => {
      const newState = !prev;
      if (!newState) {
        setUserMenuOpen(false);
        setCategoryOpen(false);
      }
      return newState;
    });
  };

  // ── Mobile category toggle ─────────────────────────────────────────
  const handleMobileCategoryClick = () => {
    if (isMobile) {
      setUserMenuOpen(false);
      setCategoryOpen(!categoryOpen);
    } else {
      setCategoryOpen(!categoryOpen);
    }
  };

  // ── User actions ───────────────────────────────────────────────────
  function handleUserClick() {
    if (isAuthenticated) {
      if (isMobile) {
        setCategoryOpen(false);
        setUserMenuOpen(!userMenuOpen);
      } else {
        setUserMenuOpen(!userMenuOpen);
      }
    } else {
      sessionStorage.setItem("returnAfterLogin", window.location.href);
      window.location.href = "https://agtechscript.in#login";
    }
    if (!isMobile) {
      setMobileMenuOpen(false);
    }
  }

  function handleOrders() {
    if (requireAuth && requireAuth()) {
      navigate("/orders");
    }
    closeAllMenus();
  }

  function handleProfile() {
    if (requireAuth && requireAuth()) {
      window.location.href = "https://account.agtechscript.in";
    }
    closeAllMenus();
  }


async function handleLogout() {
    try {
        const response = await fetch(`${MAIN_API}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            // Clear user data
            window.currentUser = null;
            currentUser = null;
            
            // Close overlay
            closeAllOverlays();
            
            // Show default icon
            displayDefaultUserIcon();
            
            // Redirect
            window.location.href = 'https://shop.agtechscript.in';
        }
    } catch (error) {
        console.error('Logout failed:', error);
    }
}

  function handleCategoryClick(slug) {
    navigate(`/category/${slug}`);
    closeAllMenus();
  }

  function handleLinkClick() {
    closeAllMenus();
  }

  // Get display name (prefer full profile name)
  const displayName = fullUserProfile?.name || user?.name || user?.user_id || "User";
  const displayEmail = fullUserProfile?.email || user?.email || "";
  const displayPoints = fullUserProfile?.points;
  const displayPhone = fullUserProfile?.phone;

  return (
    <>
      <header className={`ag-header ${isScrolled ? "ag-header-hidden" : ""}`}>
        <div className="ag-shine-effect"></div>
        
        <div className="ag-header-inner">
          {/* Logo Section */}
          <div className="ag-logo-section">
               <img
                src="https://cdn.agtechscript.in/AGTechScript.webp"
                alt="AG TechScript"
                className="ag-logo-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/60x60/0047ff/white?text=AG";
                }}
              />
               <Link to="https://agtechscript.in" className="ag-logo-link" onClick={handleLinkClick} target="_blank">
              <span className="ag-logo-text">AG TechScript</span>
            </Link>

            <button
              onClick={toggleMobileMenu}
              className="ag-hamburger"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>

          {/* Navigation */}
          <nav 
            ref={mobileMenuRef}
            className={`ag-nav ${mobileMenuOpen ? "ag-nav-open" : ""}`}
          >
            {/* Home */}
            <Link to="/" className="ag-nav-link" onClick={handleLinkClick}>
              <HomeIcon /> Home
            </Link>

            {/* Categories Dropdown */}
            <div className="ag-dropdown" ref={categoryRef}>
              <button 
                className="ag-dropdown-trigger"
                onClick={handleMobileCategoryClick}
              >
                <GridIcon /> Categories {categoryOpen ? "▴" : "▾"}
              </button>
              <div className={`ag-dropdown-menu ${categoryOpen ? "show" : ""}`}>
                {Object.entries(CATEGORIES_LABELS).map(([slug, label]) => (
                  <button
                    key={slug}
                    onClick={() => handleCategoryClick(slug)}
                    className="ag-dropdown-item-link"
                  >
                    {label}
                  </button>
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
                {isAuthenticated && fullUserProfile?.profile_image ? (
                  <img src={fullUserProfile.profile_image} alt={displayName} className="ag-user-avatar" />
                ) : isAuthenticated && user?.profile_image ? (
                  <img src={user.profile_image} alt={displayName} className="ag-user-avatar" />
                ) : (
                  <UserIcon />
                )}
              </button>

              {userMenuOpen && isAuthenticated && (
                <div className="ag-user-dropdown">
                  <div className="ag-user-info">
                    <div className="ag-user-name">{displayName}</div>
                    <div className="ag-user-email">{displayEmail || displayName}</div>
                    {displayPhone && (
                      <div className="ag-user-phone text-xs text-gray-400 mt-1">{displayPhone}</div>
                    )}
                    {displayPoints !== undefined && (
                      <div className="ag-user-points text-xs text-cyan-400 mt-1">
                        ⭐ {displayPoints} points
                      </div>
                    )}
                  </div>
                  <button onClick={handleOrders} className="ag-dropdown-item">
                    <OrderIcon /> My Orders
                  </button>
                  <button onClick={handleProfile} className="ag-dropdown-item">
                    <ProfileIcon /> My Account
                  </button>
                  <button onClick={handleLogout} className="ag-dropdown-item danger">
                    <LogoutIcon /> Sign Out
                  </button>
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

// Icons (same as before)
const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-5v-8H7v8H5a2 2 0 0 1-2-2z" />
  </svg>
);

const GridIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const CartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const OrderIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const ProfileIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="4" />
    <path d="M5 20v-2a7 7 0 0 1 14 0v2" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);