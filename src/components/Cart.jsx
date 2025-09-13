import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import styled from 'styled-components';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';

const CartLayout = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  align-items: flex-start;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const CartItemsContainer = styled.div`
  background-color: #fff;
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

const CartItem = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;

  &:last-child {
    border-bottom: none;
  }
`;

const ItemDetails = styled.div`
  flex-grow: 1;
`;

const ItemActions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
`;

const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #d1d5db;
  border-radius: 6px;
`;

const QtyButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #4b5563;
`;

const SummaryContainer = styled.div`
  background-color: #fff;
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: 1.5rem;
  position: sticky;
  top: 100px;
`;

const CheckoutButton = styled.button`
  width: 100%;
  padding: 14px;
  background: linear-gradient(90deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
`;

const EmptyCartContainer = styled.div`
  text-align: center;
  padding: 4rem;
  background: white;
  border-radius: 12px;
`;

export default function Cart() {
  const { cart, updateQuantity, loading } = useCart();
  const navigate = useNavigate();

  if (loading && cart.items.length === 0) return <div>Loading cart...</div>;
  if (!cart || cart.items.length === 0) {
    return (
      <EmptyCartContainer>
        <ShoppingCart size={48} color="#9ca3af" style={{ margin: '0 auto 1rem' }}/>
        <h2>Your cart is empty.</h2>
        <p style={{color: '#6b7280', marginBottom: '1.5rem'}}>Looks like you haven't added anything to your cart yet.</p>
        <CheckoutButton onClick={() => navigate('/products')}>Start Shopping</CheckoutButton>
      </EmptyCartContainer>
    );
  }

  return (
    <div>
      <h1 style={{marginBottom: '2rem'}}>Shopping Cart</h1>
      <CartLayout>
        <CartItemsContainer>
          {cart.items.map(item => (
            <CartItem key={item.product_id}>
              <ItemDetails>
                <h4 style={{margin: '0 0 4px 0'}}>{item.name}</h4>
                <p style={{margin: 0, fontSize: '0.9rem', color: '#6b7280'}}>{item.restaurant_name}</p>
                <p style={{margin: '8px 0 0 0', fontWeight: 500}}>${parseFloat(item.price).toFixed(2)}</p>
              </ItemDetails>
              <ItemActions>
                <QuantityControl>
                  <QtyButton onClick={() => updateQuantity(item.product_id, item.quantity - 1)} disabled={item.quantity <= 1}><Minus size={16}/></QtyButton>
                  <span style={{padding: '0 10px', fontWeight: 500}}>{item.quantity}</span>
                  <QtyButton onClick={() => updateQuantity(item.product_id, item.quantity + 1)}><Plus size={16}/></QtyButton>
                </QuantityControl>
                <button onClick={() => updateQuantity(item.product_id, 0)} style={{background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer'}}><Trash2 size={18}/></button>
              </ItemActions>
            </CartItem>
          ))}
        </CartItemsContainer>

        <SummaryContainer>
          <h3 style={{marginTop: 0}}>Order Summary</h3>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
            <span>Subtotal</span>
            <span>${parseFloat(cart.total_amount).toFixed(2)}</span>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#10b981'}}>
            <span>Savings</span>
            <span>-${parseFloat(cart.total_discount).toFixed(2)}</span>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '1rem'}}>
            <span>Total</span>
            <span>${parseFloat(cart.total_amount).toFixed(2)}</span>
          </div>
          <CheckoutButton onClick={() => navigate('/checkout')} style={{marginTop: '1.5rem'}}>
            Proceed to Checkout
          </CheckoutButton>
        </SummaryContainer>
      </CartLayout>
    </div>
  );
}