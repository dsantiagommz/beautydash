import { NavLink } from "react-router-dom";
import {
  Sparkles,
  LayoutDashboard,
  Boxes,
  ShoppingCart,
  Users,
  Truck,
  BarChart3,
  Settings,
  X,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/" },
  { label: "Inventario", icon: Boxes, to: "/inventario" },
  { label: "Pedidos", icon: ShoppingCart, to: "/pedidos" },
  { label: "Clientes", icon: Users, to: "/clientes" },
  { label: "Envíos & Rutas", icon: Truck, to: "/envios" },
  { label: "Reportes", icon: BarChart3, to: "/reportes" },
  { label: "Configuración", icon: Settings, to: "/configuracion" },
];

const roleLabel = { ADMIN: "Admin", BODEGA: "Bodega" };

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const initials = user?.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
    : "";

  return (
    <>
      {open && (
        <button
          aria-label="Cerrar menú"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-slate-900 transition-transform duration-300 ease-out lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 pt-7 pb-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-rose-500 shadow-lg shadow-violet-950/40">
              <Sparkles className="h-4.5 w-4.5 text-white" strokeWidth={2.25} />
            </span>
            <div className="leading-none">
              <p className="font-display text-lg italic text-white">BeautySupply</p>
              <p className="text-[11px] font-semibold tracking-[0.2em] text-violet-300">
                PRO
              </p>
            </div>
          </div>
          <button
            aria-label="Cerrar menú"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
                  isActive
                    ? "bg-white/[0.06] text-white"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-100"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-violet-400 to-rose-400" />
                  )}
                  <item.icon
                    className={`h-[18px] w-[18px] ${
                      isActive ? "text-violet-300" : "text-slate-500 group-hover:text-slate-300"
                    }`}
                    strokeWidth={2}
                  />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mx-4 mb-4 mt-2 flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-rose-500 text-[13px] font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[13px] font-semibold text-white">{user?.name}</p>
            <p className="text-[11.5px] text-slate-400">{roleLabel[user?.role] ?? user?.role}</p>
          </div>
          <button
            onClick={logout}
            aria-label="Cerrar sesión"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>
    </>
  );
}
