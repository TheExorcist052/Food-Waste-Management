import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import styled from 'styled-components';
import { Percent, ShoppingCart, MapPin, Clock, Package, Upload, Sparkles, Image as ImageIcon, X, RefreshCw, DollarSign, Tag } from 'lucide-react';

const PageLayout = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  align-items: flex-start;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const ProductCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
    border-color: ${({ theme }) => theme.colors.primary}40;
  }
`;

const CardImage = styled.div`
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  position: relative;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
`;

const DiscountBadge = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
`;

const CardContent = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  gap: 1rem;
`;

const CardTitle = styled.h4`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.4;
`;

const PriceSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0.75rem 0;
`;

const OriginalPrice = styled.span`
  font-size: 0.9rem;
  color: #9ca3af;
  text-decoration: line-through;
`;

const DiscountedPrice = styled.span`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
`;

const SaveAmount = styled.span`
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const CardFooter = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textLight};
  background: ${({ theme }) => theme.colors.background};
`;

const Badge = styled.span`
  background: ${props => {
    if (props.variant === 'urgent') return 'linear-gradient(135deg, #ef4444, #dc2626)';
    if (props.variant === 'new') return 'linear-gradient(135deg, #10b981, #059669)';
    if (props.variant === 'hot') return 'linear-gradient(135deg, #f59e0b, #d97706)';
    return 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
  }};
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
`;

const FormContainer = styled.div`
  background: ${({ theme }) => theme.colors.white};
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 100px;
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  margin-bottom: 1rem;
  border-radius: 10px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background: white;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 14px 16px;
  margin-bottom: 1rem;
  border-radius: 10px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  font-size: 0.95rem;
  transition: all 0.2s ease;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 14px 16px;
  margin-bottom: 1rem;
  border-radius: 10px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  background: white;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 16px;
  background: ${({ variant, theme }) => {
    if (variant === 'secondary') return theme.colors.border;
    if (variant === 'ai') return 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
    return `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryDark || theme.colors.primary})`;
  }};
  color: ${({ variant, theme }) => variant === 'secondary' ? theme.colors.text : 'white'};
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: ${({ $marginBottom }) => $marginBottom || '0'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const ImageUploadSection = styled.div`
  border: 2px dashed ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  padding: 1.5rem;
  text-align: center;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
  background: ${({ theme }) => theme.colors.background};
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primary}05;
  }
`;

const ImagePreview = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
  background: ${({ theme }) => theme.colors.background};
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(239, 68, 68, 0.9);
    transform: scale(1.1);
  }
`;

const AIImageContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const FilterContainer = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

const InfoItem = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
`;

const PriceInputContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ContactButton = styled.button`
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }
`;

function ProductForm({ onProductAdded, areas }) {
    const { user, apiCall } = useApp();
    const today = new Date().toISOString().split('T')[0];
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '', 
        description: '', 
        original_price: '', 
        discounted_price: '', 
        quantity: '', 
        location: '', 
        contact_phone: '', 
        area_id: '', 
        expiry_date: today
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [aiImagePrompt, setAiImagePrompt] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value });
    };

    const calculateDiscount = () => {
        const original = parseFloat(formData.original_price) || 0;
        const discounted = parseFloat(formData.discounted_price) || 0;
        if (original > 0 && discounted > 0 && discounted < original) {
            return Math.round(((original - discounted) / original) * 100);
        }
        return 0;
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const preview = URL.createObjectURL(file);
            setImagePreview(preview);
        }
    };

    const removeImage = () => {
        if (imagePreview && imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }
        setImageFile(null);
        setImagePreview(null);
        setAiImagePrompt('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const generateAIImage = async () => {
        if (!aiImagePrompt.trim()) {
            alert('Please enter a description for AI image generation');
            return;
        }
        
        setIsGeneratingAI(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const aiImageUrl = `https://picsum.photos/400/300?random=${Date.now()}`;
            setImagePreview(aiImageUrl);
            setImageFile(null);
            setAiImagePrompt('');
        } catch (error) {
            console.error('AI image generation failed:', error);
            alert('Failed to generate AI image. Please try again.');
        }
        setIsGeneratingAI(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!user) { 
            alert("Please log in to list a discounted product."); 
            return; 
        }

        if (!formData.area_id) { 
            alert("Please select an area for your product."); 
            return; 
        }

        const originalPrice = parseFloat(formData.original_price);
        const discountedPrice = parseFloat(formData.discounted_price);
        
        if (isNaN(originalPrice) || originalPrice <= 0) {
            alert("Please enter a valid original price.");
            return;
        }
        
        if (isNaN(discountedPrice) || discountedPrice <= 0) {
            alert("Please enter a valid discounted price.");
            return;
        }
        
        if (discountedPrice >= originalPrice) {
            alert("Discounted price must be less than original price.");
            return;
        }

        if (!formData.title.trim()) {
            alert("Please enter a product title.");
            return;
        }

        if (!formData.description.trim()) {
            alert("Please enter a product description.");
            return;
        }

        if (!formData.quantity.trim()) {
            alert("Please enter the available quantity.");
            return;
        }

        if (!formData.location.trim()) {
            alert("Please enter pickup/store address.");
            return;
        }

        if (!formData.contact_phone.trim()) {
            alert("Please enter contact phone number.");
            return;
        }

        setIsSubmitting(true);

        try {
            let imageUrl = imagePreview;
            
            // If no image is provided, generate a default one
            if (!imageUrl) {
                imageUrl = `https://picsum.photos/400/300?random=${Date.now()}`;
            }

            const submitData = {
                ...formData,
                user_id: user.id,
                image_url: imageUrl,
                original_price: originalPrice,
                discounted_price: discountedPrice
            };

            console.log('Submitting data:', submitData);

            const res = await apiCall('add_discounted_product', { 
                method: 'POST', 
                body: submitData
            });
            
            if (res.success) {
                alert('Discounted product added successfully!');
                setFormData({ 
                    title: '', 
                    description: '', 
                    original_price: '', 
                    discounted_price: '',
                    quantity: '', 
                    location: '', 
                    contact_phone: '', 
                    area_id: '', 
                    expiry_date: today 
                });
                removeImage();
                onProductAdded();
            } else {
                alert(res.message || 'Failed to add discounted product');
                console.error('Backend error:', res);
            }
        } catch (error) {
            console.error('Error adding product:', error);
            alert('Failed to add product. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Don't show form if user is not logged in
    if (!user) {
        return (
            <FormContainer>
                <h3 style={{marginTop: 0, marginBottom: '1.5rem', color: '#1f2937', textAlign: 'center'}}>
                    <Percent size={20} style={{marginRight: '8px', color: '#f59e0b'}}/>
                    Login Required
                </h3>
                <p style={{textAlign: 'center', color: '#6b7280'}}>
                    Please log in to list discounted products and help reduce food waste.
                </p>
            </FormContainer>
        );
    }

    return (
        <FormContainer>
            <h3 style={{marginTop: 0, marginBottom: '1.5rem', color: '#1f2937'}}>
                <Percent size={20} style={{marginRight: '8px', color: '#f59e0b'}}/>
                List Discounted Product
            </h3>
            
            <form onSubmit={handleSubmit}>
                <Input 
                    name="title" 
                    value={formData.title} 
                    onChange={handleChange} 
                    placeholder="Product Title" 
                    required 
                />
                
                <Textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    placeholder="Product description..." 
                    required 
                    rows="3"
                />

                {/* Image Upload Section */}
                <div style={{marginBottom: '1rem'}}>
                    <label style={{display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151'}}>
                        Product Image
                    </label>
                    
                    {imagePreview ? (
                        <ImagePreview>
                            <img src={imagePreview} alt="Product preview" />
                            <RemoveImageButton onClick={removeImage} type="button">
                                <X size={16} />
                            </RemoveImageButton>
                        </ImagePreview>
                    ) : (
                        <ImageUploadSection>
                            <ImageIcon size={32} style={{margin: '0 auto 0.5rem', color: '#9ca3af'}} />
                            <p style={{margin: '0 0 1rem 0', color: '#6b7280'}}>
                                Upload a photo of your product
                            </p>
                            <Button 
                                type="button" 
                                variant="secondary" 
                                onClick={() => fileInputRef.current?.click()}
                                $marginBottom="0.5rem"
                            >
                                <Upload size={16} /> Choose Image
                            </Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                hidden
                            />
                            
                            <div style={{margin: '1rem 0', color: '#9ca3af', fontWeight: '500'}}>OR</div>
                            
                            <AIImageContainer>
                                <Input 
                                    value={aiImagePrompt}
                                    onChange={(e) => setAiImagePrompt(e.target.value)}
                                    placeholder="Describe the product for AI image..."
                                    style={{margin: 0}}
                                />
                                <Button 
                                    type="button"
                                    variant="ai"
                                    onClick={generateAIImage}
                                    disabled={isGeneratingAI}
                                    style={{width: 'auto', minWidth: '120px', margin: 0}}
                                >
                                    {isGeneratingAI ? (
                                        <RefreshCw size={16} className="animate-spin" />
                                    ) : (
                                        <Sparkles size={16} />
                                    )}
                                    {isGeneratingAI ? 'Generating...' : 'AI Generate'}
                                </Button>
                            </AIImageContainer>
                        </ImageUploadSection>
                    )}
                </div>

                {/* Price Section */}
                <div style={{marginBottom: '1rem'}}>
                    <label style={{display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151'}}>
                        Pricing
                    </label>
                    <PriceInputContainer>
                        <Input 
                            name="original_price" 
                            type="number" 
                            step="0.01"
                            min="0.01"
                            value={formData.original_price} 
                            onChange={handleChange} 
                            placeholder="Original Price (à§³)" 
                            required 
                            style={{margin: 0}}
                        />
                        <Input 
                            name="discounted_price" 
                            type="number" 
                            step="0.01"
                            min="0.01"
                            value={formData.discounted_price} 
                            onChange={handleChange} 
                            placeholder="Sale Price (à§³)" 
                            required 
                            style={{margin: 0}}
                        />
                    </PriceInputContainer>
                    {formData.original_price && formData.discounted_price && calculateDiscount() > 0 && (
                        <div style={{
                            background: '#f0fdf4', 
                            border: '1px solid #bbf7d0',
                            padding: '0.75rem', 
                            borderRadius: '8px',
                            textAlign: 'center',
                            marginBottom: '1rem'
                        }}>
                            <span style={{color: '#15803d', fontWeight: '600'}}>
                                {calculateDiscount()}% OFF â€¢ Save à§³{(parseFloat(formData.original_price) - parseFloat(formData.discounted_price)).toFixed(2)}
                            </span>
                        </div>
                    )}
                </div>

                <Select name="area_id" value={formData.area_id} onChange={handleChange} required>
                    <option value="">Select Area</option>
                    {areas.map(area => (
                        <option key={area.id} value={area.id}>{area.name}</option>
                    ))}
                </Select>
                
                <div style={{marginBottom: '1rem'}}>
                    <label style={{fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block', color: '#374151'}}>
                        Offer Valid Until
                    </label>
                    <Input 
                        name="expiry_date" 
                        type="date" 
                        min={today} 
                        value={formData.expiry_date} 
                        onChange={handleChange} 
                        required 
                        style={{margin: 0}}
                    />
                </div>
                
                <Input 
                    name="quantity" 
                    value={formData.quantity} 
                    onChange={handleChange} 
                    placeholder="Available Quantity (e.g., 10 pieces, 5 kg)" 
                    required 
                />
                
                <Input 
                    name="location" 
                    value={formData.location} 
                    onChange={handleChange} 
                    placeholder="Pickup/Store Address" 
                    required 
                />
                
                <Input 
                    name="contact_phone" 
                    value={formData.contact_phone} 
                    onChange={handleChange} 
                    placeholder="Contact Phone Number" 
                    required 
                />
                
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <RefreshCw size={18} className="animate-spin" />
                            Adding Product...
                        </>
                    ) : (
                        <>
                            <Tag size={18}/> 
                            List Product
                        </>
                    )}
                </Button>
            </form>
        </FormContainer>
    );
}

export default function DiscountedProducts() {
    const { apiCall } = useApp();
    const [products, setProducts] = useState([]);
    const [areas, setAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterAreaId, setFilterAreaId] = useState('');

    const loadProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterAreaId) {
                params.append('area_id', filterAreaId);
            }
            
            const res = await apiCall(`get_discounted_products${params.toString() ? '?' + params.toString() : ''}`);
            if (res.success && res.data && res.data.products) {
                setProducts(res.data.products);
            } else {
                setProducts([]);
                console.error('Failed to load products:', res.message);
            }
        } catch (error) {
            console.error('Error loading products:', error);
            setProducts([]);
        }
        setLoading(false);
    }, [apiCall, filterAreaId]);

    const fetchAreas = useCallback(async () => {
        try {
            const res = await apiCall('get_areas');
            if (res.success && res.data && res.data.areas) {
                setAreas(res.data.areas);
            } else {
                console.error('Failed to load areas:', res.message);
            }
        } catch (error) {
            console.error('Error fetching areas:', error);
        }
    }, [apiCall]);

    useEffect(() => {
        fetchAreas();
    }, [fetchAreas]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const formatTimeRemaining = (hoursRemaining) => {
        if (hoursRemaining <= 0) return 'Expired';
        const days = Math.floor(hoursRemaining / 24);
        const hours = Math.floor(hoursRemaining % 24);
        if (days > 0) {
            return `${days}d ${hours}h left`;
        }
        return `${hours}h left`;
    };

    const calculateDiscount = (original, discounted) => {
        return Math.round(((original - discounted) / original) * 100);
    };

    const handleContactSeller = (phone) => {
        if (phone) {
            window.open(`tel:${phone}`, '_self');
        }
    };

    return (
        <div>
            <div style={{marginBottom: '2rem'}}>
                <h1 style={{fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1f2937'}}>
                    Discounted Products
                </h1>
                <p style={{fontSize: '1.1rem', color: '#6b7280', marginBottom: '2rem'}}>
                    Find great deals on food items from local businesses and individuals
                </p>
            </div>

            <FilterContainer>
                <label style={{fontWeight: '600', marginBottom: '0.75rem', display: 'block', color: '#374151'}}>
                    Filter by Area
                </label>
                <Select 
                    value={filterAreaId} 
                    onChange={(e) => setFilterAreaId(e.target.value)}
                    style={{maxWidth: '300px', margin: 0}}
                >
                    <option value="">All Areas in Dhaka</option>
                    {areas.map(area => (
                        <option key={area.id} value={area.id}>{area.name}</option>
                    ))}
                </Select>
            </FilterContainer>

            <PageLayout>
                <div>
                    {loading ? (
                        <div style={{textAlign: 'center', padding: '3rem', color: '#6b7280'}}>
                            <RefreshCw size={32} className="animate-spin" style={{marginBottom: '1rem'}} />
                            <p>Loading products...</p>
                        </div>
                    ) : (
                        <ProductsGrid>
                            {products.length > 0 ? products.map(p => {
                                const discount = calculateDiscount(p.original_price, p.discounted_price);
                                const hoursRemaining = p.hours_remaining || 0;
                                return (
                                    <ProductCard key={p.id}>
                                        <CardImage>
                                            <img 
                                                src={p.image_url || `https://picsum.photos/400/300?random=${p.id + 1000}`} 
                                                alt={p.title}
                                                onError={(e) => {
                                                    e.target.src = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop&crop=center';
                                                }}
                                            />
                                            <DiscountBadge>{discount}% OFF</DiscountBadge>
                                        </CardImage>
                                        <CardContent>
                                            <CardHeader>
                                                <CardTitle>{p.title}</CardTitle>
                                                {hoursRemaining <= 24 && hoursRemaining > 0 && (
                                                    <Badge variant="urgent">Expires Soon</Badge>
                                                )}
                                                {discount >= 50 && (
                                                    <Badge variant="hot">Hot Deal</Badge>
                                                )}
                                            </CardHeader>
                                            
                                            <PriceSection>
                                                <OriginalPrice>à§³{parseFloat(p.original_price).toFixed(2)}</OriginalPrice>
                                                <DiscountedPrice>à§³{parseFloat(p.discounted_price).toFixed(2)}</DiscountedPrice>
                                                <SaveAmount>Save à§³{(p.original_price - p.discounted_price).toFixed(2)}</SaveAmount>
                                            </PriceSection>
                                            
                                            <p style={{
                                                fontSize: '0.9rem', 
                                                color: '#64748b', 
                                                flexGrow: 1, 
                                                lineHeight: '1.5',
                                                margin: '0 0 1rem 0'
                                            }}>
                                                {p.description}
                                            </p>
                                            
                                            <div style={{
                                                background: '#f8fafc',
                                                padding: '0.75rem',
                                                borderRadius: '8px',
                                                fontSize: '0.85rem',
                                                marginBottom: '1rem'
                                            }}>
                                                <p style={{margin: '0 0 0.25rem 0'}}>
                                                    <strong>Seller:</strong> {p.seller_name || 'Food For All User'}
                                                </p>
                                                <p style={{margin: '0', color: '#64748b'}}>
                                                    <strong>Location:</strong> {p.location}
                                                </p>
                                            </div>

                                            {p.contact_phone && (
                                                <ContactButton 
                                                    onClick={() => handleContactSeller(p.contact_phone)}
                                                    style={{alignSelf: 'flex-start'}}
                                                >
                                                    ðŸ“ž Contact Seller
                                                </ContactButton>
                                            )}
                                        </CardContent>
                                        <CardFooter>
                                            <InfoItem>
                                                <MapPin size={14}/> 
                                                {p.area_name}
                                            </InfoItem>
                                            <InfoItem>
                                                <Package size={14}/> 
                                                {p.quantity} available
                                            </InfoItem>
                                            <InfoItem>
                                                <Clock size={14}/>
                                                {formatTimeRemaining(hoursRemaining)}
                                            </InfoItem>
                                        </CardFooter>
                                    </ProductCard>
                                );
                            }) : (
                                <div style={{
                                    gridColumn: '1 / -1',
                                    textAlign: 'center',
                                    padding: '3rem',
                                    color: '#6b7280'
                                }}>
                                    <ShoppingCart size={48} style={{marginBottom: '1rem', opacity: 0.5}} />
                                    <p style={{fontSize: '1.1rem', marginBottom: '0.5rem'}}>
                                        No discounted products available
                                    </p>
                                    <p>
                                        {filterAreaId ? 
                                            'Try selecting a different area or check back later.' : 
                                            'Be the first to list a discounted product in your area!'
                                        }
                                    </p>
                                </div>
                            )}
                        </ProductsGrid>
                    )}
                </div>
                <div>
                    <ProductForm onProductAdded={loadProducts} areas={areas} />
                </div>
            </PageLayout>
        </div>
    );
}