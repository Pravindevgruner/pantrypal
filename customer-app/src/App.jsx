import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import BottomTabs from './components/BottomTabs';

// Pages
import Home from './pages/Home';
import CategoriesPage from './pages/CategoriesPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccess from './pages/OrderSuccess';
import OrdersPage from './pages/OrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import SmartExpiryDashboard from './pages/SmartExpiryDashboard';
import HouseholdInventory from './pages/HouseholdInventory';
import ProductDetails from './pages/ProductDetails';
import WishlistPage from './pages/WishlistPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-gray-100 flex justify-center">
            <div className="w-full max-w-md bg-gray-50 min-h-screen relative shadow-2xl">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/orders/:id" element={<OrderDetailsPage />} />
                <Route path="/expiry" element={<SmartExpiryDashboard />} />
                <Route path="/household-inventory" element={<HouseholdInventory />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Routes>
              <BottomTabs />
            </div>
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
