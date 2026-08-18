import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Pencil } from "lucide-react";
import { api } from "../lib/api";

const statusLabel = {
  EN_PREPARACION: "En Preparación",
  EN_TRANSITO: "En Tránsito",
  ENTREGADO: "Entregado",
  PENDIENTE_PAGO: "Pendiente Pago",
};

const statusStyles = {
  EN_PREPARACION: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  EN_TRANSITO: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200",
  ENTREGADO: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  PENDIENTE_PAGO: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
};

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

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  function load() {
    api.customers
      .get(id)
      .then((c) => {
        setCustomer(c);
        setForm({ contact: c.contact || "", city: c.city || "", phone: c.phone || "" });
      })
      .catch((e) => setError(e.message));
  }

  useEffect(load, [id]);

  async function handleSave(e) {
    e.preventDefault();
    setSaveError("");
    setSaving(true);
    try {
      await api.customers.update(id, form);
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
        No se pudo cargar el cliente: {error}
      </p>
    );
  }

  if (!customer) {
    return <div className="h-40 animate-pulse rounded-xl bg-slate-100" />;
  }

  const totalSpend = customer.orders.reduce((sum, o) => sum + Number(o.total), 0);

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
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-50 text-[13px] font-semibold text-violet-600">
              {customer.name
                .split(" ")
                .slice(0, 2)
                .map((w) => w[0])
                .join("")}
            </div>
            <div>
              <h1 className="text-[18px] font-semibold text-slate-900">{customer.name}</h1>
              {customer.city && (
                <p className="flex items-center gap-1 text-[12.5px] text-slate-400">
                  <MapPin className="h-3.5 w-3.5" />
                  {customer.city}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                customer.active
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
                  : "bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200"
              }`}
            >
              {customer.active ? "Activo" : "Inactivo"}
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
            <Field label="Contacto" value={customer.contact || "—"} />
            <Field label="Teléfono" value={customer.phone || "—"} />
            <Field label="Correo" value={customer.email || "—"} />
            <Field label="Pedidos" value={customer.orders.length} />
            <Field label="Gasto total" value={`$${totalSpend.toFixed(2)}`} />
            <Field
              label="Cliente desde"
              value={new Date(customer.createdAt).toLocaleDateString("es-CO")}
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
                  Contacto
                </label>
                <input
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12.5px] font-medium text-slate-600">
                  Teléfono
                </label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
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

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <h2 className="text-[15px] font-semibold text-slate-900">Historial de pedidos</h2>
        </div>
        {customer.orders.length === 0 ? (
          <p className="px-5 py-8 text-center text-[13px] text-slate-400 sm:px-6">
            Este cliente todavía no tiene pedidos.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[11.5px] uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-medium sm:px-6">Pedido</th>
                  <th className="px-3 py-3 font-medium">Fecha</th>
                  <th className="px-3 py-3 font-medium text-right">Total</th>
                  <th className="px-5 py-3 font-medium sm:px-6">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customer.orders.map((o) => (
                  <tr key={o.id} className="text-[13.5px] hover:bg-slate-50/80">
                    <td className="px-5 py-3.5 sm:px-6">
                      <Link
                        to={`/pedidos/${o.id}`}
                        className="font-mono text-[12.5px] font-medium text-violet-600 hover:text-violet-700"
                      >
                        {o.code}
                      </Link>
                    </td>
                    <td className="px-3 py-3.5 text-slate-500">
                      {new Date(o.createdAt).toLocaleDateString("es-CO")}
                    </td>
                    <td className="px-3 py-3.5 text-right font-semibold text-slate-800">
                      ${Number(o.total).toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 sm:px-6">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[o.status]}`}
                      >
                        {statusLabel[o.status]}
                      </span>
                    </td>
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
