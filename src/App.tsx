import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CartProvider } from "@/contexts/CartContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Home from "./pages/Home";
import Collection from "./pages/Collection";
import ProductDetail from "./pages/ProductDetail";
import LaMarque from "./pages/LaMarque";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import OrderConfirmation from "./pages/OrderConfirmation";
import NotFound from "./pages/NotFound";
import { AdminLayout } from "./components/admin/AdminLayout";
import { Dashboard } from "./pages/admin/Dashboard";
import { Products } from "./pages/admin/Products";
import { Orders } from "./pages/admin/Orders";
import { Invoices } from "./pages/admin/Invoices";
import { Shipments } from "./pages/admin/Shipments";
import { Users } from "./pages/admin/Users";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="shipments" element={<Shipments />} />
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

export default App;
