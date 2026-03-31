import { createContext, useContext, useState, useCallback, useEffect } from "react";

const AuthContext = createContext(null);

const API = "https://api.agtechscript.in";

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: check existing session via cookie
  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const res = await fetch(`${API}/api/auth/status`, {
        credentials: "include",
        headers: {
          "X-Client-Host": window.location.hostname,
        },
      });
      const data = await res.json();

      if (data.authenticated) {
        setUser({
          user_id:       data.user_id,
          name:          data.name || data.user_id,
          role:          data.role,
          profile_image: data.profile_image,
          email:         data.email,
        });
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  const login = useCallback(async (identity, password, role = "user") => {
    const res = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identity, password, role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");

    const u = {
      user_id:       data.user.user_id,
      name:          data.user.name || data.user.user_id,
      role:          data.user.role,
      profile_image: data.user.profile_image,
    };
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    try {
      // Clear cookie by redirecting to auth domain logout
      await fetch(`${API}/api/auth/logout`, { credentials: "include" }).catch(() => {});
    } catch {}
    setUser(null);
    // Redirect to main site login
    window.location.href = "https://account.agtechscript.in";
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
