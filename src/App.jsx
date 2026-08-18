import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import RequireAuth from "./components/RequireAuth";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inventario from "./pages/Inventario";
import ProductDetail from "./pages/ProductDetail";
import Pedidos from "./pages/Pedidos";
import OrderDetail from "./pages/OrderDetail";
import Clientes from "./pages/Clientes";
import CustomerDetail from "./pages/CustomerDetail";
import Envios from "./pages/Envios";
import Reportes from "./pages/Reportes";
import Configuracion from "./pages/Configuracion";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventario" element={<Inventario />} />
            <Route path="/inventario/:id" element={<ProductDetail />} />
            <Route path="/pedidos" element={<Pedidos />} />
            <Route path="/pedidos/:id" element={<OrderDetail />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/clientes/:id" element={<CustomerDetail />} />
            <Route path="/envios" element={<Envios />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/configuracion" element={<Configuracion />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
