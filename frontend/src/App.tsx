import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Ornaments from "./pages/Ornaments";
import Collections from "./pages/Collections";
import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";
import Checkout from "./pages/Checkout";
import Dashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminInventory from "./pages/admin/Inventory";
import AdminUsers from "./pages/admin/Users";
import AdminOrders from "./pages/admin/Orders";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Orders from "./pages/Orders";
import Chatbot from "./components/Chatbot";
import ProductDetail from "./pages/ProductDetail";

import { CartProvider } from "./hooks/use-cart";
import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";
import { QuickViewProvider } from "./context/QuickViewContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <QuickViewProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <Chatbot />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/ornaments" element={<Ornaments />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/product/:id/:slug" element={<ProductDetail />} />
                  <Route path="/collections" element={<Collections />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route element={<ProtectedRoute />}>
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/orders" element={<Orders />} />
                  </Route>

                  <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                    <Route path="/admin/dashboard" element={<Dashboard />} />
                    <Route path="/admin/products" element={<AdminProducts />} />
                    <Route path="/admin/inventory" element={<AdminInventory />} />
                    <Route path="/admin/users" element={<AdminUsers />} />
                    <Route path="/admin/orders" element={<AdminOrders />} />
                  </Route>

                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </TooltipProvider>
            </QuickViewProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
