import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import NewOrderModal from "./NewOrderModal";
import { Plus, Package } from "lucide-react";

const titles = {
  "/": {
    title: "Dashboard de Operaciones",
    subtitle: "Resumen general de ventas, inventario y pedidos",
  },
  "/inventario": {
    title: "Inventario",
    subtitle: "Catálogo de productos y niveles de stock",
  },
  "/pedidos": {
    title: "Pedidos",
    subtitle: "Seguimiento de pedidos de salones y clientes",
  },
  "/clientes": {
    title: "Clientes",
    subtitle: "Salones y negocios registrados",
  },
  "/envios": {
    title: "Envíos & Rutas",
    subtitle: "Estado de despachos y rutas de entrega",
  },
  "/reportes": {
    title: "Reportes",
    subtitle: "Indicadores clave del negocio",
  },
  "/configuracion": {
    title: "Configuración",
    subtitle: "Preferencias de cuenta y del sistema",
  },
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const base = "/" + location.pathname.split("/")[1];
  const meta = titles[location.pathname] ?? titles[base] ?? { title: "BeautySupply Pro" };

  function handleOrderCreated() {
    setNewOrderOpen(false);
    if (location.pathname === "/pedidos" || location.pathname === "/") {
      navigate(0);
    } else {
      navigate("/pedidos");
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          onOpenSidebar={() => setSidebarOpen(true)}
          title={meta.title}
          subtitle={meta.subtitle}
          onNewOrder={() => setNewOrderOpen(true)}
        />

        <main className="flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>

      {newOrderOpen && (
        <NewOrderModal onClose={() => setNewOrderOpen(false)} onCreated={handleOrderCreated} />
      )}

      <div className="fixed bottom-6 right-6 z-30 flex flex-col gap-2 md:hidden">
        <button
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-600 shadow-lg shadow-slate-900/15 ring-1 ring-slate-200"
          aria-label="Reabastecer stock"
        >
          <Package className="h-5 w-5" />
        </button>
        <button
          onClick={() => setNewOrderOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-rose-500 text-white shadow-lg shadow-violet-600/30"
          aria-label="Nuevo pedido"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
