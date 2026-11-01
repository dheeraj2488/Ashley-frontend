import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/Admin/AdminDashBoard";
import ProtectedRoute from "./routes/ProtectedRoute";
import ProductsPage from "./pages/Admin/ProductsPage";
import CreateProduct from "./pages/Admin/CreateProduct";
import StorefrontPage from "./pages/StorefrontPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import AdminOverview from "./pages/Admin/AdminOverview";
import OrdersPage from "./pages/Admin/OrdersPage";
import CategoriesPage from "./pages/Admin/CategoriesPage";
import { useAppSelector } from "./redux/store";

function App() {
  const isUserLoggedIn = useAppSelector((state) => !!state.auth.token);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<StorefrontPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order/success/:orderId" element={<OrderSuccessPage />} />

          <Route
            path="/admin/login"
            element={
              isUserLoggedIn ? (
                <Navigate to="/admin/dashboard" replace />
              ) : (
                <AdminLogin />
              )
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route path="overview" element={<AdminOverview />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="create-product" element={<CreateProduct />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route index element={<Navigate to="overview" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
