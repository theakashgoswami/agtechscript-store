import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import ProductPage from "./pages/ProductPage";
import CategoryPage from "./pages/CategoryPage";
import SearchPage from "./pages/SearchPage";
import CheckoutPage from "./pages/CheckoutPage";
import LoginPage from "./pages/LoginPage";
import OrdersPage from "./pages/OrdersPage";
import NotFoundPage from "./pages/NotFoundPage";

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Layout wrapper (header + content + footer)
function AppLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <ScrollToTop />
            <Routes>
              {/* Auth pages (no header/footer) */}
              <Route path="/login" element={<LoginPage />} />

              {/* Main layout */}
              <Route
                path="/"
                element={
                  <AppLayout>
                    <HomePage />
                  </AppLayout>
                }
              />
              <Route
                path="/product/:id"
                element={
                  <AppLayout>
                    <ProductPage />
                  </AppLayout>
                }
              />
              <Route
                path="/category/:name"
                element={
                  <AppLayout>
                    <CategoryPage />
                  </AppLayout>
                }
              />
              <Route
                path="/search"
                element={
                  <AppLayout>
                    <SearchPage />
                  </AppLayout>
                }
              />
              <Route
                path="/checkout"
                element={
                  <AppLayout>
                    <CheckoutPage />
                  </AppLayout>
                }
              />
              <Route
                path="/orders"
                element={
                  <AppLayout>
                    <OrdersPage />
                  </AppLayout>
                }
              />
              <Route
                path="*"
                element={
                  <AppLayout>
                    <NotFoundPage />
                  </AppLayout>
                }
              />
            </Routes>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
