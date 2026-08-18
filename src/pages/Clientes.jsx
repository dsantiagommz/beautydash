import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, MoreHorizontal, MapPin, X } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { api } from "../lib/api";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] text-slate-700 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100";

function NewCustomerModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", contact: "", city: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.customers.create(form);
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-slate-900">Nuevo cliente</h2>
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
          <div>
            <label className="mb-1.5 block text-[12.5px] font-medium text-slate-600">
              Nombre del salón
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[12.5px] font-medium text-slate-600">
              Nombre de contacto
            </label>
            <input
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[12.5px] font-medium text-slate-600">
              Ciudad
            </label>
            <input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-violet-700 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm shadow-violet-600/25 hover:from-violet-500 hover:to-violet-600 disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar cliente"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Clientes() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState(null);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  function load() {
    api.customers.list().then(setCustomers).catch((e) => setError(e.message));
  }

  useEffect(load, []);

  const active = customers?.filter((c) => c.active).length ?? 0;

  return (
    <>
      <PageHeader
        title="Clientes"
        subtitle={
          customers
            ? `${customers.length} salón${customers.length !== 1 ? "es" : ""} registrado${customers.length !== 1 ? "s" : ""} · ${active} activo${active !== 1 ? "s" : ""}`
            : "Cargando..."
        }
        actions={
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-violet-700 px-3.5 py-2 text-[13px] font-semibold text-white shadow-sm shadow-violet-600/25 hover:from-violet-500 hover:to-violet-600"
          >
            <Plus className="h-4 w-4" />
            Nuevo Cliente
          </button>
        }
      />

      {modalOpen && (
        <NewCustomerModal
          onClose={() => setModalOpen(false)}
          onCreated={() => {
            setModalOpen(false);
            load();
          }}
        />
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {error && (
          <p className="px-5 py-4 text-[13px] font-medium text-rose-600 sm:px-6">
            No se pudieron cargar los clientes: {error}
          </p>
        )}

        {!error && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[11.5px] uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-medium sm:px-6">Salón</th>
                  <th className="px-3 py-3 font-medium">Contacto</th>
                  <th className="px-3 py-3 font-medium">Ciudad</th>
                  <th className="px-3 py-3 font-medium text-right">Pedidos</th>
                  <th className="px-3 py-3 font-medium text-right">Gasto total</th>
                  <th className="px-3 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 font-medium text-right sm:px-6">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(customers ?? Array.from({ length: 5 })).map((c, i) => (
                  <tr
                    key={c?.id ?? i}
                    onClick={c ? () => navigate(`/clientes/${c.id}`) : undefined}
                    className={`group text-[13.5px] hover:bg-slate-50/80 ${c ? "cursor-pointer" : ""}`}
                  >
                    {c ? (
                      <>
                        <td className="px-5 py-3.5 sm:px-6">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-50 text-[11px] font-semibold text-violet-600">
                              {c.name
                                .split(" ")
                                .slice(0, 2)
                                .map((w) => w[0])
                                .join("")}
                            </div>
                            <span className="font-medium text-slate-800">{c.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3.5 text-slate-500">{c.contact || "—"}</td>
                        <td className="px-3 py-3.5 text-slate-500">
                          {c.city ? (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-slate-400" />
                              {c.city}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-3 py-3.5 text-right text-slate-600">{c.orderCount}</td>
                        <td className="px-3 py-3.5 text-right font-semibold text-slate-800">
                          ${c.totalSpend.toFixed(2)}
                        </td>
                        <td className="px-3 py-3.5">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                              c.active
                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
                                : "bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200"
                            }`}
                          >
                            {c.active ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right sm:px-6">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/clientes/${c.id}`);
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
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
