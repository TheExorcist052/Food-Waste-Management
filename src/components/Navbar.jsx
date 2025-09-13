import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { useApp } from '../contexts/AppContext';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, User, LogOut, Shield, LayoutDashboard } from 'lucide-react';

const NavContainer = styled.nav`
  background: ${({ theme }) => theme.colors.white};
  padding: 0 2rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
  box-shadow: ${({ theme }) => theme.shadows.md};
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const Logo = styled(Link)`
  font-weight: 800;
  font-size: 1.75rem;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
`;

const StyledNavLink = styled(NavLink)`
  color: ${({ theme }) => theme.colors.textLight};
  text-decoration: none;
  font-weight: 500;
  position: relative;
  padding: 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 8px;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: ${({ theme }) => theme.colors.primary};
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  &.active {
    color: ${({ theme }) => theme.colors.primary};
    &::after {
      transform: scaleX(1);
    }
  }

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const UserActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const CartLink = styled(Link)`
  position: relative;
  color: ${({ theme }) => theme.colors.textLight};
  &:hover { color: ${({ theme }) => theme.colors.primary}; }
`;

const CartCount = styled.span`
  position: absolute;
  top: -8px;
  right: -10px;
  background-color: ${({ theme }) => theme.colors.danger};
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
`;

export default function Navbar() {
  const { user, logout } = useApp();
  const { cart } = useCart();
  const totalItems = cart.items ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  return (
    <NavContainer>
      <NavLinks>
        <Logo to="/">FoodForAll</Logo>
        <StyledNavLink to="/discounts">Discount Food</StyledNavLink>
        <StyledNavLink to="/donations">Donations</StyledNavLink>
        <StyledNavLink to="/community">Community</StyledNavLink>
        <StyledNavLink to="/leaderboard">Leaderboard</StyledNavLink>
      </NavLinks>
      <UserActions>
        <CartLink to="/cart">
          <ShoppingCart size={24} />
          {totalItems > 0 && <CartCount>{totalItems}</CartCount>}
        </CartLink>
        {user ? (
          <>
            {user.type === 'admin' && (
              <StyledNavLink to="/admin"><Shield size={20} /> Admin</StyledNavLink>
            )}
             {user.type === 'restaurant' && (
              <StyledNavLink to="/dashboard"><LayoutDashboard size={20} /> Dashboard</StyledNavLink>
            )}
            <StyledNavLink to="/profile"><User size={20} /> Profile</StyledNavLink>
            <button onClick={logout} style={{background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontWeight: 500}}><LogOut size={20}/> Logout</button>
          </>
        ) : (
          <StyledNavLink to="/auth">Login / Register</StyledNavLink>
        )}
      </UserActions>
    </NavContainer>
  );
}

