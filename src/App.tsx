import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CartProvider } from "@/contexts/CartContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { COMING_SOON_MODE } from "@/config/siteConfig";
import Home from "./pages/Home";
import ComingSoon from "./pages/ComingSoon";
import Collection from "./pages/Collection";
import CategoryPage from "./pages/CategoryPage";
import PillarPage from "./pages/PillarPage";
import { SizeGuidePage } from "./components/SizeGuide";
import ProductDetail from "./pages/ProductDetail";
import LaMarque from "./pages/LaMarque";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import OrderConfirmation from "./pages/OrderConfirmation";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import AdminLogin from "./pages/AdminLogin";
import Account from "./pages/Account";
import { AdminLayout } from "./components/admin/AdminLayout";
import { Dashboard } from "./pages/admin/Dashboard";
import { Products } from "./pages/admin/Products";
import { ProductPreorderConfig } from "./pages/admin/ProductPreorderConfig";
import { ProductImages } from "./pages/admin/ProductImages";
import { Stocks } from "./pages/admin/Stocks";
import { Featured } from "./pages/admin/Featured";
import { Orders } from "./pages/admin/Orders";
import { Invoices } from "./pages/admin/Invoices";
import { Shipments } from "./pages/admin/Shipments";
import { Reports } from "./pages/admin/Reports";
import { Users } from "./pages/admin/Users";
import Emails from "./pages/admin/Emails";
import TvaRates from "./pages/admin/TvaRates";
import ContactRecipients from "./pages/admin/ContactRecipients";
import Newsletter from "./pages/admin/Newsletter";
import PopupNewsletter from "./pages/admin/PopupNewsletter";
import PromoCodes from "./pages/admin/PromoCodes";

const queryClient = new QueryClient();

const App = () => {
  // Coming Soon mode - show landing page without header/footer
  if (COMING_SOON_MODE) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Admin routes still accessible during coming soon */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="products" element={<Products />} />
                <Route path="products/:productId/preorder" element={<ProductPreorderConfig />} />
                <Route path="products/:productId/images" element={<ProductImages />} />
                <Route path="stocks" element={<Stocks />} />
                <Route path="featured" element={<Featured />} />
                <Route path="orders" element={<Orders />} />
                <Route path="invoices" element={<Invoices />} />
                <Route path="shipments" element={<Shipments />} />
                <Route path="emails" element={<Emails />} />
                <Route path="tva" element={<TvaRates />} />
                <Route path="contact-recipients" element={<ContactRecipients />} />
                <Route path="newsletter" element={<Newsletter />} />
                <Route path="popup-newsletter" element={<PopupNewsletter />} />
                <Route path="promo-codes" element={<PromoCodes />} />
                <Route path="reports" element={<Reports />} />
                <Route path="users" element={<Users />} />
              </Route>
              {/* All other routes show Coming Soon */}
              <Route path="*" element={<ComingSoon />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Normal mode - full website
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth routes (no header/footer) */}
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/account" element={<Account />} />

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="products/:productId/preorder" element={<ProductPreorderConfig />} />
              <Route path="products/:productId/images" element={<ProductImages />} />
              <Route path="stocks" element={<Stocks />} />
              <Route path="featured" element={<Featured />} />
              <Route path="orders" element={<Orders />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="shipments" element={<Shipments />} />
              <Route path="emails" element={<Emails />} />
              <Route path="tva" element={<TvaRates />} />
              <Route path="contact-recipients" element={<ContactRecipients />} />
              <Route path="newsletter" element={<Newsletter />} />
              <Route path="popup-newsletter" element={<PopupNewsletter />} />
              <Route path="promo-codes" element={<PromoCodes />} />
              <Route path="reports" element={<Reports />} />
              <Route path="users" element={<Users />} />
            </Route>

            {/* Public routes with Header/Footer */}
            <Route path="*" element={
              <LanguageProvider>
                <CartProvider>
                  <div className="flex flex-col min-h-screen">
                    <Header />
                    <div className="flex-1">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/collection" element={<Collection />} />
                        {/* Redirects SEO (fallback SPA) */}
                        <Route
                          path="/bottes-plates-grande-taille"
                          element={<Navigate to="/bottes-grande-taille-femme" replace />}
                        />
                        <Route
                          path="/bottes-plates-grande-taille/"
                          element={<Navigate to="/bottes-grande-taille-femme" replace />}
                        />
                        <Route
                          path="/chaussures-plates-grande-taille"
                          element={<Navigate to="/ballerines-grande-taille-femme" replace />}
                        />
                        <Route
                          path="/chaussures-plates-grande-taille/"
                          element={<Navigate to="/ballerines-grande-taille-femme" replace />}
                        />

                        {/* Routes SEO-friendly pour les catégories */}
                        <Route
                          path="/bottines-grande-taille-femme"
                          element={<CategoryPage slug="bottines-grande-taille-femme" />}
                        />
                        <Route
                          path="/bottes-grande-taille-femme"
                          element={<CategoryPage slug="bottes-grande-taille-femme" />}
                        />
                        <Route
                          path="/ballerines-grande-taille-femme"
                          element={<CategoryPage slug="ballerines-grande-taille-femme" />}
                        />
                        {/* Page pilier SEO principale */}
                        <Route path="/chaussures-femme-grande-taille" element={<PillarPage />} />
                        <Route path="/guide-des-tailles" element={<SizeGuidePage />} />
                        <Route path="/produit/:slug" element={<ProductDetail />} />
                        <Route path="/la-marque" element={<LaMarque />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/panier" element={<Cart />} />
                        <Route path="/order-confirmation" element={<OrderConfirmation />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </div>
                    <Footer />
                  </div>
                </CartProvider>
              </LanguageProvider>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
