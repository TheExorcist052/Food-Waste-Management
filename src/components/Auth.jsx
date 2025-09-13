import React, { useState, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { useApp } from '../contexts/AppContext';
import { KeyRound, Mail, User, Shield, ArrowRight, Upload, Briefcase, Hash, CheckCircle, Gift, ShieldCheck } from 'lucide-react';

// --- Demo Avatars ---
const demoAvatars = [
  'https://api.multiavatar.com/User-1.svg',
  'https://api.multiavatar.com/User-2.svg',
  'https://api.multiavatar.com/User-3.svg',
  'https://api.multiavatar.com/User-4.svg',
  'https://api.multiavatar.com/User-5.svg',
];

// --- Animations & Styled Components ---
const fadeIn = keyframes`from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); }`;

const AuthPage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 70px);
  padding: 2rem;
`;

const AuthContainer = styled.div`
  display: flex;
  width: 100%;
  max-width: 900px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: ${fadeIn} 0.5s ease-out;
`;

const BrandingPanel = styled.div`
  width: 45%;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, #047857 100%);
  color: white;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
`;

const FormPanel = styled.div`
  width: 55%;
  padding: 3rem;
  overflow-y: auto;
`;

const Form = styled.form`
  display: flex; flex-direction: column; gap: 1.25rem;
`;

const InputGroup = styled.div`
  position: relative;
  .icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #9ca3af; }
`;

const Input = styled.input`
  width: 100%; padding: 14px 14px 14px 45px; border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border}; font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}30;
    outline: none;
  }
`;

const Button = styled.button`
  width: 100%; padding: 14px;
  background: ${({ theme }) => theme.colors.primary};
  color: white; border: none; border-radius: 10px; font-size: 1rem; font-weight: bold;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: background-color 0.2s, transform 0.2s;
  &:hover { background: ${({ theme }) => theme.colors.primaryDark}; transform: translateY(-2px); }
  &:disabled { background: #9ca3af; cursor: not-allowed; transform: none; }
`;

const TabContainer = styled.div` display: flex; background-color: #f9fafb; border-radius: 10px; padding: 4px; margin-bottom: 2rem; `;

const Tab = styled.button`
  flex: 1; padding: 0.75rem; font-size: 0.9rem; font-weight: 600; border: none; border-radius: 8px;
  background: ${props => props.$active ? 'white' : 'transparent'};
  color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.textLight};
  box-shadow: ${props => props.$active ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'};
  cursor: pointer; transition: all 0.2s;
`;

const Message = styled.p`
  padding: 12px; border-radius: 8px; text-align: center; font-weight: 500;
  color: ${props => ({ error: '#721c24', success: '#155724' }[props.type])};
  background-color: ${props => ({ error: '#f8d7da', success: '#d4edda' }[props.type])};
  margin-bottom: 1rem;
`;

const AvatarSection = styled.div` text-align: center; animation: ${fadeIn} 0.3s; `;
const AvatarPreview = styled.img` width: 100px; height: 100px; border-radius: 50%; border: 4px solid ${({ theme }) => theme.colors.primary}50; object-fit: cover; margin-bottom: 1rem; background: #f8fafc;`;
const DemoAvatarGrid = styled.div` display: flex; justify-content: center; gap: 0.5rem; margin-bottom: 1rem; `;
const DemoAvatar = styled.img` width: 40px; height: 40px; border-radius: 50%; cursor: pointer; border: 3px solid ${props => props.$selected ? props.theme.colors.primary : 'transparent'}; transition: all 0.2s; padding: 2px; background: white; &:hover { transform: scale(1.1); }`;
const UploadButton = styled.label`
  display: inline-flex; align-items: center; gap: 8px; background: #f3f4f6; padding: 8px 16px; border-radius: 8px; cursor: pointer;
  font-weight: 500; color: ${({ theme }) => theme.colors.text};
  transition: background-color 0.2s;
  &:hover { background: #e5e7eb; }
`;

const BackButton = styled.button`
  background: none; border: none; color: ${({ theme }) => theme.colors.primary};
  font-weight: 500; cursor: pointer; margin-bottom: 1rem; display: flex; align-items: center; gap: 8px;
  &:hover { text-decoration: underline; }
`;

export default function Auth() {
    const { apiCall, login } = useApp();
    const [authMode, setAuthMode] = useState('login');
    const [view, setView] = useState('form');
    const [formData, setFormData] = useState({ name: '', email: '', password: '', type: 'user', nid_tin_number: '', otp: '' });
    const [selectedAvatar, setSelectedAvatar] = useState(demoAvatars[0]);
    const [uploadedAvatarPreview, setUploadedAvatarPreview] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handleAvatarUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setUploadedAvatarPreview(previewUrl);
            setSelectedAvatar(`https://api.multiavatar.com/${formData.name || 'custom'}.svg`);
        }
    };
    
    const handleDemoAvatarSelect = (avatarUrl) => {
        setSelectedAvatar(avatarUrl);
        setUploadedAvatarPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    const handleRegister = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        
        if (formData.nid_tin_number.trim() === '') {
            setMessage({ text: `Please provide your ${formData.type === 'user' ? 'NID' : 'TIN'} number.`, type: 'error' });
            return;
        }

        setLoading(true);
        try {
            const payload = { ...formData, avatar: uploadedAvatarPreview || selectedAvatar };
            const res = await apiCall('register', { method: 'POST', body: payload });
            
            if (res && res.success) {
                // Send OTP after successful registration
                const otpRes = await apiCall('send_otp', { method: 'POST', body: { email: formData.email } });
                if (otpRes && otpRes.success) {
                    setMessage({ text: 'Registration successful! Please check your otp_log.txt file for the verification code.', type: 'success' });
                    setView('otp');
                    // Clear the OTP field when moving to OTP view
                    setFormData(prev => ({ ...prev, otp: '' }));
                } else {
                    setMessage({ text: 'Registration successful but failed to send OTP. Please try logging in.', type: 'error' });
                }
            } else {
                setMessage({ text: res?.message || 'Registration failed. Please try again.', type: 'error' });
            }
        } catch (error) {
            console.error('Registration error:', error);
            setMessage({ text: 'Registration failed. Please try again.', type: 'error' });
        }
        setLoading(false);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true); 
        setMessage({ text: '', type: '' });
        
        try {
            if (authMode === 'admin') {
                if (formData.email === 'admin@food.com' && formData.password === 'admin123') {
                    login({ id: 0, name: 'Admin', email: 'admin@food.com', type: 'admin' });
                } else {
                    setMessage({ text: 'Invalid admin credentials.', type: 'error' });
                }
                setLoading(false);
                return;
            }
            
            const res = await apiCall('login', { method: 'POST', body: { email: formData.email, password: formData.password } });
            if (res && res.success) {
                login(res.data.user);
            } else { 
                setMessage({ text: res?.message || 'Login failed. Please check your credentials.', type: 'error' }); 
            }
        } catch (error) {
            console.error('Login error:', error);
            setMessage({ text: 'Login failed. Please try again.', type: 'error' });
        }
        setLoading(false);
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true); 
        setMessage({ text: '', type: '' });
        
        if (!formData.otp || formData.otp.trim().length !== 6) {
            setMessage({ text: 'Please enter a valid 6-digit OTP.', type: 'error' });
            setLoading(false);
            return;
        }
        
        try {
            const res = await apiCall('verify_otp', { 
                method: 'POST', 
                body: { 
                    email: formData.email, 
                    otp: formData.otp.trim() 
                } 
            });
            
            if (res && res.success) {
                setMessage({ text: 'Verification successful! You can now log in.', type: 'success' });
                setTimeout(() => {
                    setView('form');
                    setAuthMode('login');
                    setFormData({ name: '', email: '', password: '', type: 'user', nid_tin_number: '', otp: '' });
                    setMessage({ text: '', type: '' });
                }, 2000);
            } else { 
                setMessage({ text: res?.message || 'OTP verification failed. Please try again.', type: 'error' }); 
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            setMessage({ text: 'OTP verification failed. Please try again.', type: 'error' });
        }
        setLoading(false);
    };

    const handleBackToForm = () => {
        setView('form');
        setMessage({ text: '', type: '' });
    };

    const renderRegisterForm = () => (
        <Form onSubmit={handleRegister}>
             <AvatarSection>
                <AvatarPreview 
                    src={uploadedAvatarPreview || selectedAvatar} 
                    alt="Avatar Preview" 
                    onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjE1IiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0yNSA4MEM0MCA3MCA2MCA3MCA3NSA4MEg3NUgyNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                    }}
                />
                <p style={{fontSize: '0.9rem', color: '#64748b', margin: '0 0 1rem 0'}}>
                    Choose a demo avatar or upload your own photo.
                </p>
                <DemoAvatarGrid>
                    {demoAvatars.map((av, index) => (
                        <DemoAvatar 
                            key={av} 
                            src={av} 
                            $selected={selectedAvatar === av && !uploadedAvatarPreview} 
                            onClick={() => handleDemoAvatarSelect(av)} 
                            alt={`Demo avatar ${index + 1}`}
                            onError={(e) => {
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGM0Y0RjYiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIxNiIgcj0iNiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTAgMzJDMTQgMjggMjYgMjggMzAgMzJIMzBIMTBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPg==';
                            }}
                        />
                    ))}
                </DemoAvatarGrid>
                <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap'}}>
                    <UploadButton>
                        <Upload size={16}/> Upload Photo
                        <input 
                            type="file" 
                            accept="image/*" 
                            ref={fileInputRef} 
                            onChange={handleAvatarUpload} 
                            hidden
                        />
                    </UploadButton>
                    {uploadedAvatarPreview && (
                        <button 
                            type="button"
                            onClick={() => {
                                URL.revokeObjectURL(uploadedAvatarPreview);
                                setUploadedAvatarPreview(null);
                                setSelectedAvatar(demoAvatars[0]);
                                if (fileInputRef.current) {
                                    fileInputRef.current.value = "";
                                }
                            }}
                            style={{
                                background: '#fee2e2', 
                                color: '#dc2626', 
                                border: 'none', 
                                padding: '8px 16px', 
                                borderRadius: '8px', 
                                cursor: 'pointer',
                                fontWeight: '500'
                            }}
                        >
                            Remove Upload
                        </button>
                    )}
                </div>
            </AvatarSection>
            <InputGroup><User className="icon" size={20} /><Input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required /></InputGroup>
            <InputGroup><Mail className="icon" size={20} /><Input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required /></InputGroup>
            <InputGroup><KeyRound className="icon" size={20} /><Input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required /></InputGroup>
            <select name="type" value={formData.type} onChange={handleChange} style={{padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', fontSize: '1rem'}}>
                <option value="user">I am a User</option>
                <option value="restaurant">I am a Restaurant</option>
            </select>
            {formData.type === 'user' ? (
                 <InputGroup><Hash className="icon" size={20} /><Input type="text" name="nid_tin_number" placeholder="NID Number" value={formData.nid_tin_number} onChange={handleChange} required /></InputGroup>
            ) : (
                 <InputGroup><Briefcase className="icon" size={20} /><Input type="text" name="nid_tin_number" placeholder="TIN Number" value={formData.nid_tin_number} onChange={handleChange} required /></InputGroup>
            )}
            <Button type="submit" disabled={loading}>{loading ? 'Creating Account...' : 'Create Account'}</Button>
        </Form>
    );

    const renderLoginForm = () => (
        <Form onSubmit={handleLogin}>
            <InputGroup> <Mail className="icon" size={20} /><Input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required /></InputGroup>
            <InputGroup> <KeyRound className="icon" size={20} /><Input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required /></InputGroup>
            <Button type="submit" disabled={loading}>{loading ? 'Signing In...' : 'Sign In'} <ArrowRight size={18} /></Button>
        </Form>
    );

     const renderAdminForm = () => (
         <Form onSubmit={handleLogin}>
            <InputGroup><Mail className="icon" size={20} /><Input type="email" name="email" placeholder="Admin Email (admin@food.com)" value={formData.email} onChange={handleChange} required /></InputGroup>
            <InputGroup><KeyRound className="icon" size={20} /><Input type="password" name="password" placeholder="Admin Password (admin123)" value={formData.password} onChange={handleChange} required /></InputGroup>
            <Button type="submit" disabled={loading}>{loading ? 'Signing In...' : 'Sign In as Admin'} <Shield size={18} /></Button>
        </Form>
    );
    
    const renderOtpForm = () => (
        <Form onSubmit={handleVerifyOtp}>
            <p style={{textAlign: 'center', color: '#64748b', marginBottom: '1.5rem'}}>
                An OTP has been sent for <strong>{formData.email}</strong>. 
                <br />Check the `otp_log.txt` file and enter the 6-digit code below.
            </p>
            <InputGroup>
                <ShieldCheck className="icon" size={20} />
                <Input 
                    type="text" 
                    name="otp" 
                    placeholder="Enter 6-digit OTP" 
                    value={formData.otp} 
                    onChange={handleChange} 
                    maxLength="6"
                    pattern="[0-9]{6}"
                    required 
                />
            </InputGroup>
            <Button type="submit" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify Account'}
                <CheckCircle size={18} />
            </Button>
            <BackButton type="button" onClick={handleBackToForm}>
                ← Back to Registration
            </BackButton>
        </Form>
    );

    const renderContent = () => {
        if (view === 'otp') {
            return (
                <>
                    <div style={{textAlign: 'center', marginBottom: '2rem'}}>
                        <CheckCircle size={48} style={{color: '#10b981', marginBottom: '1rem'}}/>
                        <h2>Verify Your Account</h2>
                    </div>
                    {message.text && <Message type={message.type}>{message.text}</Message>}
                    {renderOtpForm()}
                </>
            );
        }
        
        switch (authMode) {
            case 'register': 
                return (
                    <>
                        <h2>Join the Community</h2>
                        <p style={{marginBottom: '2rem'}}>Create an account to start saving food and helping others.</p>
                        {renderRegisterForm()}
                    </>
                );
            case 'admin': 
                return (
                    <>
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem'}}>
                            <Shield size={24}/>
                            <h2 style={{margin: 0}}>Admin Panel</h2>
                        </div>
                        <p style={{marginBottom: '2rem'}}>Restricted access for administrators only.</p>
                        {renderAdminForm()}
                    </>
                );
            case 'login':
            default: 
                return (
                    <>
                        <h2>Welcome Back!</h2>
                        <p style={{marginBottom: '2rem'}}>Sign in to continue your journey with Food For All.</p>
                        {renderLoginForm()}
                    </>
                );
        }
    };

    return (
        <AuthPage>
            <AuthContainer>
                <BrandingPanel>
                    <Gift size={60} style={{margin: '0 auto 1.5rem'}}/>
                    <h1 style={{fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 'bold'}}>Food For All</h1>
                    <p style={{fontSize: '1.1rem', lineHeight: '1.6'}}>
                        Connecting communities, reducing waste, and fighting hunger. 
                        Your next meal makes a difference.
                    </p>
                </BrandingPanel>
                <FormPanel>
                    {view === 'form' && (
                         <TabContainer>
                            <Tab $active={authMode === 'login'} onClick={() => setAuthMode('login')}>Login</Tab>
                            <Tab $active={authMode === 'register'} onClick={() => setAuthMode('register')}>Register</Tab>
                            <Tab $active={authMode === 'admin'} onClick={() => setAuthMode('admin')}>Admin</Tab>
                        </TabContainer>
                    )}
                    {message.text && view === 'form' && <Message type={message.type}>{message.text}</Message>}
                    <div style={{marginTop: view === 'form' ? '1rem' : '0' }}>
                        {renderContent()}
                    </div>
                </FormPanel>
            </AuthContainer>
        </AuthPage>
    );
}