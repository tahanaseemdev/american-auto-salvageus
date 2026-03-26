import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Header from "./pages/partials/Header";
import Footer from "./pages/partials/Footer";
import { useEffect } from "react";
import Home from "./pages/Home";
import About from "./pages/About";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
// import OrderTracking from "./pages/OrderTracking";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Returns from "./pages/Returns";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

function ScrollToTop() {
  const location = useLocation();

  useEffect(function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, [location.pathname]);

  return null;
}

// Pages that should not render the footer (full-screen auth pages)
const NO_FOOTER_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];

function RequireAuth({ children }) {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
}

function AppInner() {
  const location = useLocation();
  const showFooter = !NO_FOOTER_PATHS.includes(location.pathname);

  return (
    <>
      <Header />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/category/:categoryId" element={<Shop />} />
        <Route path="/shop/category/:categoryId/subcategory/:subCategoryId" element={<Shop />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        {/* <Route path="/tracking" element={<OrderTracking />} /> */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/returns" element={<Returns />} />
      </Routes>
      {showFooter && <Footer />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppInner />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
