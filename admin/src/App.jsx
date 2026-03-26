import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "./pages/AdminLayout";
import AdminLogin from "./pages/AdminLogin";
import CategoriesPage from "./pages/CategoriesPage";
import SubCategoriesPage from "./pages/SubCategoriesPage";
import ModelsPage from "./pages/ModelsPage";
import YearsPage from "./pages/YearsPage";
import TrimsPage from "./pages/TrimsPage";
import DashboardPage from "./pages/DashboardPage";
import MyAccountPage from "./pages/MyAccountPage";
import PermissionsPage from "./pages/PermissionsPage";
import ProductsPage from "./pages/ProductsPage";
import UsersPage from "./pages/UsersPage";
import OrdersPage from "./pages/OrdersPage";
import ContactQueriesPage from "./pages/ContactQueriesPage";
import { AdminAuthProvider, useAdminAuth } from "./context/AuthContext";
import { ToastContainer, Slide } from "react-toastify";
import { canAccessPath, getFirstAccessiblePath } from "./utils/rbac";

function RequireAuth({ children }) {
  const { isLoggedIn } = useAdminAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
}

function RequirePermission({ path, children }) {
  const { admin } = useAdminAuth();
  if (!canAccessPath(admin, path)) {
    return <Navigate to={getFirstAccessiblePath(admin)} replace />;
  }
  return children;
}

function AppRoutes() {
  const { admin } = useAdminAuth();
  const defaultPath = getFirstAccessiblePath(admin);

  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />

      <Route element={<RequireAuth><AdminLayout /></RequireAuth>}>
        <Route path="/" element={<Navigate to={defaultPath} replace />} />
        <Route path="/dashboard" element={<RequirePermission path="/dashboard"><DashboardPage /></RequirePermission>} />
        <Route path="/users" element={<RequirePermission path="/users"><UsersPage /></RequirePermission>} />
        <Route path="/categories" element={<RequirePermission path="/categories"><CategoriesPage /></RequirePermission>} />
        <Route path="/sub-categories" element={<RequirePermission path="/sub-categories"><SubCategoriesPage /></RequirePermission>} />
        <Route path="/models" element={<RequirePermission path="/models"><ModelsPage /></RequirePermission>} />
        <Route path="/years" element={<RequirePermission path="/years"><YearsPage /></RequirePermission>} />
        <Route path="/trims" element={<RequirePermission path="/trims"><TrimsPage /></RequirePermission>} />
        <Route path="/products" element={<RequirePermission path="/products"><ProductsPage /></RequirePermission>} />
        <Route path="/orders" element={<RequirePermission path="/orders"><OrdersPage /></RequirePermission>} />
        <Route path="/contact-queries" element={<RequirePermission path="/contact-queries"><ContactQueriesPage /></RequirePermission>} />
        <Route path="/permissions" element={<RequirePermission path="/permissions"><PermissionsPage /></RequirePermission>} />
        <Route path="/my-account" element={<RequirePermission path="/my-account"><MyAccountPage /></RequirePermission>} />
      </Route>

      <Route path="*" element={<Navigate to={defaultPath} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AdminAuthProvider>
      <AppRoutes />
      <ToastContainer
        position="top-right"
        autoClose={2800}
        newestOnTop
        closeOnClick
        pauseOnHover
        hideProgressBar={true}
        toastClassName="admin-toast"
        bodyClassName="admin-toast-body"
        progressClassName="admin-toast-progress"
        transition={Slide}
      />
    </AdminAuthProvider>
  );
}

export default App;
