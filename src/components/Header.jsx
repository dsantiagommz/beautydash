import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Search, Bell, Plus, Package } from "lucide-react";
import { api } from "../lib/api";

export default function Header({ onOpenSidebar, title, subtitle, onNewOrder, onRestock }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [stockAlerts, setStockAlerts] = useState(0);
  const searchRef = useRef(null);

  useEffect(() => {
    api.dashboard
      .summary()
      .then((s) => setStockAlerts(s.stockAlerts))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const timeout = setTimeout(() => {
      api.products
        .list({ search: query.trim() })
        .then((results) => setSuggestions(results.slice(0, 6)))
        .catch(() => setSuggestions([]));
    }, 200);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSuggestionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function goToProduct(product) {
    setSuggestionsOpen(false);
    setQuery("");
    navigate(`/inventario/${product.id}`);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setSuggestionsOpen(false);
    navigate(`/inventario?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3.5 sm:px-6 lg:gap-4 lg:px-8">
        <button
          onClick={onOpenSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-[17px] font-semibold text-slate-900 sm:text-lg">
            {title}
          </h1>
          {subtitle && (
            <p className="hidden text-[12.5px] text-slate-400 sm:block">{subtitle}</p>
          )}
        </div>

        <form
          ref={searchRef}
          onSubmit={handleSearchSubmit}
          className="relative order-last basis-full lg:order-none lg:ml-4 lg:basis-auto lg:flex-1"
        >
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSuggestionsOpen(true);
              }}
              onFocus={() => setSuggestionsOpen(true)}
              placeholder="Buscar producto o SKU en inventario... (Enter)"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-[13px] text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
            />
          </div>

          {suggestionsOpen && query.trim() && (
            <div className="absolute left-0 top-full z-30 mt-1.5 w-full max-w-md overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg shadow-slate-900/10">
              {suggestions.length === 0 && (
                <p className="px-3.5 py-3 text-[12.5px] text-slate-400">
                  Sin coincidencias. Enter para ver todos los resultados.
                </p>
              )}
              {suggestions.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => goToProduct(p)}
                  className="flex w-full items-center justify-between gap-3 px-3.5 py-2 text-left hover:bg-slate-50"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-slate-800">
                      {p.name}
                    </span>
                    <span className="block font-mono text-[11.5px] text-slate-400">{p.sku}</span>
                  </span>
                  <span className="shrink-0 text-[11.5px] text-slate-400">
                    Stock: {p.stock}
                  </span>
                </button>
              ))}
            </div>
          )}
        </form>

        <div className="ml-auto flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={() => navigate("/inventario")}
            className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Alertas de stock"
          >
            <Bell className="h-[18px] w-[18px]" />
            {stockAlerts > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9.5px] font-bold text-white ring-2 ring-white">
                {stockAlerts > 9 ? "9+" : stockAlerts}
              </span>
            )}
          </button>

          <div className="hidden items-center gap-2 md:flex">
            <button
              onClick={onRestock}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-600 hover:bg-slate-50"
            >
              <Package className="h-4 w-4" />
              Reabastecer
            </button>
            <button
              onClick={onNewOrder}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-violet-700 px-3.5 py-2 text-[13px] font-semibold text-white shadow-sm shadow-violet-600/25 hover:from-violet-500 hover:to-violet-600"
            >
              <Plus className="h-4 w-4" />
              Nuevo Pedido
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
