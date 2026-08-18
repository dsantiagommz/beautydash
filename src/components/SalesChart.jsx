import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { api } from "../lib/api";

const PALETTE = ["#7C3AED", "#F43F5E", "#0EA5E9", "#F59E0B", "#10B981", "#EC4899"];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 shadow-lg shadow-slate-900/10">
      <p className="mb-1.5 text-[12px] font-semibold text-slate-700">{label}</p>
      <div className="space-y-1">
        {payload.map((p) => (
          <div key={p.dataKey} className="flex items-center gap-2 text-[12px]">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-slate-500">{p.name}</span>
            <span className="ml-auto font-semibold text-slate-800">
              ${p.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SalesChart() {
  const [chart, setChart] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.dashboard
      .salesByCategory()
      .then((res) =>
        setChart({
          data: res.data,
          series: res.series.map((s, i) => ({ ...s, color: PALETTE[i % PALETTE.length] })),
        })
      )
      .catch((e) => setError(e.message));
  }, []);

  const series = chart?.series ?? [];

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold text-slate-900">Ventas por Categoría</h2>
          <p className="text-[12.5px] text-slate-400">Últimos 6 meses, en USD</p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {series.map((s) => (
            <div key={s.key} className="flex items-center gap-1.5 text-[12px] text-slate-500">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
              {s.name}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 h-72 shrink-0 sm:h-80">
        {error && (
          <p className="flex h-full items-center justify-center text-[13px] font-medium text-rose-600">
            No se pudo cargar el gráfico: {error}
          </p>
        )}

        {!error && !chart && (
          <div className="h-full w-full animate-pulse rounded-lg bg-slate-100" />
        )}

        {!error && chart && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chart.data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                {series.map((s) => (
                  <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={s.color} stopOpacity={0.28} />
                    <stop offset="95%" stopColor={s.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" vertical={false} />
              <XAxis
                dataKey="mes"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94A3B8", fontSize: 12 }}
                dy={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94A3B8", fontSize: 12 }}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              {series.map((s) => (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.name}
                  stroke={s.color}
                  strokeWidth={2}
                  fill={`url(#grad-${s.key})`}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
