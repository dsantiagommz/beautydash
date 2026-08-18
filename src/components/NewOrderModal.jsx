import { useEffect, useMemo, useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { api } from "../lib/api";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] text-slate-700 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100";

export default function NewOrderModal({ onClose, onCreated }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [lines, setLines] = useState([{ productId: "", quantity: 1 }]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.customers.list().then(setCustomers).catch(() => {});
    api.products.list().then(setProducts).catch(() => {});
  }, []);

  function updateLine(index, patch) {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  function addLine() {
    setLines((prev) => [...prev, { productId: "", quantity: 1 }]);
  }

  function removeLine(index) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  const total = useMemo(() => {
    return lines.reduce((sum, line) => {
      const product = products.find((p) => p.id === line.productId);
      if (!product) return sum;
      return sum + Number(product.price) * (Number(line.quantity) || 0);
    }, 0);
  }, [lines, products]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const validLines = lines.filter((l) => l.productId && Number(l.quantity) > 0);
    if (!customerId) {
      setError("Selecciona un salón / cliente");
      return;
    }
    if (validLines.length === 0) {
      setError("Agrega al menos un producto con cantidad válida");
      return;
    }

    setSaving(true);
    try {
      await api.orders.create({
        customerId,
        items: validLines.map((l) => ({
          productId: l.productId,
          quantity: Number(l.quantity),
        })),
      });
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const usedProductIds = lines.map((l) => l.productId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-slate-900">Nuevo pedido</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-[12.5px] font-medium text-rose-600">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[12.5px] font-medium text-slate-600">
              Salón / Cliente
            </label>
            <select
              required
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className={inputClass}
            >
              <option value="">Selecciona un cliente</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-[12.5px] font-medium text-slate-600">Productos</label>
              <button
                type="button"
                onClick={addLine}
                className="flex items-center gap-1 text-[12px] font-semibold text-violet-600 hover:text-violet-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Agregar línea
              </button>
            </div>

            <div className="space-y-2">
              {lines.map((line, i) => {
                const product = products.find((p) => p.id === line.productId);
                const maxStock = product?.stock ?? 0;
                return (
                  <div key={i} className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <select
                        value={line.productId}
                        onChange={(e) => updateLine(i, { productId: e.target.value })}
                        className={`${inputClass} w-full`}
                      >
                        <option value="">Producto</option>
                        {products.map((p) => (
                          <option
                            key={p.id}
                            value={p.id}
                            disabled={usedProductIds.includes(p.id) && p.id !== line.productId}
                          >
                            {p.name} (stock: {p.stock})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-20 shrink-0">
                      <input
                        type="number"
                        min={1}
                        max={maxStock || undefined}
                        value={line.quantity}
                        onChange={(e) => updateLine(i, { quantity: e.target.value })}
                        className={`${inputClass} w-full`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLine(i)}
                      disabled={lines.length === 1}
                      className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500 disabled:opacity-30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-[13px] font-medium text-slate-500">Total estimado</span>
            <span className="text-[18px] font-bold text-slate-900">${total.toFixed(2)}</span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-violet-700 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm shadow-violet-600/25 hover:from-violet-500 hover:to-violet-600 disabled:opacity-60"
          >
            {saving ? "Creando pedido..." : "Crear pedido"}
          </button>
        </form>
      </div>
    </div>
  );
}
