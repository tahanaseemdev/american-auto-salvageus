import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Header from "./pages/partials/Header";
import Footer from "./pages/partials/Footer";
import { useEffect } from "react";
import Home from "./pages/Home";
import About from "./pages/About";
import Shop from "./pages/Shop";
// import OrderTracking from "./pages/OrderTracking";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Returns from "./pages/Returns";
import ProductDetail from "./pages/ProductDetail";
import ProductInquiry from "./pages/ProductInquiry";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { BsWhatsapp } from "react-icons/bs";

const WHATSAPP_CHAT_URL = "https://wa.me/17089002524";

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
        <Route path="/shop/part/:partId" element={<Shop />} />
        <Route path="/shop/part/:partId/make/:makeId" element={<Shop />} />
        <Route path="/shop/part/:partId/make/:makeId/model/:modelId" element={<Shop />} />
        <Route path="/shop/part/:partId/make/:makeId/model/:modelId/year/:yearId" element={<Shop />} />
        <Route path="/shop/part/:partId/make/:makeId/model/:modelId/year/:yearId/trim/:trimId" element={<Shop />} />
        <Route path="/shop/category/:categoryId" element={<Shop />} />
        <Route path="/shop/category/:categoryId/subcategory/:subCategoryId" element={<Shop />} />
        <Route path="/shop/category/:categoryId/subcategory/:subCategoryId/model/:modelId" element={<Shop />} />
        <Route path="/shop/category/:categoryId/subcategory/:subCategoryId/model/:modelId/year/:yearId" element={<Shop />} />
        <Route path="/shop/category/:categoryId/subcategory/:subCategoryId/model/:modelId/year/:yearId/trim/:trimId" element={<Shop />} />
        <Route path="/product/:productId" element={<ProductDetail />} />
        <Route path="/product/:productId/call-now" element={<ProductInquiry />} />
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

      <a
        href={WHATSAPP_CHAT_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-5 right-5 z-50 w-13 h-13 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_16px_32px_rgba(0,0,0,0.25)] hover:scale-105 transition-transform"
      >
        <BsWhatsapp size={28} />
      </a>

      {showFooter && <Footer />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

export default App;
