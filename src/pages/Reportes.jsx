import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import SalesChart from "../components/SalesChart";
import { api } from "../lib/api";

export default function Reportes() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.dashboard
      .summary()
      .then(setSummary)
      .catch((e) => setError(e.message));
  }, []);

  const cards = summary
    ? [
        {
          label: "Ingresos del mes",
          value: `$${summary.totalSales.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
        },
        {
          label: "Pedidos del mes",
          value: summary.monthlyOrderCount,
        },
        {
          label: "Ticket promedio",
          value:
            summary.monthlyOrderCount > 0
              ? `$${summary.averageOrderValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
              : "—",
        },
        {
          label: "Clientes activos",
          value: summary.activeCustomers,
        },
      ]
    : [];

  return (
    <>
      <PageHeader title="Reportes" subtitle="Indicadores clave del negocio, este mes" />

      {error && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-[13px] font-medium text-rose-600">
          No se pudieron cargar los indicadores: {error}
        </p>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(summary ? cards : Array.from({ length: 4 })).map((card, i) => (
          <div key={card?.label ?? i} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            {card ? (
              <>
                <p className="text-[13px] font-medium text-slate-500">{card.label}</p>
                <p className="mt-2 text-[22px] font-bold tracking-tight text-slate-900">
                  {card.value}
                </p>
              </>
            ) : (
              <div className="h-[52px] animate-pulse rounded-lg bg-slate-100" />
            )}
          </div>
        ))}
      </section>

      <SalesChart />

      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center">
        <p className="text-[13px] font-medium text-slate-500">
          Productos más vendidos y tasa de recompra
        </p>
        <p className="mt-1 text-[12.5px] text-slate-400">
          Estos indicadores se activarán cuando haya suficiente historial de pedidos.
        </p>
      </div>
    </>
  );
}
