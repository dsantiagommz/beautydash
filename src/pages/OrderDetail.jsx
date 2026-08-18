import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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

function Field({ label, value }) {
  return (
    <div>
      <p className="text-[11.5px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-[14px] font-medium text-slate-800">{value}</p>
    </div>
  );
}

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusError, setStatusError] = useState("");

  useEffect(() => {
    api.orders
      .get(id)
      .then(setOrder)
      .catch((e) => setError(e.message));
  }, [id]);

  async function handleStatusChange(e) {
    const nextStatus = e.target.value;
    setStatusError("");
    setStatusSaving(true);
    try {
      await api.orders.updateStatus(id, nextStatus);
      setOrder((prev) => ({ ...prev, status: nextStatus }));
    } catch (err) {
      setStatusError(err.message);
    } finally {
      setStatusSaving(false);
    }
  }

  if (error) {
    return (
      <p className="rounded-lg bg-rose-50 px-4 py-3 text-[13px] font-medium text-rose-600">
        No se pudo cargar el pedido: {error}
      </p>
    );
  }

  if (!order) {
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
            <h1 className="font-mono text-[18px] font-semibold text-slate-900">{order.code}</h1>
            <p className="text-[12.5px] text-slate-400">
              {new Date(order.createdAt).toLocaleString("es-CO")}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <select
              value={order.status}
              onChange={handleStatusChange}
              disabled={statusSaving}
              className={`rounded-full border-0 px-2.5 py-1 text-[11.5px] font-semibold outline-none transition focus:ring-2 focus:ring-violet-300 disabled:opacity-60 ${statusStyles[order.status]}`}
            >
              {Object.entries(statusLabel).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {statusSaving && <span className="text-[11px] text-slate-400">Guardando...</span>}
          </div>
        </div>

        {statusError && (
          <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-[12.5px] font-medium text-rose-600">
            {statusError}
          </p>
        )}

        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
          <Field
            label="Salón / Cliente"
            value={
              <Link
                to={`/clientes/${order.customer.id}`}
                className="text-violet-600 hover:text-violet-700"
              >
                {order.customer.name}
              </Link>
            }
          />
          <Field label="Ciudad" value={order.customer.city || "—"} />
          <Field label="Total" value={`$${Number(order.total).toFixed(2)}`} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <h2 className="text-[15px] font-semibold text-slate-900">Productos del pedido</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[11.5px] uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium sm:px-6">Producto</th>
                <th className="px-3 py-3 font-medium text-right">Cantidad</th>
                <th className="px-3 py-3 font-medium text-right">Precio unitario</th>
                <th className="px-5 py-3 font-medium text-right sm:px-6">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <tr key={item.id} className="text-[13.5px]">
                  <td className="px-5 py-3.5 font-medium text-slate-800 sm:px-6">
                    {item.product.name}
                  </td>
                  <td className="px-3 py-3.5 text-right text-slate-600">{item.quantity}</td>
                  <td className="px-3 py-3.5 text-right text-slate-600">
                    ${Number(item.unitPrice).toFixed(2)}
                  </td>
                  <td className="px-5 py-3.5 text-right font-semibold text-slate-800 sm:px-6">
                    ${(Number(item.unitPrice) * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-200">
                <td colSpan={3} className="px-5 py-3.5 text-right text-[13px] font-semibold text-slate-500 sm:px-6">
                  Total
                </td>
                <td className="px-5 py-3.5 text-right text-[15px] font-bold text-slate-900 sm:px-6">
                  ${Number(order.total).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  );
}
