import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./pages/partials/Header";
import Footer from "./pages/partials/Footer";
import { useEffect } from "react";
import Home from "./pages/Home";

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

function App() {

  return (
    <>
      <Header />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App
