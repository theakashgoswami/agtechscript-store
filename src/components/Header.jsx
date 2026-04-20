import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { debounce } from "../utils/format";
import CartDrawer from "./CartDrawer";

const CATEGORIES = [
  ["smartphones", "Smartphones"],
  ["laptops", "Laptops"],
  ["skincare", "Skincare"],
  ["fragrances", "Fragrances"],
  ["groceries", "Groceries"],
  ["furniture", "Furniture"],
  ["home-decoration", "Home Decor"],
  ["mens-shirts", "Men's Shirts"],
  ["mens-shoes", "Men's Shoes"],
  ["womens-dresses", "Women's Dresses"],
  ["womens-shoes", "Women's Shoes"],
  ["sunglasses", "Sunglasses"],
  ["automotive", "Automotive"],
];

const MAIN_API = "https://api.agtechscript.in";

function classNames(...values) {
  return values.filter(Boolean).join(" ");
}

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { itemCount } = useCart();
  const { user, isAuthenticated, logout, requireAuth, refreshAuth } = useAuth();

  const userMenuRef = useRef(null);
  const categoryRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [fullUserProfile, setFullUserProfile] = useState(null);

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    setCategoryOpen(false);
  };

  useEffect(() => {
    const q = new URLSearchParams(location.search).get("q") || "";
    setSearchQuery(q);
  }, [location.search]);

  useEffect(() => {
    const returnUrl = sessionStorage.getItem("returnAfterLogin");
    if (returnUrl) {
      sessionStorage.removeItem("returnAfterLogin");
      refreshAuth?.();
    }
  }, [refreshAuth]);

  useEffect(() => {
    let ignore = false;

    async function fetchUserProfile() {
      if (!isAuthenticated || !user?.user_id) {
        setFullUserProfile(null);
        return;
      }

      try {
        const response = await fetch(`${MAIN_API}/api/user/profile?user_id=${user.user_id}`, {
          credentials: "include",
          headers: { "X-Client-Host": window.location.hostname },
        });
        const data = await response.json();
        if (!ignore && data.success) {
          setFullUserProfile(data);
        }
      } catch (error) {
        if (!ignore) {
          setFullUserProfile(null);
        }
        console.error("Failed to fetch user profile:", error);
      }
    }

    fetchUserProfile();

    return () => {
      ignore = true;
    };
  }, [isAuthenticated, user?.user_id]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setCategoryOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    closeMenus();
  }, [location.pathname]);

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        if (value.trim()) {
          navigate(`/search?q=${encodeURIComponent(value.trim())}`);
        }
      }, 400),
    [navigate]
  );

  const displayName = fullUserProfile?.name || user?.name || user?.user_id || "User";
  const displayEmail = fullUserProfile?.email || user?.email || "";
  const displayPhone = fullUserProfile?.phone || "";
  const displayAvatar = fullUserProfile?.profile_image || user?.profile_image || "";

  function handleSearchSubmit(event) {
    event.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  }

  function handleUserClick() {
    if (!isAuthenticated) {
      sessionStorage.setItem("returnAfterLogin", window.location.href);
      window.location.href = "https://account.agtechscript.in?redirect=" +
        encodeURIComponent(window.location.href);
      return;
    }

    setUserMenuOpen((prev) => !prev);
  }

  function handleOrders() {
    if (requireAuth?.()) {
      navigate("/orders");
      closeMenus();
    }
  }

  function handleProfile() {
    if (requireAuth?.()) {
      window.location.href = "https://account.agtechscript.in";
      closeMenus();
    }
  }

  async function handleLogout() {
    try {
      await logout?.();
    } finally {
      closeMenus();
      window.location.href = "https://shop.agtechscript.in";
    }
  }

  function handleCategoryClick(slug) {
    navigate(`/category/${slug}`);
    closeMenus();
  }

  const isSearchPage = location.pathname === "/search";

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-4 px-4 py-3">
          <Link to="/" className="flex shrink-0 items-center gap-3" onClick={closeMenus}>
            <img
              src="https://cdn.agtechscript.in/AGTechScript.webp"
              alt="AG TechScript"
              className="h-10 w-10 rounded-[10px] object-cover ring-1 ring-white/12 shadow-[0_8px_24px_rgba(0,0,0,0.28)]"
            />
            <span className="title text-lg font-bold tracking-tight text-white sm:inline">
              AG TechScript
            </span>
          </Link>

          <nav className="hidden items-center gap-5 md:flex">
            <Link
              to="/"
              className={classNames(
                "text-sm font-medium transition-colors hover:text-indigo-400",
                location.pathname === "/" ? "text-indigo-400" : "text-zinc-400"
              )}
            >
              Home
            </Link>

            <div className="relative" ref={categoryRef}>
              <button
                type="button"
                onClick={() => setCategoryOpen((prev) => !prev)}
                className={classNames(
                  "inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-indigo-400",
                  location.pathname.startsWith("/category") || categoryOpen ? "text-indigo-400" : "text-zinc-400"
                )}
              >
                Categories
                <ChevronIcon className={classNames("h-4 w-4 transition-transform", categoryOpen && "rotate-180")} />
              </button>

              {categoryOpen && (
                <div className="absolute left-0 top-full mt-3 grid w-64 gap-1 rounded-2xl border border-zinc-800 bg-zinc-900 p-2 shadow-2xl">
                  {CATEGORIES.map(([slug, label]) => (
                    <button
                      key={slug}
                      type="button"
                      onClick={() => handleCategoryClick(slug)}
                      className="rounded-xl px-3 py-2 text-left text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <form
            onSubmit={handleSearchSubmit}
            className="hidden min-w-0 flex-1 items-center overflow-hidden rounded-full border border-zinc-800 bg-zinc-900/80 lg:flex"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => {
                const value = event.target.value;
                setSearchQuery(value);
                debouncedSearch(value);
              }}
              placeholder="Search products..."
              className="w-full bg-transparent px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-500"
            />
            <button
              type="submit"
              className="border-l border-zinc-800 px-4 py-2.5 text-zinc-400 transition-colors hover:text-indigo-400"
              aria-label="Search products"
            >
              <SearchIcon className="h-4 w-4" />
            </button>
          </form>

          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative hidden items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white md:inline-flex"
            >
              <CartIcon className="h-4 w-4" />
              Cart
              {itemCount > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-500 px-1.5 text-[11px] font-bold text-white">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>

            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={handleUserClick}
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-zinc-800 bg-zinc-900 transition-colors hover:bg-zinc-800"
                aria-label={isAuthenticated ? "Open account menu" : "Login"}
              >
                {displayAvatar ? (
                  <img src={displayAvatar} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  <UserIcon className="h-5 w-5 text-zinc-400" />
                )}
              </button>

              {userMenuOpen && isAuthenticated && (
                <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-zinc-800 bg-zinc-900 p-2 shadow-2xl">
                  <div className="rounded-xl px-3 py-3">
                    <p className="truncate text-sm font-semibold text-white">{displayName}</p>
                    <p className="truncate text-xs text-zinc-500">{displayEmail || `@${user?.user_id || "user"}`}</p>
                    {displayPhone && <p className="mt-1 text-xs text-zinc-500">{displayPhone}</p>}
                  </div>
                  <div className="my-1 h-px bg-zinc-800" />
                  <button
                    type="button"
                    onClick={handleOrders}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
                  >
                    <OrderIcon className="h-4 w-4" />
                    My Orders
                  </button>
                  <button
                    type="button"
                    onClick={handleProfile}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
                  >
                    <ProfileIcon className="h-4 w-4" />
                    My Account
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-400 transition-colors hover:bg-red-500/10"
                  >
                    <LogoutIcon className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white md:hidden"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div ref={mobileMenuRef} className="border-t border-zinc-800 bg-zinc-950 md:hidden">
            <div className="space-y-4 px-4 py-4">
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500"
                />
                <button
                  type="submit"
                  className="border-l border-zinc-800 px-4 py-3 text-zinc-400"
                  aria-label="Search products"
                >
                  <SearchIcon className="h-4 w-4" />
                </button>
              </form>

              <div className="grid gap-1">
                <Link
                  to="/"
                  onClick={closeMenus}
                  className={classNames(
                    "rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    location.pathname === "/" ? "bg-indigo-500/10 text-indigo-400" : "text-zinc-300 hover:bg-zinc-900"
                  )}
                >
                  Home
                </Link>

                <button
                  type="button"
                  onClick={() => setCategoryOpen((prev) => !prev)}
                  className={classNames(
                    "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    categoryOpen ? "bg-indigo-500/10 text-indigo-400" : "text-zinc-300 hover:bg-zinc-900"
                  )}
                >
                  Categories
                  <ChevronIcon className={classNames("h-4 w-4 transition-transform", categoryOpen && "rotate-180")} />
                </button>

                {categoryOpen && (
                  <div className="grid gap-1 rounded-2xl border border-zinc-800 bg-zinc-900 p-2">
                    {CATEGORIES.map(([slug, label]) => (
                      <button
                        key={slug}
                        type="button"
                        onClick={() => handleCategoryClick(slug)}
                        className="rounded-xl px-3 py-2 text-left text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setCartOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-900"
                >
                  <span>Cart</span>
                  {itemCount > 0 && (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-500 px-1.5 text-[11px] font-bold text-white">
                      {itemCount > 99 ? "99+" : itemCount}
                    </span>
                  )}
                </button>

                {isAuthenticated && (
                  <>
                    <button
                      type="button"
                      onClick={handleOrders}
                      className="rounded-xl px-3 py-2.5 text-left text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-900"
                    >
                      My Orders
                    </button>
                    <button
                      type="button"
                      onClick={handleProfile}
                      className="rounded-xl px-3 py-2.5 text-left text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-900"
                    >
                      My Account
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
                    >
                      Sign Out
                    </button>
                  </>
                )}

                {!isAuthenticated && !isSearchPage && (
                  <button
                    type="button"
                    onClick={handleUserClick}
                    className="rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

function IconWrapper({ children, className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function SearchIcon({ className }) {
  return (
    <IconWrapper className={className}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </IconWrapper>
  );
}

function CartIcon({ className }) {
  return (
    <IconWrapper className={className}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </IconWrapper>
  );
}

function UserIcon({ className }) {
  return (
    <IconWrapper className={className}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </IconWrapper>
  );
}

function OrderIcon({ className }) {
  return (
    <IconWrapper className={className}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </IconWrapper>
  );
}

function ProfileIcon({ className }) {
  return (
    <IconWrapper className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20v-2a7 7 0 0 1 14 0v2" />
    </IconWrapper>
  );
}

function LogoutIcon({ className }) {
  return (
    <IconWrapper className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </IconWrapper>
  );
}

function MenuIcon({ className }) {
  return (
    <IconWrapper className={className}>
      <path d="M4 12h16" />
      <path d="M4 6h16" />
      <path d="M4 18h16" />
    </IconWrapper>
  );
}

function CloseIcon({ className }) {
  return (
    <IconWrapper className={className}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </IconWrapper>
  );
}

function ChevronIcon({ className }) {
  return (
    <IconWrapper className={className}>
      <path d="m6 9 6 6 6-6" />
    </IconWrapper>
  );
}
