import { createContext, useContext, useState, useCallback, useEffect } from "react";

const AuthContext = createContext(null);
const API = "https://api.agtechscript.in";

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Cookie check on every page load ──────────────────────────
  const checkAuthViaCookies = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/auth/status`, {
        credentials: "include",
        headers: { "X-Client-Host": window.location.hostname },
      });
      const data = await res.json();

      if (data.authenticated) {
        const authUser = {
          user_id:       data.user_id,
          name:          data.name || data.user_id,
          email:         data.email || "",
          role:          data.role,
          profile_image: data.profile_image || null,
        };
        setUser(authUser);
        return authUser;
      } else {
        setUser(null);
        return null;
      }
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Run on mount
  useEffect(() => {
    checkAuthViaCookies();
  }, [checkAuthViaCookies]);

  // requireAuth — redirect to login if not authenticated
  const requireAuth = useCallback(() => {
    if (!user) {
      localStorage.setItem("returnAfterLogin", window.location.href);
      window.location.href = "https://agtechscript.in#login";
      return false;
    }
    return true;
  }, [user]);

  const logout = useCallback(() => {
    setUser(null);
    // Clear cookie by hitting logout endpoint
    fetch(`${API}/api/auth/logout`, { credentials: "include" }).catch(() => {});
    window.location.href = "https://agtechscript.in";
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      checkAuthViaCookies,
      requireAuth,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
