/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50:  "#e6eeff",
          100: "#c0d0ff",
          400: "#4d7aff",
          500: "#0047ff",
          600: "#003dd6",
          700: "#0033ad",
          DEFAULT: "#0047ff",
        },
        accent: {
          DEFAULT: "#00e6ff",
          dark:    "#00b8cc",
        },
        dark: {
          900: "#0a0f2c",
          800: "#0d1335",
          700: "#111840",
          600: "#1a2050",
        },
        surface: {
          DEFAULT: "#f5f7fa",
          card:    "#ffffff",
          glass:   "rgba(255,255,255,0.08)",
        },
      },
      fontFamily: {
        display: ["'Segoe UI'", "system-ui", "sans-serif"],
        body:    ["'Segoe UI'", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "ag-header":  "linear-gradient(135deg,#0a0f2c,#081b61,#0047ff)",
        "ag-hero":    "linear-gradient(135deg,#f5f7fa,#e4e8f0)",
        "ag-hero-dark":"linear-gradient(135deg,#0a0f2c,#1a1a2e)",
        "ag-footer":  "linear-gradient(135deg,#0a0f2c,#1a1f4a,#0047ff)",
      },
      boxShadow: {
        card:       "0 2px 8px rgba(0,71,255,0.08), 0 4px 16px rgba(0,71,255,0.04)",
        "card-hover":"0 8px 24px rgba(0,71,255,0.18), 0 16px 40px rgba(0,71,255,0.10)",
        header:     "0 4px 20px rgba(0,0,0,0.3)",
        glow:       "0 0 20px rgba(0,71,255,0.5)",
        "glow-accent":"0 0 20px rgba(0,230,255,0.5)",
        glass:      "0 8px 32px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.15)",
      },
      backdropBlur: {
        xs: "4px",
      },
      animation: {
        "fade-in":    "fadeIn 0.3s ease-out",
        "slide-in":   "slideIn 0.3s ease-out",
        "slide-up":   "slideUp 0.4s ease-out",
        shimmer:      "shimmer 1.5s infinite",
        "toast-in":   "toastIn 0.3s ease-out",
        glow:         "glow 1.6s infinite alternate",
        float:        "float 6s ease-in-out infinite",
        "glass-shine":"glassShine 8s linear infinite",
      },
      keyframes: {
        fadeIn:     { from: { opacity: 0 }, to: { opacity: 1 } },
        slideIn:    { from: { transform: "translateX(100%)", opacity: 0 }, to: { transform: "translateX(0)", opacity: 1 } },
        slideUp:    { from: { transform: "translateY(20px)", opacity: 0 }, to: { transform: "translateY(0)", opacity: 1 } },
        shimmer:    { "0%": { backgroundPosition: "-700px 0" }, "100%": { backgroundPosition: "700px 0" } },
        toastIn:    { from: { transform: "translateX(110%)", opacity: 0 }, to: { transform: "translateX(0)", opacity: 1 } },
        glow:       { from: { boxShadow: "0 0 10px #0047ff" }, to: { boxShadow: "0 0 30px #0047ff" } },
        float:      { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-12px)" } },
        glassShine: { "0%": { transform: "skewX(-25deg) translateX(-100%)" }, "100%": { transform: "skewX(-25deg) translateX(100%)" } },
      },
    },
  },
  plugins: [],
};
