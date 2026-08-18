import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DollarSign, ShoppingBag, Users, TriangleAlert, ChevronRight } from "lucide-react";
import SalesChart from "../components/SalesChart";
import OrdersTable from "../components/OrdersTable";
import { api } from "../lib/api";

const levelStyles = {
  critical: "bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-200",
  out: "bg-rose-900/90 text-white ring-1 ring-inset ring-rose-900",
};

function alertLevel(p) {
  if (p.stock === 0) return { level: "out", label: "Agotado" };
  return { level: "critical", label: "Stock bajo" };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.dashboard
      .summary()
      .then(setSummary)
      .catch((e) => setError(e.message));
  }, []);

  const kpis = summary
    ? [
        {
          label: "Ventas totales (mes)",
          value: `$${summary.totalSales.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
          icon: DollarSign,
        },
        {
          label: "Pedidos activos",
          value: summary.activeOrders,
          icon: ShoppingBag,
        },
        {
          label: "Clientes activos",
          value: summary.activeCustomers,
          icon: Users,
        },
        {
          label: "Alertas de stock",
          value: summary.stockAlerts,
          icon: TriangleAlert,
          alert: summary.stockAlerts > 0,
        },
      ]
    : [];

  return (
    <>
      {error && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-[13px] font-medium text-rose-600">
          No se pudo cargar el resumen: {error}
        </p>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(summary ? kpis : Array.from({ length: 4 })).map((kpi, i) => (
          <div
            key={kpi?.label ?? i}
            className="animate-fade-in-up rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {kpi ? (
              <>
                <div className="flex items-start justify-between">
                  <p className="text-[13px] font-medium text-slate-500">{kpi.label}</p>
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      kpi.alert ? "bg-rose-50 text-rose-500" : "bg-violet-50 text-violet-600"
                    }`}
                  >
                    <kpi.icon className="h-4 w-4" strokeWidth={2.25} />
                  </span>
                </div>
                <p className="mt-3 text-[26px] font-bold tracking-tight text-slate-900">
                  {kpi.value}
                </p>
              </>
            ) : (
              <div className="h-[70px] animate-pulse rounded-lg bg-slate-100" />
            )}
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[65fr_35fr]">
        <SalesChart />

        <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-slate-900">Alertas de Inventario</h2>
            {summary && summary.stockAlertItems.length > 0 && (
              <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11.5px] font-semibold text-rose-600">
                {summary.stockAlertItems.length} activa
                {summary.stockAlertItems.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <ul className="mt-3 flex-1 divide-y divide-slate-100">
            {summary?.stockAlertItems.map((item) => {
              const { level, label } = alertLevel(item);
              return (
                <li key={item.id} className="flex items-center gap-3 py-3 first:pt-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-medium text-slate-800">
                      {item.name}
                    </p>
                    <p className="text-[12px] text-slate-400">
                      {item.sku} · Stock: {item.stock} / Mínimo {item.minStock}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${levelStyles[level]}`}
                  >
                    {label}
                  </span>
                </li>
              );
            })}
            {summary && summary.stockAlertItems.length === 0 && (
              <li className="py-6 text-center text-[13px] text-slate-400">
                No hay alertas de stock por ahora.
              </li>
            )}
          </ul>

          <button
            onClick={() => navigate("/inventario")}
            className="mt-3 flex items-center justify-center gap-1 rounded-lg border border-slate-200 py-2 text-[12.5px] font-semibold text-slate-500 hover:bg-slate-50"
          >
            Ver inventario completo
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </section>

      <OrdersTable />
    </>
  );
}
