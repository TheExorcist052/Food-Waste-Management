import React, { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Hash, Calendar, ShoppingBag, Truck } from 'lucide-react';

const OrdersContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

const OrderCard = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
`;

const StatusBadge = styled.span`
  background-color: ${props => props.color || '#e5e7eb'};
  color: ${props => props.textColor || '#374151'};
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: capitalize;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 0.9rem;
`;

export default function OrderHistory() {
    const { user, apiCall } = useApp();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/auth');
            return;
        }
        const fetchOrders = async () => {
            setLoading(true);
            const res = await apiCall(`get_orders&user_id=${user.id}`, 'GET');
            if (res.success) {
                setOrders(res.data.orders);
            }
            setLoading(false);
        };
        fetchOrders();
    }, [user, apiCall, navigate]);

    if (loading) return <div>Loading order history...</div>;

    const statusColors = {
        pending: { bg: '#fffbeb', text: '#b45309' },
        completed: { bg: '#dcfce7', text: '#166534' },
        cancelled: { bg: '#fee2e2', text: '#991b1b' },
    };

    return (
        <OrdersContainer>
            <h1 style={{marginBottom: '2rem'}}>My Orders</h1>
            {orders.length === 0 ? (
                <p>You have no past orders.</p>
            ) : (
                orders.map(order => (
                    <OrderCard key={order.id}>
                        <OrderHeader>
                            <div>
                                <h3 style={{margin: '0 0 4px 0'}}>Order from {order.restaurant_name}</h3>
                                <InfoItem><Hash size={14}/> <span>Order ID: {order.id}</span></InfoItem>
                            </div>
                            <StatusBadge 
                                color={statusColors[order.status]?.bg}
                                textColor={statusColors[order.status]?.text}
                            >
                                {order.status}
                            </StatusBadge>
                        </OrderHeader>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <div>
                                <InfoItem style={{marginBottom: '8px'}}><Calendar size={14}/> <span>{order.created_at_formatted}</span></InfoItem>
                                <InfoItem><ShoppingBag size={14}/> <span>{order.total_items} items</span></InfoItem>
                            </div>
                            <div style={{textAlign: 'right'}}>
                                <p style={{margin: 0, fontSize: '1.25rem', fontWeight: 'bold'}}>${parseFloat(order.total_amount).toFixed(2)}</p>
                                <p style={{margin: 0, color: '#6b7280'}}>Total Amount</p>
                            </div>
                        </div>
                    </OrderCard>
                ))
            )}
        </OrdersContainer>
    );
}
