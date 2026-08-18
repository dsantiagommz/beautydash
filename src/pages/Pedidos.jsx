import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreHorizontal, Plus } from "lucide-react";
import PageHeader from "../components/PageHeader";
import NewOrderModal from "../components/NewOrderModal";
import { api } from "../lib/api";

const statuses = [
  { key: "", label: "Todos" },
  { key: "EN_PREPARACION", label: "En Preparación" },
  { key: "EN_TRANSITO", label: "En Tránsito" },
  { key: "ENTREGADO", label: "Entregado" },
  { key: "PENDIENTE_PAGO", label: "Pendiente Pago" },
];

const statusStyles = {
  EN_PREPARACION: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  EN_TRANSITO: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200",
  ENTREGADO: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  PENDIENTE_PAGO: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
};

export default function Pedidos() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("");
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  function load() {
    api.orders
      .list(status ? { status } : {})
      .then(setOrders)
      .catch((e) => setError(e.message));
  }

  useEffect(load, [status]);

  return (
    <>
      <PageHeader
        title="Pedidos"
        subtitle={
          orders
            ? `${orders.length} pedido${orders.length !== 1 ? "s" : ""} registrado${orders.length !== 1 ? "s" : ""}`
            : "Cargando..."
        }
        actions={
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-violet-700 px-3.5 py-2 text-[13px] font-semibold text-white shadow-sm shadow-violet-600/25 hover:from-violet-500 hover:to-violet-600"
          >
            <Plus className="h-4 w-4" />
            Nuevo Pedido
          </button>
        }
      />

      {modalOpen && (
        <NewOrderModal
          onClose={() => setModalOpen(false)}
          onCreated={() => {
            setModalOpen(false);
            load();
          }}
        />
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap gap-1.5 border-b border-slate-100 p-4 sm:p-5">
          {statuses.map((s) => (
            <button
              key={s.key}
              onClick={() => setStatus(s.key)}
              className={`rounded-full px-3 py-1.5 text-[12.5px] font-medium transition ${
                status === s.key
                  ? "bg-violet-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {error && (
          <p className="px-5 py-4 text-[13px] font-medium text-rose-600 sm:px-6">
            No se pudieron cargar los pedidos: {error}
          </p>
        )}

        {!error && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[11.5px] uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-medium sm:px-6">Pedido</th>
                  <th className="px-3 py-3 font-medium">Salón / Cliente</th>
                  <th className="px-3 py-3 font-medium">Ítems</th>
                  <th className="px-3 py-3 font-medium text-right">Cant.</th>
                  <th className="px-3 py-3 font-medium text-right">Total</th>
                  <th className="px-3 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 font-medium text-right sm:px-6">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(orders ?? Array.from({ length: 6 })).map((order, i) => (
                  <tr
                    key={order?.id ?? i}
                    onClick={order ? () => navigate(`/pedidos/${order.id}`) : undefined}
                    className={`group text-[13.5px] hover:bg-slate-50/80 ${order ? "cursor-pointer" : ""}`}
                  >
                    {order ? (
                      <>
                        <td className="whitespace-nowrap px-5 py-3.5 font-mono text-[12.5px] font-medium text-slate-500 sm:px-6">
                          {order.code}
                        </td>
                        <td className="px-3 py-3.5 font-medium text-slate-800">
                          {order.customer.name}
                        </td>
                        <td className="px-3 py-3.5 text-slate-500">
                          {order.items.length} producto{order.items.length !== 1 ? "s" : ""}
                        </td>
                        <td className="px-3 py-3.5 text-right text-slate-600">
                          {order.items.reduce((sum, it) => sum + it.quantity, 0)} ítems
                        </td>
                        <td className="px-3 py-3.5 text-right font-semibold text-slate-800">
                          ${Number(order.total).toFixed(2)}
                        </td>
                        <td className="px-3 py-3.5">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[order.status]}`}
                          >
                            {statuses.find((s) => s.key === order.status)?.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right sm:px-6">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/pedidos/${order.id}`);
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
                {orders && orders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-[13px] text-slate-400">
                      No hay pedidos con ese estado.
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
