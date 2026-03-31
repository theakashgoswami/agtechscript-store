import { useEffect } from "react";

/**
 * Auth is handled by account.agtechscript.in
 * This page just redirects there and syncs the cookie session.
 */
export default function LoginPage() {
  useEffect(() => {
    // Redirect to AG TechScript account portal
    window.location.href = "https://account.agtechscript.in?redirect=" +
      encodeURIComponent(window.location.origin);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(135deg,#0a0f2c,#1a1a2e)" }}>
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
          style={{ background:"rgba(0,71,255,0.3)", border:"1px solid rgba(0,71,255,0.5)" }}>
          <svg className="w-8 h-8 text-cyan-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <p className="text-white font-semibold text-lg">Redirecting to AG TechScript Account…</p>
        <p className="text-blue-300 text-sm mt-1">You will be logged in automatically</p>
      </div>
    </div>
  );
}
