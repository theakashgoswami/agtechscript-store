import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={{ background: "linear-gradient(135deg,#0a0f2c,#1a1f4a,#0047ff)" }}
      className="text-white mt-12 relative overflow-hidden">

      {/* Shine */}
      <div className="pointer-events-none absolute inset-0"
        style={{ background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent)", animation:"glassShine 8s linear infinite" }} />

      <div className="relative max-w-7xl mx-auto px-4 py-10 z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.2)" }}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-base text-white">AG TechScript</p>
                <p className="text-[9px] text-cyan-300 tracking-widest">STORE</p>
              </div>
            </div>
            <p className="text-sm text-blue-200 leading-relaxed">
              Scripted for Trend, Tuned for Tech. Quality products at unbeatable prices.
            </p>
            <div className="mt-3 flex gap-2">
              {[
                { href:"https://agtechscript.in",   label:"🌐 Main Site" },
                { href:"https://account.agtechscript.in", label:"👤 Account" },
              ].map(({ href, label }) => (
                <a key={href} href={href}
                  className="text-xs text-cyan-300 hover:text-white transition-colors px-2 py-1 rounded-lg"
                  style={{ background:"rgba(255,255,255,0.08)" }}>
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-bold text-sm mb-3 text-cyan-300">Shop</h4>
            <ul className="space-y-2 text-sm text-blue-200">
              {[["smartphones","Smartphones"],["laptops","Laptops"],["skincare","Skincare"],["furniture","Furniture"]].map(([s,l]) => (
                <li key={s}><Link to={`/category/${s}`} className="hover:text-white transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-bold text-sm mb-3 text-cyan-300">Help</h4>
            <ul className="space-y-2 text-sm text-blue-200">
              {["Track Order","Returns","FAQ"].map(item => (
                <li key={item}><span className="hover:text-white cursor-pointer transition-colors">{item}</span></li>
              ))}
              <li>
                <a href="https://agtechscript.in" className="hover:text-white transition-colors">Contact Us</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-sm mb-3 text-cyan-300">Contact</h4>
            <ul className="space-y-2 text-sm text-blue-200">
              <li>📧 connect@agtechscript.in</li>
              <li>📞 +91-6397563847</li>
              <li className="leading-snug">📍 Kisrauli, Kasganj, UP 207124</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-blue-300"
          style={{ borderTop:"1px solid rgba(255,255,255,0.1)" }}>
          <p>© {year} AG TechScript. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Secure Payments
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Free Delivery
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes glassShine {
          0%   { transform: skewX(-25deg) translateX(-100%); }
          100% { transform: skewX(-25deg) translateX(100%); }
        }
      `}</style>
    </footer>
  );
}
