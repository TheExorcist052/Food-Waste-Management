import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { PlusCircle, Utensils, Edit, Trash2 } from 'lucide-react';

const DashboardContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  align-items: flex-start;
`;

const FormContainer = styled.div`
  background: white;
  padding: 2rem;
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.shadows.md};
  position: sticky;
  top: 100px;
`;

const Input = styled.input` width: 100%; padding: 12px; margin-bottom: 1rem; border-radius: 8px; border: 1px solid ${({ theme }) => theme.colors.border};`;
const Textarea = styled.textarea` width: 100%; padding: 12px; margin-bottom: 1rem; border-radius: 8px; border: 1px solid ${({ theme }) => theme.colors.border};`;
const Select = styled.select` width: 100%; padding: 12px; margin-bottom: 1rem; border-radius: 8px; border: 1px solid ${({ theme }) => theme.colors.border}; background: white;`;
const Button = styled.button` width: 100%; padding: 14px; background: ${({ theme }) => theme.colors.primary}; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 8px;`;

const ProductList = styled.div`
  background: white;
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.shadows.md};
  overflow: hidden;
`;

const ProductItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  &:last-child {
    border-bottom: none;
  }
`;

export default function Dashboard() {
    const { user, apiCall } = useApp();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const today = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        name: '', description: '', original_price: '', discounted_price: '', quantity: '', category: 'Meals', expiry_date: today
    });

    const fetchMyProducts = useCallback(async () => {
       setLoading(true);
       const res = await apiCall('get_products');
       if(res.success && user) {
           const myProducts = res.data.products.filter(p => p.owner_name === user.name);
           setProducts(myProducts);
       }
       setLoading(false);
    }, [apiCall, user]);

    useEffect(() => {
        if (!user || user.type !== 'restaurant') {
            navigate('/auth');
            return;
        }
        fetchMyProducts();
    }, [user, navigate, fetchMyProducts]);
    
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await apiCall('add_product', { method: 'POST', body: { ...formData, user_id: user.id } });
        if (res.success) {
            alert('Discounted food item added successfully!');
            setFormData({ name: '', description: '', original_price: '', discounted_price: '', quantity: '', category: 'Meals', expiry_date: today });
            fetchMyProducts();
        } else {
            alert(res.message || 'Failed to add product.');
        }
    };
    
    return (
        <div>
            <h1>Seller Dashboard</h1>
            <DashboardContainer>
                <FormContainer>
                    <h3 style={{marginTop: 0}}>Add Discounted Food Item</h3>
                    <form onSubmit={handleSubmit}>
                        <Input name="name" value={formData.name} onChange={handleChange} placeholder="Product Name" required/>
                        <Textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" rows="3" required/>
                        <Input name="original_price" type="number" step="0.01" value={formData.original_price} onChange={handleChange} placeholder="Original Price" required/>
                        <Input name="discounted_price" type="number" step="0.01" value={formData.discounted_price} onChange={handleChange} placeholder="Discounted Price" required/>
                        <Input name="quantity" type="number" value={formData.quantity} onChange={handleChange} placeholder="Quantity" required/>
                        <Select name="category" value={formData.category} onChange={handleChange}>
                            <option>Meals</option>
                            <option>Bakery</option>
                            <option>Groceries</option>
                            <option>Drinks</option>
                        </Select>
                        <div>
                            <label style={{fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block'}}>Expiry Date</label>
                            <Input name="expiry_date" type="date" min={today} value={formData.expiry_date} onChange={handleChange} required/>
                        </div>
                        <Button type="submit"><PlusCircle size={18}/> Add Product</Button>
                    </form>
                </FormContainer>
                <div>
                     <h3 style={{marginTop: 0}}>My Listings</h3>
                    <ProductList>
                        {loading ? <p style={{padding: '1rem'}}>Loading listings...</p> : products.length > 0 ? products.map(p => (
                            <ProductItem key={p.id}>
                                <div>
                                    <h5 style={{margin: 0}}>{p.name}</h5>
                                    <p style={{margin: 0, fontSize: '0.9rem'}}>Qty: {p.quantity} | Price: ${p.price}</p>
                                </div>
                                <div>
                                    <button style={{background:'none', border: 'none', cursor: 'pointer', color: '#64748b', marginRight: '8px'}}><Edit size={18}/></button>
                                    <button style={{background:'none', border: 'none', cursor: 'pointer', color: '#ef4444'}}><Trash2 size={18}/></button>
                                </div>
                            </ProductItem>
                        )) : <p style={{padding: '1rem'}}>You have no products listed.</p>}
                    </ProductList>
                </div>
            </DashboardContainer>
        </div>
    );
}

