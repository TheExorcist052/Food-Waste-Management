import React, { useEffect, useState, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Users, Utensils, MessageSquare, Trash2, Edit } from 'lucide-react';

const AdminContainer = styled.div``;

const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 1.5rem;
`;
const TabButton = styled.button`
  padding: 12px 20px;
  border: none;
  background: transparent;
  border-bottom: 3px solid ${props => props.$active ? props.theme.colors.primary : 'transparent'};
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.textLight};
  display: flex;
  align-items: center;
  gap: 8px;
`;
const ContentTable = styled.table`
    width: 100%;
    background: white;
    border-radius: 12px;
    border-collapse: collapse;
    box-shadow: ${({ theme }) => theme.shadows.md};
    th, td {
        padding: 1rem 1.5rem;
        text-align: left;
        border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    }
    th {
        color: ${({ theme }) => theme.colors.textLight};
        font-size: 0.9rem;
        text-transform: uppercase;
    }
`;

const ActionButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    
    &.delete {
        color: ${({ theme }) => theme.colors.danger};
        &:hover { background-color: #fee2e2; }
    }
    &.edit {
        color: #f59e0b;
        &:hover { background-color: #fffbeb; }
    }
`;

const FormContainer = styled.div`
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: ${({ theme }) => theme.shadows.md};
    margin-top: 2rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const Button = styled.button`
  padding: 12px 24px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

export default function AdminPanel() {
    const { user, apiCall } = useApp();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('users');
    const [data, setData] = useState({ users: [], products: [], posts: [] });
    const [loading, setLoading] = useState(true);
    
    // State for product form
    const [isEditing, setIsEditing] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', price: '', quantity: ''});

    const fetchData = useCallback(async (tab) => {
        setLoading(true);
        const endpoint = tab === 'users' ? 'get_all_users' : tab === 'products' ? 'get_products' : 'get_all_posts';
        const dataKey = tab === 'products' ? 'products' : tab;

        const res = await apiCall(endpoint);
        if(res.success) {
             setData(prev => ({ ...prev, [tab]: res.data[dataKey] || [] }));
        } else {
            alert(`Failed to load ${tab}: ${res.message}`);
        }
        setLoading(false);
    }, [apiCall]);

    useEffect(() => {
        if (!user || user.type !== 'admin') {
            navigate('/');
            return;
        }
        fetchData(activeTab);
    }, [user, navigate, activeTab, fetchData]);

    const handleDelete = async (type, id) => {
        const typeSingular = type.slice(0, -1);
        if (!window.confirm(`Are you sure you want to delete this ${typeSingular}?`)) return;

        const endpoint = `delete_${typeSingular}`;
        let body = {};
        if (typeSingular === 'product') {
            body.product_id = id;
        } else if (typeSingular === 'post') {
            body.post_id = id;
        } else if (typeSingular === 'user') {
            body.user_id = id;
        }
        
        const res = await apiCall(endpoint, { method: 'POST', body });
        if (res.success) {
            fetchData(activeTab);
        } else {
            alert(res.message || `Failed to delete ${typeSingular}`);
        }
    };
    
    const handleEditClick = (product) => {
        setIsEditing(true);
        setCurrentProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            quantity: product.quantity
        });
    };

    const handleFormChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value });
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        const res = await apiCall('update_product', {
            method: 'POST',
            body: { ...formData, product_id: currentProduct.id }
        });
        if (res.success) {
            alert('Product updated!');
            resetForm();
            fetchData('products');
        } else {
            alert(res.message || 'Failed to update product');
        }
    };
    
    const resetForm = () => {
        setIsEditing(false);
        setCurrentProduct(null);
        setFormData({ name: '', description: '', price: '', quantity: ''});
    };

    const renderProducts = () => (
        <>
            <ContentTable>
                <thead><tr><th>ID</th><th>Name</th><th>Restaurant</th><th>Price</th><th>Qty</th><th>Actions</th></tr></thead>
                <tbody>
                    {data.products.map(p => (
                        <tr key={p.id}>
                            <td>{p.id}</td><td>{p.name}</td><td>{p.restaurant_name}</td><td>${p.price}</td><td>{p.quantity}</td>
                            <td>
                                <ActionButton className="edit" onClick={() => handleEditClick(p)}><Edit size={18}/></ActionButton>
                                <ActionButton className="delete" onClick={() => handleDelete('products', p.id)}><Trash2 size={18}/></ActionButton>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </ContentTable>

            {isEditing && (
                <FormContainer>
                    <h3>Editing Product: {currentProduct.name}</h3>
                    <form onSubmit={handleUpdateSubmit}>
                         <Input name="name" value={formData.name} onChange={handleFormChange} placeholder="Product Name" required/>
                         <Input as="textarea" rows="3" name="description" value={formData.description} onChange={handleFormChange} placeholder="Description" required/>
                         <Input name="price" type="number" step="0.01" value={formData.price} onChange={handleFormChange} placeholder="Price" required/>
                         <Input name="quantity" type="number" value={formData.quantity} onChange={handleFormChange} placeholder="Quantity" required/>
                         <Button type="submit">Update Product</Button>
                         <Button type="button" onClick={resetForm} style={{marginLeft: '1rem', background: '#64748b'}}>Cancel</Button>
                    </form>
                </FormContainer>
            )}
        </>
    );

    const renderContent = () => {
        if (loading) return <p>Loading data...</p>;
        switch (activeTab) {
            case 'users':
                return (
                    <ContentTable>
                        <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {data.users.map(u => (
                                <tr key={u.id}>
                                    <td>{u.id}</td><td>{u.name}</td><td>{u.email}</td><td>{u.type}</td><td>{u.status}</td>
                                    <td><ActionButton className="delete" onClick={() => handleDelete('users', u.id)}><Trash2 size={18}/></ActionButton></td>
                                </tr>
                            ))}
                        </tbody>
                    </ContentTable>
                );
            case 'products':
                return renderProducts();
            case 'posts':
                 return (
                    <ContentTable>
                        <thead><tr><th>ID</th><th>Author</th><th>Content</th><th>Actions</th></tr></thead>
                        <tbody>
                            {data.posts.map(p => (
                                <tr key={p.id}>
                                    <td>{p.id}</td><td>{p.user_name}</td><td>{p.content.substring(0, 50)}...</td>
                                    <td><ActionButton className="delete" onClick={() => handleDelete('posts', p.id)}><Trash2 size={18}/></ActionButton></td>
                                </tr>
                            ))}
                        </tbody>
                    </ContentTable>
                );
            default:
                return null;
        }
    }

    return (
        <AdminContainer>
            <h1>Admin Panel</h1>
            <Tabs>
                <TabButton $active={activeTab === 'users'} onClick={() => setActiveTab('users')}><Users size={18}/> Manage Users</TabButton>
                <TabButton $active={activeTab === 'products'} onClick={() => setActiveTab('products')}><Utensils size={18}/> Manage Products</TabButton>
                <TabButton $active={activeTab === 'posts'} onClick={() => setActiveTab('posts')}><MessageSquare size={18}/> Manage Posts</TabButton>
            </Tabs>
            {renderContent()}
        </AdminContainer>
    );
}