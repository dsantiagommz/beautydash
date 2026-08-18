import { useState } from "react";
import PageHeader from "../components/PageHeader";

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        checked ? "bg-violet-600" : "bg-slate-200"
      }`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
          checked ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>
      {subtitle && <p className="text-[12.5px] text-slate-400">{subtitle}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12.5px] font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] text-slate-700 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100";

export default function Configuracion() {
  const [notifStock, setNotifStock] = useState(true);
  const [notifVencimiento, setNotifVencimiento] = useState(true);
  const [notifPedidos, setNotifPedidos] = useState(false);

  return (
    <>
      <PageHeader title="Configuración" subtitle="Preferencias de cuenta y del sistema" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Section title="Perfil" subtitle="Información de tu cuenta">
          <Field label="Nombre">
            <input className={inputClass} defaultValue="David Santiago" />
          </Field>
          <Field label="Correo electrónico">
            <input className={inputClass} defaultValue="dsantiagommz@gmail.com" />
          </Field>
          <Field label="Rol">
            <select className={inputClass} defaultValue="Admin">
              <option>Admin</option>
              <option>Bodega</option>
            </select>
          </Field>
        </Section>

        <Section title="Negocio" subtitle="Datos generales de BeautySupply Pro">
          <Field label="Nombre del negocio">
            <input className={inputClass} defaultValue="BeautySupply Pro" />
          </Field>
          <Field label="Bodega principal">
            <input className={inputClass} defaultValue="Bodega Central" />
          </Field>
          <Field label="Moneda">
            <select className={inputClass} defaultValue="USD">
              <option>USD</option>
              <option>COP</option>
              <option>MXN</option>
            </select>
          </Field>
        </Section>

        <Section title="Notificaciones" subtitle="Cuándo quieres recibir alertas">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-slate-700">Stock bajo mínimo</p>
              <p className="text-[12px] text-slate-400">Avisar cuando un producto llegue al mínimo</p>
            </div>
            <Toggle checked={notifStock} onChange={setNotifStock} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-slate-700">Próximos vencimientos</p>
              <p className="text-[12px] text-slate-400">Avisar con 15 días de anticipación</p>
            </div>
            <Toggle checked={notifVencimiento} onChange={setNotifVencimiento} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-slate-700">Nuevos pedidos</p>
              <p className="text-[12px] text-slate-400">Avisar apenas se registre un pedido nuevo</p>
            </div>
            <Toggle checked={notifPedidos} onChange={setNotifPedidos} />
          </div>
        </Section>

        <Section title="Equipo" subtitle="Usuarios con acceso al sistema">
          <div className="divide-y divide-slate-100">
            {[
              { name: "David Santiago", role: "Admin", email: "dsantiagommz@gmail.com" },
              { name: "Equipo de Bodega", role: "Bodega", email: "bodega@beautysupplypro.com" },
            ].map((u) => (
              <div key={u.email} className="flex items-center justify-between py-3 first:pt-0">
                <div>
                  <p className="text-[13px] font-medium text-slate-800">{u.name}</p>
                  <p className="text-[12px] text-slate-400">{u.email}</p>
                </div>
                <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <div className="flex justify-end">
        <button className="rounded-lg bg-gradient-to-r from-violet-600 to-violet-700 px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm shadow-violet-600/25 hover:from-violet-500 hover:to-violet-600">
          Guardar cambios
        </button>
      </div>
    </>
  );
}
