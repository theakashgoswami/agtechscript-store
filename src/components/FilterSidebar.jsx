import { useState } from "react";
import { SORT_OPTIONS } from "../utils/constants.js";

export default function FilterSidebar({ filters, onChange, brands = [], minPrice = 0, maxPrice = 2000 }) {
  const [localPriceRange, setLocalPriceRange] = useState([
    filters.priceMin ?? minPrice, filters.priceMax ?? maxPrice,
  ]);
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleBrandToggle(brand) {
    const cur = filters.brands || [];
    onChange({ ...filters, brands: cur.includes(brand) ? cur.filter(b => b !== brand) : [...cur, brand] });
  }
  function handlePriceApply() {
    onChange({ ...filters, priceMin: localPriceRange[0], priceMax: localPriceRange[1] });
  }
  function handleSort(val) {
    const [sortBy, order] = val.split("-");
    onChange({ ...filters, sortBy: sortBy === "default" ? undefined : sortBy, order });
  }
  function handleAvail(val) {
    onChange({ ...filters, inStock: val === "in_stock" ? true : undefined });
  }
  function handleReset() {
    setLocalPriceRange([minPrice, maxPrice]);
    onChange({});
  }

  const currentSort = filters.sortBy ? `${filters.sortBy}-${filters.order || "asc"}` : "default";
  const hasActive = (filters.brands?.length > 0) || filters.priceMin != null || filters.inStock != null;

  const agBlue   = "#0047ff";
  const agCyan   = "#00e6ff";
  const panelBg  = "rgba(255,255,255,0.95)";
  const panelBdr = "1px solid rgba(0,71,255,0.12)";

  const Content = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900">Filters</h3>
        {hasActive && (
          <button onClick={handleReset}
            className="text-xs font-bold transition-colors"
            style={{ color: agBlue }}>
            Clear all
          </button>
        )}
      </div>

      {/* Sort */}
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Sort By</p>
        <select value={currentSort} onChange={e => handleSort(e.target.value)}
          className="w-full text-sm border rounded-xl px-3 py-2 focus:outline-none bg-white"
          style={{ borderColor:"rgba(0,71,255,0.2)" }}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Availability */}
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Availability</p>
        <div className="space-y-1.5">
          {[["all","All Products"],["in_stock","In Stock Only"]].map(([val, label]) => (
            <label key={val} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="avail" value={val}
                checked={val === "all" ? filters.inStock == null : filters.inStock === true}
                onChange={() => handleAvail(val)}
                className="accent-blue-600" />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Price Range</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="px-2 py-1 rounded-lg bg-gray-100 font-medium">${localPriceRange[0]}</span>
            <span>–</span>
            <span className="px-2 py-1 rounded-lg bg-gray-100 font-medium">${localPriceRange[1]}</span>
          </div>
          <input type="range" min={minPrice} max={maxPrice} step={10}
            value={localPriceRange[0]}
            onChange={e => setLocalPriceRange([Number(e.target.value), localPriceRange[1]])} />
          <input type="range" min={minPrice} max={maxPrice} step={10}
            value={localPriceRange[1]}
            onChange={e => setLocalPriceRange([localPriceRange[0], Number(e.target.value)])} />
          <button onClick={handlePriceApply}
            className="w-full py-2 text-white text-xs font-bold rounded-xl transition-all hover:opacity-90"
            style={{ background:`linear-gradient(135deg,${agBlue},#0033ad)` }}>
            Apply Price Filter
          </button>
        </div>
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Brand</p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {brands.map(brand => (
              <label key={brand} className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox"
                  checked={(filters.brands || []).includes(brand)}
                  onChange={() => handleBrandToggle(brand)}
                  className="accent-blue-600 rounded" />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors truncate">
                  {brand}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden mb-4">
        <button onClick={() => setMobileOpen(!mobileOpen)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all"
          style={{ background:"white", border:"1px solid rgba(0,71,255,0.2)", color: agBlue }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 010 2H4a1 1 0 01-1-1zM6 10a1 1 0 011-1h10a1 1 0 010 2H7a1 1 0 01-1-1zM9 16a1 1 0 011-1h4a1 1 0 010 2h-4a1 1 0 01-1-1z" />
          </svg>
          Filters
          {hasActive && (
            <span className="w-5 h-5 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
              style={{ background: agBlue }}>
              {(filters.brands?.length || 0) + (filters.priceMin != null ? 1 : 0) + (filters.inStock != null ? 1 : 0)}
            </span>
          )}
        </button>
        {mobileOpen && (
          <div className="mt-3 rounded-2xl p-4 animate-slide-up"
            style={{ background: panelBg, border: panelBdr, boxShadow:"0 8px 24px rgba(0,71,255,0.08)" }}>
            <Content />
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-52 shrink-0">
        <div className="rounded-2xl p-4 sticky top-24"
          style={{ background: panelBg, border: panelBdr, boxShadow:"0 4px 16px rgba(0,71,255,0.06)" }}>
          <Content />
        </div>
      </aside>
    </>
  );
}
