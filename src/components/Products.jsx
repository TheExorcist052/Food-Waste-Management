import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { useApp } from '../contexts/AppContext';
import { useCart } from '../contexts/CartContext';
import { Clock, Package, ShoppingCart, MapPin } from 'lucide-react';

const ProductsLayout = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
  align-items: flex-start;
`;

const Filters = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.shadows.md};
  position: sticky;
  top: 100px;
`;

const FilterGroup = styled.div`
  margin-bottom: 1.5rem;
  label { display: block; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.9rem; }
  select { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid ${({ theme }) => theme.colors.border}; background: white; }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const ProductCard = styled.div`
  background: white;
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.shadows.md};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const CardImage = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
  background-color: #f0f0f0;
`;

const CardContent = styled.div`
  padding: 1rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const AddToCartButton = styled.button`
  margin-top: 1rem;
  width: 100%;
  padding: 12px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background-color 0.2s;
  &:hover { background: ${({ theme }) => theme.colors.primaryDark}; }
  &:disabled { background: #9ca3af; cursor: not-allowed; }
`;

const Badge = styled.span`
    background-color: ${props => props.color || props.theme.colors.primary}20;
    color: ${props => props.color || props.theme.colors.primary};
    padding: 4px 8px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
`;

const PriceContainer = styled.div`
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin: 0.5rem 0;
`;

const CurrentPrice = styled.span` font-size: 1.5rem; font-weight: bold; color: ${({ theme }) => theme.colors.primary};`;
const OriginalPrice = styled.span` text-decoration: line-through; color: ${({ theme }) => theme.colors.textLight};`;


export default function Products() {
    const { apiCall } = useApp();
    const { addToCart } = useCart();
    const [products, setProducts] = useState([]);
    const [areas, setAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ area_id: '', category: '', sort_by: 'created_at' });

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams(filters);
        const res = await apiCall(`get_products?${params.toString()}`);
        if (res.success) setProducts(res.data.products);
        setLoading(false);
    }, [apiCall, filters]);
    
    const fetchAreas = useCallback(async () => {
        const res = await apiCall('get_areas');
        if (res.success && res.data.areas) setAreas(res.data.areas);
    }, [apiCall]);

    useEffect(() => {
        fetchAreas();
    }, [fetchAreas]);
    
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleFilterChange = (e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));

    return (
        <div>
            <h1>Discounted Food</h1>
            <ProductsLayout>
                <Filters>
                    <h4><MapPin size={18} style={{verticalAlign: 'middle', marginRight: '8px'}}/>Filters</h4>
                    <FilterGroup>
                        <label>Area</label>
                        <select name="area_id" value={filters.area_id} onChange={handleFilterChange}>
                            <option value="">All Dhaka</option>
                            {areas.map(area => (<option key={area.id} value={area.id}>{area.name}</option>))}
                        </select>
                    </FilterGroup>
                    <FilterGroup>
                        <label>Category</label>
                        <select name="category" value={filters.category} onChange={handleFilterChange}>
                            <option value="">All Categories</option>
                            <option value="Bakery">Bakery</option>
                            <option value="Meals">Meals</option>
                            <option value="Groceries">Groceries</option>
                        </select>
                    </FilterGroup>
                     <FilterGroup>
                        <label>Sort By</label>
                        <select name="sort_by" value={filters.sort_by} onChange={handleFilterChange}>
                           <option value="created_at">Newest</option>
                           <option value="discount">Biggest Discount</option>
                        </select>
                    </FilterGroup>
                </Filters>
                <div>
                    {loading ? <p>Loading products...</p> : (
                        <ProductGrid>
                            {products.length > 0 ? products.map(p => (
                                <ProductCard key={p.id}>
                                    <CardImage src={p.image_url} alt={p.name} onError={(e) => e.target.src = 'https://placehold.co/400x300/e2e8f0/94a3b8?text=Image+Not+Found'}/>
                                    <CardContent>
                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                            <h4 style={{margin: 0}}>{p.name}</h4>
                                            {p.hours_remaining < 24 && <Badge color="#ef4444">Expires Soon</Badge>}
                                        </div>
                                        <p style={{fontSize: '0.9rem', color: '#64748b'}}>{p.restaurant_name}</p>
                                        <PriceContainer>
                                            <CurrentPrice>${parseFloat(p.price).toFixed(2)}</CurrentPrice>
                                            <OriginalPrice>${parseFloat(p.original_price).toFixed(2)}</OriginalPrice>
                                            <Badge color="#f97316">{p.discount_percentage}% OFF</Badge>
                                        </PriceContainer>
                                        <div style={{display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#64748b', marginTop: 'auto', paddingTop: '1rem'}}>
                                            <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}><Clock size={14}/> {Math.floor(p.hours_remaining / 24)}d {p.hours_remaining % 24}h left</span>
                                            <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}><Package size={14}/> {p.quantity} left</span>
                                        </div>
                                        <AddToCartButton onClick={() => addToCart(p.id)} disabled={p.quantity < 1}>
                                            <ShoppingCart size={18}/> {p.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                                        </AddToCartButton>
                                    </CardContent>
                                </ProductCard>
                            )) : <p>No products match your criteria.</p>}
                        </ProductGrid>
                    )}
                </div>
            </ProductsLayout>
        </div>
    );
}