import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme, GlobalStyle } from './theme';
import { CartProvider } from './contexts/CartContext';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Products from './components/Products';
import Cart from './components/Cart';
import Auth from './components/Auth';
import Profile from './components/Profile';
import Dashboard from './components/Dashboard';
import Donations from './components/Donations';
import Community from './components/Community';
import Leaderboard from './components/Leaderboard';
import AdminPanel from './components/AdminPanel';
import ProtectedRoute from './components/ProtectedRoute';

export default function AppRoutes() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <CartProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/donations" element={<Donations />} />
            <Route path="/community" element={<Community />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><Profile /></ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute><AdminPanel /></ProtectedRoute>
            } />
            {/* Add more routes as needed */}
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </ThemeProvider>
  );
}