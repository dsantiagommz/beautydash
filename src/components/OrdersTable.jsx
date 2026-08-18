import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
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

export default function OrdersTable() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.orders
      .list()
      .then((data) => setOrders(data.slice(0, 6)))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-[15px] font-semibold text-slate-900">Pedidos Recientes</h2>
          <p className="text-[12.5px] text-slate-400">Últimos pedidos registrados</p>
        </div>
        <button
          onClick={() => navigate("/pedidos")}
          className="text-[12.5px] font-semibold text-violet-600 hover:text-violet-700"
        >
          Ver todos
        </button>
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
              {(orders ?? Array.from({ length: 4 })).map((order, i) => (
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
                          {statusLabel[order.status]}
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
                    Todavía no hay pedidos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
