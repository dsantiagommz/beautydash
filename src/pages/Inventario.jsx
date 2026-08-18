import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, MoreHorizontal, X } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { api } from "../lib/api";

function stockBadge(p) {
  if (p.stock === 0) return "bg-rose-900/90 text-white ring-1 ring-inset ring-rose-900";
  if (p.stock <= p.minStock) return "bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-200";
  return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
}

function stockLabel(p) {
  if (p.stock === 0) return "Agotado";
  if (p.stock <= p.minStock) return "Stock bajo";
  return "Disponible";
}

const emptyForm = { sku: "", name: "", categoryId: "", price: "", stock: "", minStock: "" };

function NewProductModal({ categories, onClose, onCreated }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.products.create({
        sku: form.sku,
        name: form.name,
        categoryId: form.categoryId,
        price: Number(form.price),
        stock: Number(form.stock),
        minStock: Number(form.minStock),
      });
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] text-slate-700 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-slate-900">Nuevo producto</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-[12.5px] font-medium text-rose-600">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[12.5px] font-medium text-slate-600">SKU</label>
              <input
                required
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12.5px] font-medium text-slate-600">
                Categoría
              </label>
              <select
                required
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className={inputClass}
              >
                <option value="">Selecciona</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[12.5px] font-medium text-slate-600">
              Nombre del producto
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1.5 block text-[12.5px] font-medium text-slate-600">
                Precio
              </label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12.5px] font-medium text-slate-600">
                Stock
              </label>
              <input
                required
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12.5px] font-medium text-slate-600">
                Mínimo
              </label>
              <input
                required
                type="number"
                min="0"
                value={form.minStock}
                onChange={(e) => setForm({ ...form, minStock: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-violet-700 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm shadow-violet-600/25 hover:from-violet-500 hover:to-violet-600 disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar producto"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Inventario() {
  const navigate = useNavigate();
  const [products, setProducts] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  function load() {
    api.products
      .list({ ...(query ? { search: query } : {}), ...(categoryId ? { categoryId } : {}) })
      .then(setProducts)
      .catch((e) => setError(e.message));
  }

  useEffect(() => {
    api.categories.list().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    const timeout = setTimeout(load, 250);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, categoryId]);

  return (
    <>
      <PageHeader
        title="Catálogo de productos"
        subtitle={
          products
            ? `${products.length} producto${products.length !== 1 ? "s" : ""} registrado${products.length !== 1 ? "s" : ""}`
            : "Cargando..."
        }
        actions={
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-violet-700 px-3.5 py-2 text-[13px] font-semibold text-white shadow-sm shadow-violet-600/25 hover:from-violet-500 hover:to-violet-600"
          >
            <Plus className="h-4 w-4" />
            Nuevo Producto
          </button>
        }
      />

      {modalOpen && (
        <NewProductModal
          categories={categories}
          onClose={() => setModalOpen(false)}
          onCreated={() => {
            setModalOpen(false);
            load();
          }}
        />
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4 sm:p-5">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Buscar por nombre o SKU..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-[13px] text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setCategoryId("")}
              className={`rounded-full px-3 py-1.5 text-[12.5px] font-medium transition ${
                categoryId === "" ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Todas
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoryId(c.id)}
                className={`rounded-full px-3 py-1.5 text-[12.5px] font-medium transition ${
                  categoryId === c.id
                    ? "bg-violet-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="px-5 py-4 text-[13px] font-medium text-rose-600 sm:px-6">
            No se pudo cargar el inventario: {error}
          </p>
        )}

        {!error && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[11.5px] uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-medium sm:px-6">Producto</th>
                  <th className="px-3 py-3 font-medium">SKU</th>
                  <th className="px-3 py-3 font-medium">Categoría</th>
                  <th className="px-3 py-3 font-medium text-right">Stock</th>
                  <th className="px-3 py-3 font-medium text-right">Precio</th>
                  <th className="px-3 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 font-medium text-right sm:px-6">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(products ?? Array.from({ length: 5 })).map((p, i) => (
                  <tr
                    key={p?.id ?? i}
                    onClick={p ? () => navigate(`/inventario/${p.id}`) : undefined}
                    className={`group text-[13.5px] hover:bg-slate-50/80 ${p ? "cursor-pointer" : ""}`}
                  >
                    {p ? (
                      <>
                        <td className="px-5 py-3.5 font-medium text-slate-800 sm:px-6">{p.name}</td>
                        <td className="px-3 py-3.5 font-mono text-[12.5px] text-slate-500">{p.sku}</td>
                        <td className="px-3 py-3.5 text-slate-500">{p.category.name}</td>
                        <td className="px-3 py-3.5 text-right text-slate-600">
                          {p.stock} <span className="text-slate-400">/ min {p.minStock}</span>
                        </td>
                        <td className="px-3 py-3.5 text-right font-semibold text-slate-800">
                          ${Number(p.price).toFixed(2)}
                        </td>
                        <td className="px-3 py-3.5">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${stockBadge(p)}`}
                          >
                            {stockLabel(p)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right sm:px-6">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/inventario/${p.id}`);
                            }}
                            className="rounded-md p-1.5 text-slate-400 opacity-0 transition hover:bg-slate-200/70 hover:text-slate-600 group-hover:opacity-100"
                            aria-label="Ver detalle"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </td>
                      </>
                    ) : (
                      <td colSpan={7} className="px-5 py-3.5 sm:px-6">
                        <div className="h-4 animate-pulse rounded bg-slate-100" />
                      </td>
                    )}
                  </tr>
                ))}
                {products && products.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-[13px] text-slate-400">
                      No se encontraron productos con esos filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
