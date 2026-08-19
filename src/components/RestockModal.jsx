import { useEffect, useMemo, useState } from "react";
import { X, Package } from "lucide-react";
import { api } from "../lib/api";

const inputClass =
  "w-20 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-[13px] text-slate-700 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100";

function ProductRow({ product, onRestocked }) {
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleAdd() {
    const qty = Number(amount);
    if (!qty || qty <= 0) return;
    setError("");
    setSaving(true);
    try {
      await api.products.update(product.id, { stock: product.stock + qty });
      setDone(true);
      onRestocked();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-medium text-slate-800">{product.name}</p>
        <p className="text-[12px] text-slate-400">
          {product.sku} · Stock: {product.stock} / Mínimo {product.minStock}
        </p>
        {error && <p className="text-[11.5px] text-rose-600">{error}</p>}
      </div>
      {done ? (
        <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
          Actualizado
        </span>
      ) : (
        <>
          <input
            type="number"
            min={1}
            placeholder="+ und."
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={inputClass}
          />
          <button
            onClick={handleAdd}
            disabled={saving || !amount}
            className="shrink-0 rounded-lg bg-violet-600 px-3 py-1.5 text-[12.5px] font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {saving ? "..." : "Agregar"}
          </button>
        </>
      )}
    </div>
  );
}

export default function RestockModal({ onClose, onChanged }) {
  const [products, setProducts] = useState(null);
  const [error, setError] = useState("");

  function load() {
    api.products
      .list()
      .then(setProducts)
      .catch((e) => setError(e.message));
  }

  useEffect(load, []);

  const lowStock = useMemo(
    () => (products ?? []).filter((p) => p.stock <= p.minStock).sort((a, b) => a.stock - b.stock),
    [products]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-slate-900">Reabastecer stock</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mb-4 text-[12.5px] text-slate-400">
          Productos agotados o por debajo de su mínimo
        </p>

        {error && (
          <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-[12.5px] font-medium text-rose-600">
            {error}
          </p>
        )}

        {products === null && !error && (
          <div className="space-y-2">
            <div className="h-14 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-14 animate-pulse rounded-lg bg-slate-100" />
          </div>
        )}

        {products && lowStock.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Package className="h-8 w-8 text-slate-300" />
            <p className="text-[13px] font-medium text-slate-600">
              Todo el inventario está por encima del mínimo
            </p>
          </div>
        )}

        {lowStock.length > 0 && (
          <div className="divide-y divide-slate-100">
            {lowStock.map((p) => (
              <ProductRow key={p.id} product={p} onRestocked={onChanged} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
