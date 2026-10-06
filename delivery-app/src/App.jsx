import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import BottomTabs from './components/BottomTabs';

// Pages
import Dashboard from './pages/Dashboard';
import AssignedOrders from './pages/AssignedOrders';
import OrderWorkflow from './pages/OrderWorkflow';
import Earnings from './pages/Earnings';
import DeliveryHistory from './pages/DeliveryHistory';
import Login from './pages/Login';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-900 flex justify-center">
          <div className="w-full max-w-md bg-gray-950 min-h-screen relative shadow-2xl">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <AssignedOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workflow/:id"
                element={
                  <ProtectedRoute>
                    <OrderWorkflow />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/earnings"
                element={
                  <ProtectedRoute>
                    <Earnings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <DeliveryHistory />
                  </ProtectedRoute>
                }
              />
            </Routes>
            <BottomTabs />
          </div>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
