import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";

const AuthContext = createContext(null);
const API = "https://api.agtechscript.in";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);
  const abortControllerRef = useRef(null);

  // ── Cookie check WITHOUT cache-control header ──────────────────
  const checkAuthViaCookies = useCallback(async () => {
    // Cancel previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    setLoading(true);
    setAuthError(null);
    
    try {
      // 🔥 FIX: Remove "Cache-Control" header - only keep necessary ones
      const res = await fetch(`${API}/api/auth/status`, {
        method: "GET",
        credentials: "include",
        headers: { 
          "X-Client-Host": window.location.hostname,
          // "Cache-Control" removed - this was causing CORS error
          // "Pragma" removed - not needed
        },
        signal,
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
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
        setAuthError(null);
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent("auth-change", { detail: { user: authUser } }));
        
        return authUser;
      } else {
        setUser(null);
        setIsAuthenticated(false);
        return null;
      }
    } catch (err) {
      // Ignore abort errors
      if (err.name === 'AbortError') {
        console.log('Auth check aborted');
        return null;
      }
      
      console.error("Auth check error:", err);
      setAuthError(err.message);
      setUser(null);
      setIsAuthenticated(false);
      return null;
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, []);

  // ── Run on mount ────────────────────────────────────────────
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 2;
    const retryDelay = 1000;
    
    const attemptAuthCheck = async () => {
      const result = await checkAuthViaCookies();
      
      // If failed and not aborted, retry once
      if (!result && retryCount < maxRetries && !abortControllerRef.current) {
        retryCount++;
        setTimeout(attemptAuthCheck, retryDelay);
      }
    };
    
    attemptAuthCheck();
    
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
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [checkAuthViaCookies]);

  // ── Require Auth ────────────────────────────────────────────
  const requireAuth = useCallback(() => {
    if (!isAuthenticated && !loading) {
      sessionStorage.setItem("returnAfterLogin", window.location.href);
      window.location.href = "https://agtechscript.in#login";
      return false;
    }
    return true;
  }, [isAuthenticated, loading]);

 const logout = useCallback(async () => {
  try {
    // ✅ Pehle worker logout call karo
    let workerResponse = await fetch(`${CONFIG.WORKER_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: { 
        'Content-Type': 'application/json', 
        'X-Client-Host': window.location.host 
      },
    });

    if (!workerResponse.ok) {
      workerResponse = await fetch(`${CONFIG.WORKER_URL}/api/auth/logout`, {
        method: 'GET',
        credentials: 'include',
      });
    }
    
    if (!workerResponse.ok) {
      console.error('Worker logout failed:', await workerResponse.text());
    }
    
    // ✅ Fir Supabase sign out (with timeout to avoid hanging)
    const supabase = getSupabaseClient();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Supabase logout timeout')), 3000)
    );
    
    await Promise.race([
      supabase.auth.signOut({ scope: 'global' }),
      timeoutPromise
    ]).catch(err => console.error('Supabase logout error:', err));
    
  } catch (err) {
    console.error('Logout error:', err);
  } finally {
    // ✅ Always clear local state and storage
    setSupabaseToken(null);
    lastAuthCheckRef.current = 0;
    setUser(null);
    
    // ✅ Clear local storage items
    localStorage.removeItem('sb-auth-token');
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('agtech-auth');
    localStorage.removeItem('agtech-worker-supabase-token');
    sessionStorage.clear();

    const expired = 'Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = `auth_token=; expires=${expired}; path=/; domain=.agtechscript.in; Secure; SameSite=None`;
    document.cookie = `auth_token=; expires=${expired}; path=/; domain=${window.location.hostname}; Secure; SameSite=None`;
    document.cookie = `auth_token=; expires=${expired}; path=/`;
    
  }
}, []);

  // ── Refresh Auth ────────────────────────────────────────────
  const refreshAuth = useCallback(() => {
    return checkAuthViaCookies();
  }, [checkAuthViaCookies]);

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