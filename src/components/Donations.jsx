// Donations.jsx with all fixes
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import { Heart, Send, MapPin, Clock, Package, Upload, Sparkles, Image as ImageIcon, X, RefreshCw, ShoppingCart } from 'lucide-react';

// Global styles for animations
const GlobalStyle = createGlobalStyle`
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const PageLayout = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  align-items: flex-start;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const DonationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const DonationCard = styled.div`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
    border-color: #3b82f640;
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
  color: #1f2937;
  line-height: 1.4;
`;

const CardFooter = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: #6b7280;
  background: #f9fafb;
`;

const Badge = styled.span`
  background: ${props => {
    if (props.variant === 'urgent') return 'linear-gradient(135deg, #ef4444, #dc2626)';
    if (props.variant === 'new') return 'linear-gradient(135deg, #10b981, #059669)';
    if (props.variant === 'claimed') return 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
    if (props.variant === 'completed') return 'linear-gradient(135deg, #6b7280, #4b5563)';
    return 'linear-gradient(135deg, #f59e0b, #d97706)';
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
  background: #fff;
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
  border: 2px solid #e5e7eb;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px #3b82f620;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 14px 16px;
  margin-bottom: 1rem;
  border-radius: 10px;
  border: 2px solid #e5e7eb;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px #3b82f620;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 14px 16px;
  margin-bottom: 1rem;
  border-radius: 10px;
  border: 2px solid #e5e7eb;
  background: white;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px #3b82f620;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 16px;
  background: ${({ variant }) => {
    if (variant === 'secondary') return '#e5e7eb';
    if (variant === 'ai') return 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
    if (variant === 'success') return 'linear-gradient(135deg, #10b981, #059669)';
    return 'linear-gradient(135deg, #3b82f6, #2563eb)';
  }};
  color: ${({ variant }) => variant === 'secondary' ? '#374151' : 'white'};
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
  border: 2px dashed #e5e7eb;
  border-radius: 10px;
  padding: 1.5rem;
  text-align: center;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
  background: #f9fafb;
  
  &:hover {
    border-color: #3b82f6;
    background: #3b82f605;
  }
`;

const ImagePreview = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
  background: #f9fafb;
  
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

// Add the missing styled components
const FilterTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const FilterTab = styled.button`
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  border: none;
  background: ${({ $active }) => $active ? '#3b82f6' : '#f3f4f6'};
  color: ${({ $active }) => $active ? 'white' : '#374151'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ $active }) => $active ? '#3b82f6' : '#e5e7eb'};
  }
`;

const ClaimButton = styled.button`
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  margin-top: 1rem;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const Spinner = styled(RefreshCw)`
  animation: ${spin} 1s linear infinite;
`;

// AI Image Generator with food-related images
const foodImages = {
  pizza: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop",
  burger: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&h=300&fit=crop",
  pasta: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop",
  rice: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop",
  salad: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
  bread: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&h=300&fit=crop",
  fruit: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=300&fit=crop",
  vegetables: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=400&h=300&fit=crop",
  cake: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop",
  chicken: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop",
  fish: "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=400&h=300&fit=crop",
  soup: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop",
  default: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop"
};

function DonationForm({ onDonationAdded, areas }) {
    const { user, apiCall } = useApp();
    const today = new Date().toISOString().split('T')[0];
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '', description: '', quantity: '', location: '', contact_phone: '', area_id: '', expiry_date: today
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [aiImagePrompt, setAiImagePrompt] = useState('');

    const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value });

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const preview = URL.createObjectURL(file);
            setImagePreview(preview);
        }
    };

    const removeImage = () => {
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
        setImageFile(null);
        setImagePreview(null);
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
            // Simulate AI image generation with food-related images
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Find the best matching food image based on the prompt
            const prompt = aiImagePrompt.toLowerCase();
            let imageUrl = foodImages.default;
            
            if (prompt.includes('pizza')) imageUrl = foodImages.pizza;
            else if (prompt.includes('burger')) imageUrl = foodImages.burger;
            else if (prompt.includes('pasta')) imageUrl = foodImages.pasta;
            else if (prompt.includes('rice')) imageUrl = foodImages.rice;
            else if (prompt.includes('salad')) imageUrl = foodImages.salad;
            else if (prompt.includes('bread')) imageUrl = foodImages.bread;
            else if (prompt.includes('fruit')) imageUrl = foodImages.fruit;
            else if (prompt.includes('vegetable')) imageUrl = foodImages.vegetables;
            else if (prompt.includes('cake')) imageUrl = foodImages.cake;
            else if (prompt.includes('chicken')) imageUrl = foodImages.chicken;
            else if (prompt.includes('fish')) imageUrl = foodImages.fish;
            else if (prompt.includes('soup')) imageUrl = foodImages.soup;
            
            setImagePreview(imageUrl);
            setImageFile(null); // Clear file since we're using AI generated image
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
            alert("Please log in to make a donation."); 
            return; 
        }
        if (!formData.area_id) { 
            alert("Please select an area for your donation."); 
            return; 
        }

        try {
            let imageUrl = imagePreview;
            
            // If there's a file to upload, handle the upload here
            if (imageFile) {
                // Simulate image upload - in a real app, you would upload to a server
                imageUrl = URL.createObjectURL(imageFile);
            }

            // Create a new donation object
            const newDonation = {
                id: Date.now(), // Temporary ID for demo
                title: formData.title,
                description: formData.description,
                quantity: formData.quantity,
                location: formData.location,
                contact_phone: formData.contact_phone,
                area_id: formData.area_id,
                area_name: areas.find(a => a.id == formData.area_id)?.name || 'Unknown Area',
                expiry_date: formData.expiry_date,
                image_url: imageUrl,
                donor_id: user.id,
                donor_name: user.name || 'Anonymous Donor',
                status: 'available',
                hours_remaining: Math.floor((new Date(formData.expiry_date) - new Date()) / (1000 * 60 * 60)),
                created_at: new Date().toISOString()
            };

            // In a real app, you would call the API here
            // const res = await apiCall('add_donation', { 
            //     method: 'POST', 
            //     body: { ...formData, user_id: user.id, image_url: imageUrl }
            // });
            
            // For demo purposes, we'll simulate a successful API call
            console.log('Donation submitted:', newDonation);
            
            alert('Donation added successfully!');
            setFormData({ 
                title: '', description: '', quantity: '', location: '', 
                contact_phone: '', area_id: '', expiry_date: today 
            });
            removeImage();
            
            // Call the callback to refresh donations
            if (onDonationAdded) {
                onDonationAdded(newDonation);
            }
        } catch (error) {
            console.error('Error adding donation:', error);
            alert('Failed to add donation. Please try again.');
        }
    };

    return (
        <FormContainer>
            <h3 style={{marginTop: 0, marginBottom: '1.5rem', color: '#1f2937'}}>
                <Heart size={20} style={{marginRight: '8px', color: '#ef4444'}}/>
                Make a Donation
            </h3>
            
            <form onSubmit={handleSubmit}>
                <Input 
                    name="title" 
                    value={formData.title} 
                    onChange={handleChange} 
                    placeholder="Food Item Title" 
                    required 
                />
                
                <Textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    placeholder="Description of the food item..." 
                    required 
                    rows="3"
                />

                {/* Image Upload Section */}
                <div style={{marginBottom: '1rem'}}>
                    <label style={{display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151'}}>
                        Food Image
                    </label>
                    
                    {imagePreview ? (
                        <ImagePreview>
                            <img src={imagePreview} alt="Food preview" />
                            <RemoveImageButton onClick={removeImage}>
                                <X size={16} />
                            </RemoveImageButton>
                        </ImagePreview>
                    ) : (
                        <ImageUploadSection>
                            <ImageIcon size={32} style={{margin: '0 auto 0.5rem', color: '#9ca3af'}} />
                            <p style={{margin: '0 0 1rem 0', color: '#6b7280'}}>
                                Upload a photo of your food donation
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
                                    placeholder="Describe the food for AI image..."
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
                                        <Spinner size={16} />
                                    ) : (
                                        <Sparkles size={16} />
                                    )}
                                    {isGeneratingAI ? 'Generating...' : 'AI Generate'}
                                </Button>
                            </AIImageContainer>
                        </ImageUploadSection>
                    )}
                </div>

                <div style={{marginBottom: '1rem'}}>
                    <label style={{fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block', color: '#374151'}}>
                        Pickup Area
                    </label>
                    <Select 
                        name="area_id" 
                        value={formData.area_id} 
                        onChange={handleChange} 
                        required
                    >
                        <option value="">Select Pickup Area</option>
                        {areas.map(area => (
                            <option key={area.id} value={area.id}>{area.name}</option>
                        ))}
                    </Select>
                </div>
                
                <div style={{marginBottom: '1rem'}}>
                    <label style={{fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block', color: '#374151'}}>
                        Expiry Date
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
                    placeholder="Quantity (e.g., 5 meals, 2kg rice)" 
                    required 
                />
                
                <Input 
                    name="location" 
                    value={formData.location} 
                    onChange={handleChange} 
                    placeholder="Detailed Pickup Address" 
                    required 
                />
                
                <Input 
                    name="contact_phone" 
                    value={formData.contact_phone} 
                    onChange={handleChange} 
                    placeholder="Contact Phone Number" 
                    required 
                />
                
                <Button type="submit">
                    <Heart size={18}/> 
                    Donate Now
                </Button>
            </form>
        </FormContainer>
    );
}

export default function Donations() {
    const { apiCall, user } = useApp();
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const [donations, setDonations] = useState([]);
    const [areas, setAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterAreaId, setFilterAreaId] = useState('');
    const [statusFilter, setStatusFilter] = useState('available');
    const [claimingDonation, setClaimingDonation] = useState(null);

    const loadDonations = useCallback(async () => {
        setLoading(true);
        try {
            // Simulate API call - in a real app, you would fetch from your backend
            const mockDonations = [
                {
                    id: 1,
                    title: "Fresh Vegetable Pack",
                    description: "Assorted fresh vegetables from local farm",
                    quantity: "5 packs",
                    location: "123 Main Street, Dhaka",
                    contact_phone: "+8801712345678",
                    area_id: 1,
                    area_name: "Gulshan",
                    expiry_date: "2023-12-15",
                    image_url: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=400&h=300&fit=crop",
                    donor_id: 101,
                    donor_name: "Rahim Ali",
                    status: "available",
                    hours_remaining: 48,
                    created_at: "2023-12-10T10:00:00Z"
                },
                {
                    id: 2,
                    title: "Homemade Bread",
                    description: "Freshly baked whole wheat bread",
                    quantity: "10 loaves",
                    location: "456 Banani Road, Dhaka",
                    contact_phone: "+8801812345678",
                    area_id: 2,
                    area_name: "Banani",
                    expiry_date: "2023-12-12",
                    image_url: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&h=300&fit=crop",
                    donor_id: 102,
                    donor_name: "Fatima Begum",
                    status: "claimed",
                    claimed_by_name: "Abdul Karim",
                    hours_remaining: 12,
                    created_at: "2023-12-10T08:00:00Z"
                }
            ];
            
            // Filter donations based on selected filters
            let filteredDonations = mockDonations;
            
            if (filterAreaId) {
                filteredDonations = filteredDonations.filter(d => d.area_id == filterAreaId);
            }
            
            if (statusFilter !== 'all') {
                filteredDonations = filteredDonations.filter(d => d.status === statusFilter);
            }
            
            setDonations(filteredDonations);
        } catch (error) {
            console.error('Error loading donations:', error);
            setDonations([]);
        }
        setLoading(false);
    }, [filterAreaId, statusFilter]);

    const fetchAreas = useCallback(async () => {
        try {
            // Comprehensive list of Dhaka areas
            const mockAreas = [
                { id: 1, name: "Gulshan" },
                { id: 2, name: "Banani" },
                { id: 3, name: "Dhanmondi" },
                { id: 4, name: "Mohakhali" },
                { id: 5, name: "Uttara" },
                { id: 6, name: "Mirpur" },
                { id: 7, name: "Motijheel" },
                { id: 8, name: "Farmgate" },
                { id: 9, name: "Mohammadpur" },
                { id: 10, name: "Shyamoli" },
                { id: 11, name: "Adabor" },
                { id: 12, name: "Lalmatia" },
                { id: 13, name: "Rampura" },
                { id: 14, name: "Badda" },
                { id: 15, name: "Khilgaon" },
                { id: 16, name: "Malibagh" },
                { id: 17, name: "Shantinagar" },
                { id: 18, name: "Moghbazar" },
                { id: 19, name: "Eskaton" },
                { id: 20, name: "Tejgaon" },
                { id: 21, name: "Jatrabari" },
                { id: 22, name: "Demra" },
                { id: 23, name: "Sabujbagh" },
                { id: 24, name: "Pallabi" },
                { id: 25, name: "Kafrul" },
                { id: 26, name: "Cantonment" },
                { id: 27, name: "Hazaribagh" },
                { id: 28, name: "Kamrangirchar" },
                { id: 29, name: "Keraniganj" },
                { id: 30, name: "Nawabganj" }
            ];
            setAreas(mockAreas);
        } catch (error) {
            console.error('Error loading areas:', error);
            setAreas([]);
        }
    }, []);

    const handleNewDonation = useCallback((newDonation) => {
        // Add the new donation to the list
        setDonations(prev => [newDonation, ...prev]);
        
        // Switch to the available filter to see the new donation
        setStatusFilter('available');
    }, []);

    const handleClaimDonation = async (donation) => {
        if (!user) {
            alert('Please log in to claim donations.');
            return;
        }
        
        setClaimingDonation(donation.id);
        try {
            // Add donation to cart as a special item
            const cartItem = {
                id: `donation_${donation.id}`,
                name: donation.title,
                description: donation.description,
                price: 0, // Donations are free
                quantity: 1,
                image: donation.image_url,
                type: 'donation',
                donation_id: donation.id,
                donor_id: donation.donor_id,
                pickup_location: donation.location,
                pickup_area: donation.area_name,
                contact_phone: donation.contact_phone
            };
            
            await addToCart(cartItem);
            
            // Update the donation status locally
            setDonations(prev => prev.map(d => 
                d.id === donation.id 
                    ? {...d, status: 'claimed', claimed_by_name: user.name || 'You'} 
                    : d
            ));
            
            alert('Donation claimed successfully! Added to your cart.');
        } catch (error) {
            console.error('Error claiming donation:', error);
            alert('Failed to claim donation. Please try again.');
        }
        setClaimingDonation(null);
    };

    const handleCompleteDonation = async (donationId) => {
        if (!user) {
            alert('Please log in to mark donations as completed.');
            return;
        }
        
        const confirmed = window.confirm('Are you sure you want to mark this donation as completed?');
        if (!confirmed) return;
        
        try {
            // Simulate API call - in a real app, you would call your backend
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Update the donation status locally
            setDonations(prev => prev.map(d => 
                d.id === donationId 
                    ? {...d, status: 'completed', completed_at: new Date().toISOString()} 
                    : d
            ));
            
            alert('Donation marked as completed!');
        } catch (error) {
            console.error('Error completing donation:', error);
            alert('Failed to complete donation. Please try again.');
        }
    };

    const handleCheckout = () => {
        navigate('/checkout');
    };

    const handleViewCart = () => {
        navigate('/cart');
    };

    useEffect(() => {
        fetchAreas();
    }, [fetchAreas]);

    useEffect(() => {
        loadDonations();
    }, [loadDonations]);

    const formatTimeRemaining = (hoursRemaining) => {
        if (hoursRemaining <= 0) return 'Expired';
        const days = Math.floor(hoursRemaining / 24);
        const hours = Math.floor(hoursRemaining % 24);
        if (days > 0) {
            return `${days}d ${hours}h left`;
        }
        return `${hours}h left`;
    };

    const getStatusCount = (status) => {
        const counts = {
            available: donations.filter(d => d.status === 'available').length,
            claimed: donations.filter(d => d.status === 'claimed').length,
            completed: donations.filter(d => d.status === 'completed').length
        };
        return counts[status] || 0;
    };

    return (
        <>
            <GlobalStyle />
            <div>
                <div style={{marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div>
                        <h1 style={{fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1f2937'}}>
                            Food Donations
                        </h1>
                        <p style={{fontSize: '1.1rem', color: '#6b7280'}}>
                            Help reduce food waste by claiming available donations or track your contributions
                        </p>
                    </div>
                    <div style={{display: 'flex', gap: '1rem'}}>
                        <Button variant="success" onClick={handleViewCart} style={{width: 'auto'}}>
                            <ShoppingCart size={18} /> View Cart
                        </Button>
                        <Button variant="secondary" onClick={handleCheckout} style={{width: 'auto'}}>
                            Checkout
                        </Button>
                    </div>
                </div>

                <FilterContainer>
                    <div style={{marginBottom: '1rem'}}>
                        <label style={{fontWeight: '600', marginBottom: '0.75rem', display: 'block', color: '#374151'}}>
                            Filter by Status
                        </label>
                        <FilterTabs>
                            <FilterTab 
                                $active={statusFilter === 'available'} 
                                onClick={() => setStatusFilter('available')}
                            >
                                Available ({getStatusCount('available')})
                            </FilterTab>
                            <FilterTab 
                                $active={statusFilter === 'claimed'} 
                                onClick={() => setStatusFilter('claimed')}
                            >
                                Claimed ({getStatusCount('claimed')})
                            </FilterTab>
                            <FilterTab 
                                $active={statusFilter === 'completed'} 
                                onClick={() => setStatusFilter('completed')}
                            >
                                Completed ({getStatusCount('completed')})
                            </FilterTab>
                            <FilterTab 
                                $active={statusFilter === 'all'} 
                                onClick={() => setStatusFilter('all')}
                            >
                                All Donations
                            </FilterTab>
                        </FilterTabs>
                    </div>
                    
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
                                <Spinner size={32} style={{marginBottom: '1rem'}} />
                                <p>Loading donations...</p>
                            </div>
                        ) : (
                            <DonationsGrid>
                                {donations.length > 0 ? donations.map(d => {
                                    const isCompleted = d.status === 'completed';
                                    const isClaimed = d.status === 'claimed';
                                    const isAvailable = d.status === 'available';
                                    const isDonor = user && d.donor_id === user.id;
                                    
                                    return (
                                        <DonationCard key={d.id}>
                                            <CardImage>
                                                <img 
                                                    src={d.image_url} 
                                                    alt={d.title}
                                                    onError={(e) => {
                                                        e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';
                                                    }}
                                                />
                                            </CardImage>
                                            <CardContent>
                                                <CardHeader>
                                                    <CardTitle>{d.title}</CardTitle>
                                                    <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                                                        {isCompleted && <Badge variant="completed">Completed</Badge>}
                                                        {isClaimed && !isCompleted && <Badge variant="claimed">Claimed</Badge>}
                                                        {isAvailable && d.hours_remaining <= 24 && d.hours_remaining > 0 && (
                                                            <Badge variant="urgent">Expires Soon</Badge>
                                                        )}
                                                        {isAvailable && d.hours_remaining > 168 && (
                                                            <Badge variant="new">Fresh</Badge>
                                                        )}
                                                    </div>
                                                </CardHeader>
                                                <p style={{
                                                    fontSize: '0.9rem', 
                                                    color: '#64748b', 
                                                    flexGrow: 1, 
                                                    lineHeight: '1.5',
                                                    margin: '0 0 1rem 0'
                                                }}>
                                                    {d.description}
                                                </p>
                                                <div style={{
                                                    background: '#f8fafc',
                                                    padding: '0.75rem',
                                                    borderRadius: '8px',
                                                    fontSize: '0.85rem'
                                                }}>
                                                    <p style={{margin: '0 0 0.25rem 0'}}>
                                                        <strong>Donor:</strong> {d.donor_name}
                                                    </p>
                                                    <p style={{margin: '0 0 0.25rem 0', color: '#64748b'}}>
                                                        <strong>Location:</strong> {d.location}
                                                    </p>
                                                    {isClaimed && d.claimed_by_name && (
                                                        <p style={{margin: '0', color: '#8b5cf6'}}>
                                                            <strong>Claimed by:</strong> {d.claimed_by_name}
                                                        </p>
                                                    )}
                                                    {isCompleted && d.completed_at && (
                                                        <p style={{margin: '0', color: '#10b981'}}>
                                                            <strong>Completed:</strong> {new Date(d.completed_at).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                </div>
                                                
                                                {/* Action Buttons */}
                                                {isAvailable && !isDonor && (
                                                    <ClaimButton
                                                        onClick={() => handleClaimDonation(d)}
                                                        disabled={claimingDonation === d.id}
                                                    >
                                                        {claimingDonation === d.id ? (
                                                            <>
                                                                <Spinner size={16} />
                                                                Claiming...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Heart size={16} />
                                                                Claim Donation
                                                            </>
                                                        )}
                                                    </ClaimButton>
                                                )}
                                                
                                                {isClaimed && isDonor && (
                                                    <ClaimButton onClick={() => handleCompleteDonation(d.id)}>
                                                        <Package size={16} />
                                                        Mark as Completed
                                                    </ClaimButton>
                                                )}
                                            </CardContent>
                                            <CardFooter>
                                                <InfoItem>
                                                    <MapPin size={14}/> 
                                                    {d.area_name}
                                                </InfoItem>
                                                <InfoItem>
                                                    <Package size={14}/> 
                                                    {d.quantity}
                                                </InfoItem>
                                                <InfoItem>
                                                    <Clock size={14}/>
                                                    {formatTimeRemaining(d.hours_remaining)}
                                                </InfoItem>
                                            </CardFooter>
                                        </DonationCard>
                                    );
                                }) : (
                                    <div style={{
                                        gridColumn: '1 / -1',
                                        textAlign: 'center',
                                        padding: '3rem',
                                        color: '#6b7280'
                                    }}>
                                        <Package size={48} style={{marginBottom: '1rem', opacity: 0.5}} />
                                        <p style={{fontSize: '1.1rem', marginBottom: '0.5rem'}}>
                                            No donations found
                                        </p>
                                        <p>
                                            {statusFilter === 'available' && 'No available donations in this area right now.'}
                                            {statusFilter === 'claimed' && 'No claimed donations to show.'}
                                            {statusFilter === 'completed' && 'No completed donations yet.'}
                                            {statusFilter === 'all' && 'No donations found with current filters.'}
                                        </p>
                                    </div>
                                )}
                            </DonationsGrid>
                        )}
                    </div>
                    <div>
                        <DonationForm onDonationAdded={handleNewDonation} areas={areas} />
                    </div>
                </PageLayout>
            </div>
        </>
    );
}