import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useApp } from '../contexts/AppContext';
import styled from 'styled-components';

const CheckoutContainer = styled.div`
  max-width: 600px;
  margin: 20px auto;
  padding: 2.5rem;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  font-size: 1rem;
`;

const Button = styled.button`
    width: 100%;
    padding: 14px;
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.primaryDark});
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
`;

export default function CheckoutPage() {
    const { checkout, cart } = useCart();
    const { user } = useApp();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        delivery_address: '',
        phone: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                delivery_address: user.address || '',
                phone: user.phone || ''
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        const res = await checkout(formData);
        if (res.success) {
            setMessage(`Checkout successful! Your order IDs are ${res.data.order_ids.join(', ')}. Redirecting to profile...`);
            setTimeout(() => navigate('/profile'), 3000);
        } else {
            setMessage(res.message || 'Checkout failed.');
        }
        setLoading(false);
    };

    if (cart.items.length === 0 && !loading && !message) {
        return (
            <CheckoutContainer>
                <h2>Your cart is empty.</h2>
                <Button onClick={() => navigate('/products')}>Go Shopping</Button>
            </CheckoutContainer>
        );
    }

    return (
        <CheckoutContainer>
            <h2>Checkout</h2>
            <Form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="delivery_address">Delivery Address</label>
                    <Input id="delivery_address" type="text" name="delivery_address" value={formData.delivery_address} onChange={handleChange} required />
                </div>
                <div>
                    <label htmlFor="phone">Phone Number</label>
                    <Input id="phone" type="text" name="phone" value={formData.phone} onChange={handleChange} required />
                </div>
                <div>
                    <label htmlFor="notes">Order Notes (optional)</label>
                    <Input as="textarea" id="notes" name="notes" value={formData.notes} onChange={handleChange} />
                </div>
                
                <h4>Total: ${cart.total_amount ? cart.total_amount.toFixed(2) : '0.00'}</h4>
                {message && <p>{message}</p>}
                <Button type="submit" disabled={loading || (message && message.includes('successful'))}>
                    {loading ? 'Processing...' : 'Place Order'}
                </Button>
            </Form>
        </CheckoutContainer>
    );
}