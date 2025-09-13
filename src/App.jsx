import React from 'react';
import { Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import Navbar from './components/Navbar';
import Home from './components/Home';
import DiscountedProducts from './components/DiscountedProducts'; // Import the new component
import Cart from './components/Cart';
import Auth from './components/Auth';
import Profile from './components/Profile';
import AdminPanel from './components/AdminPanel';
import CheckoutPage from './components/CheckoutPage';
import Donations from './components/Donations';
import Community from './components/Community';
import Leaderboard from './components/Leaderboard';
import ReviewsPage from './components/ReviewsPage';
import Dashboard from './components/Dashboard';

const AppContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
  color: ${({ theme }) => theme.colors.text};
`;

const MainContent = styled.main`
  padding: 2.5rem 2rem;
  max-width: 1280px;
  margin: 0 auto;
  @media (max-width: 768px) { padding: 1.5rem 1rem; }
`;

function App() {
  return (
    <AppContainer>
      <Navbar />
      <MainContent>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/discounts" element={<DiscountedProducts />} /> {/* This is the new dedicated route */}
          <Route path="/products" element={<DiscountedProducts />} /> {/* This ensures the old URL still works */}
          <Route path="/donations" element={<Donations />} />
          <Route path="/community" element={<Community />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </MainContent>
    </AppContainer>
  );
}

export default App;

