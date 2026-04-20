import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const AuthContext = createContext(null);
const API = "https://api.agtechscript.in";
const ACCOUNT_APP = "https://account.agtechscript.in";
const MAIN_SITE = "https://agtechscript.in#login";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);
  const abortControllerRef = useRef(null);

  const checkAuthViaCookies = useCallback(async () => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setAuthError(null);

    try {
      const res = await fetch(`${API}/api/auth/status`, {
        method: "GET",
        credentials: "include",
        headers: { "X-Client-Host": window.location.host },
        signal: controller.signal,
      });

      if (!res.ok) {
        setUser(null);
        setIsAuthenticated(false);
        return null;
      }

      const data = await res.json();
      if (data.authenticated && data.user_id) {
        const authUser = {
          user_id: data.user_id,
          name: data.name || data.user_id,
          email: data.email || "",
          role: data.role || "user",
          profile_image: data.profile_image || null,
          redirect: data.redirect || null,
        };

        setUser(authUser);
        setIsAuthenticated(true);
        window.dispatchEvent(new CustomEvent("auth-change", { detail: { user: authUser } }));
        return authUser;
      }

      setUser(null);
      setIsAuthenticated(false);
      return null;
    } catch (err) {
      if (err.name === "AbortError") return null;
      console.error("Store auth check error:", err);
      setAuthError(err.message || "Auth check failed");
      setUser(null);
      setIsAuthenticated(false);
      return null;
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthViaCookies();

    const handleVisibilityChange = () => {
      if (!document.hidden) checkAuthViaCookies();
    };

    const handleAuthEvent = () => checkAuthViaCookies();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("auth-check", handleAuthEvent);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("auth-check", handleAuthEvent);
      abortControllerRef.current?.abort();
    };
  }, [checkAuthViaCookies]);

  const requireAuth = useCallback(() => {
    if (!isAuthenticated && !loading) {
      sessionStorage.setItem("returnAfterLogin", window.location.href);
      window.location.href = `${ACCOUNT_APP}?redirect=${encodeURIComponent(window.location.href)}`;
      return false;
    }
    return true;
  }, [isAuthenticated, loading]);

  const logout = useCallback(async () => {
    try {
      let workerResponse = await fetch(`${API}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Client-Host": window.location.host,
        },
      });

      if (!workerResponse.ok) {
        workerResponse = await fetch(`${API}/api/auth/logout`, {
          method: "GET",
          credentials: "include",
        });
      }

      if (!workerResponse.ok) {
        console.error("Worker logout failed:", await workerResponse.text());
      }
    } catch (err) {
      console.error("Store logout error:", err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setAuthError(null);

      [
        "sb-auth-token",
        "supabase.auth.token",
        "agtech-auth",
        "agtech-worker-supabase-token",
      ].forEach((key) => localStorage.removeItem(key));
      sessionStorage.clear();

      const expired = "Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = `auth_token=; expires=${expired}; path=/; domain=.agtechscript.in; Secure; SameSite=None`;
      document.cookie = `auth_token=; expires=${expired}; path=/; domain=${window.location.hostname}; Secure; SameSite=None`;
      document.cookie = `auth_token=; expires=${expired}; path=/`;
    }
  }, []);

  const refreshAuth = useCallback(() => checkAuthViaCookies(), [checkAuthViaCookies]);

  const value = {
    user,
    loading,
    isAuthenticated,
    authError,
    checkAuthViaCookies,
    requireAuth,
    logout,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
