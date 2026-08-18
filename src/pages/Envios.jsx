import { useEffect, useState } from "react";
import { Truck, MapPin, Clock } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { api } from "../lib/api";

const statusLabel = {
  PENDIENTE: "Pendiente",
  PROGRAMADO: "Programado",
  EN_RUTA: "En Ruta",
  ENTREGADO: "Entregado",
};

const statusStyles = {
  EN_RUTA: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200",
  ENTREGADO: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  PROGRAMADO: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  PENDIENTE: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
};

export default function Envios() {
  const [shipments, setShipments] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.shipments
      .list()
      .then(setShipments)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <PageHeader
        title="Envíos & Rutas"
        subtitle={shipments ? `${shipments.length} despachos en seguimiento` : "Cargando..."}
      />

      {error && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-[13px] font-medium text-rose-600">
          No se pudieron cargar los envíos: {error}
        </p>
      )}

      {!error && shipments && shipments.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">
          <Truck className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-[14px] font-medium text-slate-600">
            Todavía no hay envíos registrados
          </p>
          <p className="text-[12.5px] text-slate-400">
            Los envíos aparecen aquí cuando asignas un despacho a un pedido.
          </p>
        </div>
      )}

      {!error && (shipments === null || shipments.length > 0) && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {(shipments ?? Array.from({ length: 4 })).map((s, i) => (
            <div key={s?.id ?? i} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              {s ? (
                <>
                  <div className="flex items-start justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                      <Truck className="h-4.5 w-4.5" strokeWidth={2.25} />
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[s.status]}`}
                    >
                      {statusLabel[s.status]}
                    </span>
                  </div>
                  <p className="mt-3 text-[14px] font-semibold text-slate-800">
                    {s.order.customer.name}
                  </p>
                  <p className="text-[12.5px] text-slate-400">Pedido {s.order.code}</p>

                  <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {s.city || "Sin ciudad"}
                    </div>
                    <div className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {s.eta ? new Date(s.eta).toLocaleString("es-CO") : "Por definir"}
                    </div>
                    <p className="text-[12.5px] text-slate-400">
                      Conductor: <span className="text-slate-600">{s.driver || "Sin asignar"}</span>
                    </p>
                  </div>
                </>
              ) : (
                <div className="h-32 animate-pulse rounded-lg bg-slate-100" />
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
