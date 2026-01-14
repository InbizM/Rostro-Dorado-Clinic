import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import ProductsPage from './components/ProductsPage';
import ProductDetailsPage from './components/ProductDetailsPage';

import { CartProvider } from './context/CartContext';
import CartDrawer from './components/Cart/CartDrawer';
import CheckoutPage from './components/Checkout/CheckoutPage';

import { AuthProvider } from './context/AuthContext';
import LoginPage from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';

import ProtectedRoute from './components/Auth/ProtectedRoute';
import AdminRoute from './components/Auth/AdminRoute'; // Imported
import AdminDashboard from './components/Admin/AdminDashboard'; // Imported
import OrdersPage from './components/Profile/OrdersPage';
import ToastContainer from './components/ToastContainer'; // Imported
import LoginVerifyPage from './components/Auth/LoginVerifyPage'; // Imported
import TerminosCondiciones from './components/Legal/TerminosCondiciones';
import PoliticaPrivacidad from './components/Legal/PoliticaPrivacidad';
import PoliticaEnvios from './components/Legal/PoliticaEnvios';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ToastContainer />
          <CartDrawer />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/productos" element={<ProductsPage />} />
            <Route path="/productos/:id" element={<ProductDetailsPage />} />

            <Route path="/mis-pedidos" element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            } />

            {/* Changed: Checkout is now publicly accessible for Guest Checkout */}
            <Route path="/checkout" element={<CheckoutPage />} />

            <Route path="/admin/*" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/verify-login" element={<LoginVerifyPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Legal Pages */}
            <Route path="/terminos-y-condiciones" element={<TerminosCondiciones />} />
            <Route path="/politica-de-privacidad" element={<PoliticaPrivacidad />} />
            <Route path="/politica-de-envios" element={<PoliticaEnvios />} />



            {/* Redirect legacy route if existed */}
            <Route path="/politica-devoluciones" element={<Navigate to="/politica-de-envios" replace />} />

            {/* Redirect old /products to /productos */}
            <Route path="/products" element={<Navigate to="/productos" replace />} />

            {/* Catch all - Redirect to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;