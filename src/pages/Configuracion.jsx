import { useEffect, useState } from "react";
import { Pencil, X } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

const roleLabel = { ADMIN: "Admin", BODEGA: "Bodega" };

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

const readOnlyClass =
  "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] text-slate-500";

function ProfileSection() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const dirty = name.trim() !== "" && name !== user?.name;

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await updateProfile({ name: name.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section title="Perfil" subtitle="Información de tu cuenta">
      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-[12.5px] font-medium text-rose-600">
          {error}
        </p>
      )}
      <form onSubmit={handleSave} className="space-y-4">
        <Field label="Nombre">
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Correo electrónico">
          <input className={readOnlyClass} value={user?.email ?? ""} disabled />
        </Field>
        <Field label="Rol">
          <input className={readOnlyClass} value={roleLabel[user?.role] ?? user?.role ?? ""} disabled />
        </Field>
        <button
          type="submit"
          disabled={!dirty || saving}
          className="rounded-lg bg-gradient-to-r from-violet-600 to-violet-700 px-4 py-2 text-[13px] font-semibold text-white shadow-sm shadow-violet-600/25 hover:from-violet-500 hover:to-violet-600 disabled:opacity-50"
        >
          {saving ? "Guardando..." : saved ? "Guardado ✓" : "Guardar nombre"}
        </button>
      </form>
    </Section>
  );
}

function TeamRow({ user, canEdit, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user.name, email: user.email, role: user.role });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const updated = await api.users.update(user.id, form);
      onUpdated(updated);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <form onSubmit={handleSave} className="space-y-2.5 py-3">
        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-[12px] font-medium text-rose-600">
            {error}
          </p>
        )}
        <div className="grid grid-cols-2 gap-2.5">
          <input
            className={inputClass}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nombre"
          />
          <input
            className={inputClass}
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Correo"
          />
        </div>
        <div className="flex items-center gap-2.5">
          <select
            className={`${inputClass} flex-1`}
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="ADMIN">Admin</option>
            <option value="BODEGA">Bodega</option>
          </select>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-violet-600 px-3 py-2 text-[12.5px] font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {saving ? "..." : "Guardar"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
            aria-label="Cancelar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between py-3">
      <div className="min-w-0">
        <p className="truncate text-[13px] font-medium text-slate-800">{user.name}</p>
        <p className="truncate text-[12px] text-slate-400">{user.email}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700">
          {roleLabel[user.role] ?? user.role}
        </span>
        {canEdit && (
          <button
            onClick={() => setEditing(true)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label={`Editar ${user.name}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function TeamSection() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState(null);
  const [error, setError] = useState("");
  const isAdmin = currentUser?.role === "ADMIN";

  useEffect(() => {
    api.users
      .list()
      .then(setUsers)
      .catch((e) => setError(e.message));
  }, []);

  function handleUpdated(updated) {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  }

  return (
    <Section
      title="Equipo"
      subtitle={isAdmin ? "Usuarios con acceso al sistema" : "Usuarios con acceso al sistema (solo Admin puede editar)"}
    >
      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-[12.5px] font-medium text-rose-600">
          {error}
        </p>
      )}
      <div className="divide-y divide-slate-100">
        {(users ?? []).map((u) => (
          <TeamRow key={u.id} user={u} canEdit={isAdmin} onUpdated={handleUpdated} />
        ))}
        {users === null && !error && (
          <div className="space-y-3 py-1">
            <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
          </div>
        )}
      </div>
    </Section>
  );
}

export default function Configuracion() {
  const [notifStock, setNotifStock] = useState(true);
  const [notifVencimiento, setNotifVencimiento] = useState(true);
  const [notifPedidos, setNotifPedidos] = useState(false);

  return (
    <>
      <PageHeader title="Configuración" subtitle="Preferencias de cuenta y del sistema" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ProfileSection />

        <Section title="Negocio" subtitle="Datos generales (próximamente editable)">
          <Field label="Nombre del negocio">
            <input className={readOnlyClass} value="BeautySupply Pro" disabled />
          </Field>
          <Field label="Bodega principal">
            <input className={readOnlyClass} value="Bodega Central" disabled />
          </Field>
          <Field label="Moneda">
            <input className={readOnlyClass} value="USD" disabled />
          </Field>
        </Section>

        <Section title="Notificaciones" subtitle="Preferencias de esta sesión">
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

        <TeamSection />
      </div>
    </>
  );
}
