import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil } from "lucide-react";
import { api } from "../lib/api";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] text-slate-700 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100";

function Field({ label, value }) {
  return (
    <div>
      <p className="text-[11.5px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-[14px] font-medium text-slate-800">{value}</p>
    </div>
  );
}

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

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  function load() {
    api.products
      .get(id)
      .then((p) => {
        setProduct(p);
        setForm({ price: p.price, stock: p.stock, minStock: p.minStock });
      })
      .catch((e) => setError(e.message));
  }

  useEffect(load, [id]);

  async function handleSave(e) {
    e.preventDefault();
    setSaveError("");
    setSaving(true);
    try {
      await api.products.update(id, {
        price: Number(form.price),
        stock: Number(form.stock),
        minStock: Number(form.minStock),
      });
      setEditing(false);
      load();
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (error) {
    return (
      <p className="rounded-lg bg-rose-50 px-4 py-3 text-[13px] font-medium text-rose-600">
        No se pudo cargar el producto: {error}
      </p>
    );
  }

  if (!product) {
    return <div className="h-40 animate-pulse rounded-xl bg-slate-100" />;
  }

  return (
    <>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </button>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-[18px] font-semibold text-slate-900">{product.name}</h1>
            <p className="font-mono text-[12.5px] text-slate-400">{product.sku}</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${stockBadge(product)}`}
            >
              {stockLabel(product)}
            </span>
            <button
              onClick={() => setEditing((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[12.5px] font-semibold text-slate-600 hover:bg-slate-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              {editing ? "Cancelar" : "Editar"}
            </button>
          </div>
        </div>

        {!editing && (
          <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
            <Field label="Categoría" value={product.category.name} />
            <Field label="Precio" value={`$${Number(product.price).toFixed(2)}`} />
            <Field label="Unidad" value={product.unit} />
            <Field label="Stock actual" value={product.stock} />
            <Field label="Stock mínimo" value={product.minStock} />
            <Field
              label="Registrado"
              value={new Date(product.createdAt).toLocaleDateString("es-CO")}
            />
          </div>
        )}

        {editing && (
          <form onSubmit={handleSave} className="mt-6 space-y-3">
            {saveError && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-[12.5px] font-medium text-rose-600">
                {saveError}
              </p>
            )}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1.5 block text-[12.5px] font-medium text-slate-600">
                  Precio
                </label>
                <input
                  type="number"
                  step="0.01"
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
                  type="number"
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
                  type="number"
                  value={form.minStock}
                  onChange={(e) => setForm({ ...form, minStock: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-gradient-to-r from-violet-600 to-violet-700 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm shadow-violet-600/25 hover:from-violet-500 hover:to-violet-600 disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </form>
        )}
      </div>
    </>
  );
}
