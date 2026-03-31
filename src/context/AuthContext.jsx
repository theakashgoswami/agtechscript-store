import { createContext, useContext, useState, useCallback, useEffect } from "react";

const AuthContext = createContext(null);
const API = "https://api.agtechscript.in";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ── Check auth via cookies only (NO LOCAL STORAGE) ──────────
  const checkAuthViaCookies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/status`, {
        credentials: "include",
        headers: { 
          "X-Client-Host": window.location.hostname,
          "Cache-Control": "no-cache, no-store"
        },
      });
      
      const data = await res.json();

      if (data.authenticated && data.user_id) {
        const authUser = {
          user_id:       data.user_id,
          name:          data.name || data.user_id,
          email:         data.email || "",
          role:          data.role || "user",
          profile_image: data.profile_image || null,
          redirect:      data.redirect || null,
        };
        setUser(authUser);
        setIsAuthenticated(true);
        return authUser;
      } else {
        setUser(null);
        setIsAuthenticated(false);
        return null;
      }
    } catch (err) {
      console.error("Auth check error:", err);
      setUser(null);
      setIsAuthenticated(false);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Run on mount ────────────────────────────────────────────
  useEffect(() => {
    checkAuthViaCookies();
    
    // Listen for visibility change (when returning from main site)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkAuthViaCookies();
      }
    };
    
    // Listen for custom auth event
    const handleAuthEvent = () => {
      checkAuthViaCookies();
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("auth-check", handleAuthEvent);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("auth-check", handleAuthEvent);
    };
  }, [checkAuthViaCookies]);

  // ── Require Auth (redirect to main site) ────────────────────
  const requireAuth = useCallback(() => {
    if (!isAuthenticated) {
      // Store return URL
      sessionStorage.setItem("returnAfterLogin", window.location.href);
      // Redirect to main site login
      window.location.href = "https://agtechscript.in#login";
      return false;
    }
    return true;
  }, [isAuthenticated]);

  // ── Logout - Clear cookies and redirect ─────────────────────
  const logout = useCallback(async () => {
    try {
      // Call logout endpoint to clear cookies
      await fetch(`${API}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
    } catch (err) {
      console.error("Logout error:", err);
    }
    
    // Clear state
    setUser(null);
    setIsAuthenticated(false);
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent("auth-change", { detail: { loggedOut: true } }));
    
    // Optional: redirect to home
    // window.location.href = "/";
  }, []);

  // ── Force refresh auth (useful after returning from login) ──
  const refreshAuth = useCallback(() => {
    return checkAuthViaCookies();
  }, [checkAuthViaCookies]);

  const value = {
    user,
    loading,
    isAuthenticated,
    checkAuthViaCookies,
    requireAuth,
    logout,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}