import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import CartDrawer from "./CartDrawer";

/* ================= DEBOUNCE HOOK ================= */
function useDebounce(fn, delay) {
  const timeoutRef = useRef();

  return useCallback((...args) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
}

/* ================= MAIN COMPONENT ================= */
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
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  /* ================= SCROLL ================= */
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ================= CLICK OUTSIDE ================= */
  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(e.target)) {
        setCategoryOpen(false);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  /* ================= URL SYNC ================= */
  useEffect(() => {
    const q = new URLSearchParams(location.search).get("q") || "";
    setSearchQuery(q);
  }, [location.search]);

  /* ================= AUTH REFRESH ================= */
  useEffect(() => {
    const returnUrl = sessionStorage.getItem("returnAfterLogin");
    if (returnUrl) {
      sessionStorage.removeItem("returnAfterLogin");
      refreshAuth();
    }
  }, [refreshAuth]);

  /* ================= SEARCH ================= */
  const handleSearch = useDebounce((q) => {
    if (q.trim()) {
      navigate(`/search?q=${encodeURIComponent(q.trim())}`);
    }
  }, 400);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  /* ================= USER ================= */
  const handleUserClick = () => {
    if (isAuthenticated) {
      setUserMenuOpen(v => !v);
    } else {
      sessionStorage.setItem("returnAfterLogin", window.location.href);
      window.location.href = "https://agtechscript.in#login";
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  const handleOrders = () => {
    if (requireAuth()) navigate("/orders");
    setUserMenuOpen(false);
  };

  /* ================= UI ================= */
  return (
    <>
      <header className={`ag-header ${isScrolled ? "ag-header-hidden" : ""}`}>
        <div className="ag-header-inner">

          {/* LOGO */}
          <Link to="/" className="ag-logo-link">
            <img
              src="https://cdn.agtechscript.in/AGTechScript.webp"
              alt="AG"
              className="ag-logo-img"
            />
             </Link>
            <a className="ag-logo-text" href="https://agtechscript.in">AG TechScript</a>

          {/* MOBILE TOGGLE */}
          <button
            className="ag-hamburger"
            onClick={() => setMobileMenuOpen(v => !v)}
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>

          {/* NAV */}
          <nav className={`ag-nav ${mobileMenuOpen ? "ag-nav-open" : ""}`}>

            {/* HOME */}
            <Link to="/" className="ag-nav-link">Home</Link>

            {/* CATEGORY */}
            <div className="ag-dropdown" ref={categoryRef}>
              <button onClick={() => setCategoryOpen(v => !v)}>
                Categories ▾
              </button>

              {categoryOpen && (
                <div className="ag-dropdown-menu">
                  {[
                    "smartphones",
                    "laptops",
                    "groceries",
                    "furniture"
                  ].map(cat => (
                    <button
                      key={cat}
                      onClick={() => {
                        navigate(`/category/${cat}`);
                        setCategoryOpen(false);
                        setMobileMenuOpen(false);
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* SEARCH */}
            <form onSubmit={handleSubmit} className="ag-search-form">
              <input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                placeholder="Search products..."
              />
            </form>

            {/* USER */}
            <div ref={userMenuRef}>
              <button onClick={handleUserClick}>
                {isAuthenticated ? user?.name || "User" : "Login"}
              </button>

              {userMenuOpen && isAuthenticated && (
                <div className="ag-user-dropdown">
                  <button onClick={handleOrders}>Orders</button>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>

            {/* CART */}
            <button onClick={() => setCartOpen(true)}>
              Cart ({itemCount})
            </button>

          </nav>
        </div>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}