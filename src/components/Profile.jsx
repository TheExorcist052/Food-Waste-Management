import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { useApp } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { User, Activity, ShoppingBag, Leaf, Award, Gift, Heart, Star, Edit, Calendar } from 'lucide-react';

const ProfileLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  align-items: flex-start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const UserCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: ${({ theme }) => theme.borderRadius || '8px'};
  box-shadow: ${({ theme }) => theme.shadows?.md || '0 4px 6px -1px rgb(0 0 0 / 0.1)'};
  text-align: center;
  position: sticky;
  top: 2rem;
`;

const Avatar = styled.img`
    width: 120px;
    height: 120px;
    border-radius: 50%;
    border: 4px solid ${({ theme }) => theme.colors?.primary || '#059669'};
    margin-bottom: 1rem;
    background-color: #f0f0f0;
    object-fit: cover;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        transform: scale(1.05);
    }
`;

const UserName = styled.h2`
    margin: 0 0 0.5rem 0;
    color: ${({ theme }) => theme.colors?.text || '#1f2937'};
`;

const UserEmail = styled.p`
    margin: 0 0 1rem 0;
    color: ${({ theme }) => theme.colors?.textLight || '#64748b'};
    font-size: 0.9rem;
`;

const UserBio = styled.p`
    margin: 0 0 1.5rem 0;
    color: ${({ theme }) => theme.colors?.textLight || '#64748b'};
    font-style: italic;
    line-height: 1.4;
`;

const StatGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-top: 1.5rem;
    text-align: center;
`;

const StatItem = styled.div`
    padding: 1rem;
    background: ${({ theme }) => theme.colors?.primary || '#059669'}08;
    border-radius: 8px;
    border: 2px solid ${({ theme }) => theme.colors?.primary || '#059669'}20;
    transition: all 0.2s;

    &:hover {
        border-color: ${({ theme }) => theme.colors?.primary || '#059669'};
        transform: translateY(-2px);
    }
    
    h4 { 
        margin: 0 0 4px 0; 
        color: ${({ theme }) => theme.colors?.primary || '#059669'}; 
        font-size: 1.8rem; 
        font-weight: bold;
    }
    
    p { 
        margin: 0; 
        font-size: 0.85rem; 
        color: ${({ theme }) => theme.colors?.textLight || '#64748b'}; 
        font-weight: 500;
    }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ContentBox = styled.div`
  background: white;
  padding: 2rem;
  border-radius: ${({ theme }) => theme.borderRadius || '8px'};
  box-shadow: ${({ theme }) => theme.shadows?.md || '0 4px 6px -1px rgb(0 0 0 / 0.1)'};
`;

const SectionHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    
    h3 {
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: ${({ theme }) => theme.colors?.text || '#1f2937'};
    }
`;

const ActivityItem = styled.div`
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    padding: 1rem 0;
    border-bottom: 1px solid ${({ theme }) => theme.colors?.border || '#e2e8f0'};
    
    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background-color: #f8fafc;
        margin: 0 -1rem;
        padding: 1rem;
        border-radius: 8px;
    }
`;

const IconWrapper = styled.div`
    background-color: ${({ theme, activityType }) => getActivityBg(activityType, theme)};
    color: ${({ theme, activityType }) => getActivityColor(activityType, theme)};
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
`;

const ActivityContent = styled.div`
    flex: 1;
    
    h5 {
        margin: 0 0 4px 0;
        font-size: 0.95rem;
        font-weight: 600;
        color: ${({ theme }) => theme.colors?.text || '#1f2937'};
    }
    
    p {
        margin: 0;
        font-size: 0.85rem;
        color: ${({ theme }) => theme.colors?.textLight || '#64748b'};
        line-height: 1.4;
    }
`;

const ActivityMeta = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 8px;
    
    .date {
        color: ${({ theme }) => theme.colors?.textLight || '#64748b'};
        font-size: 0.8rem;
        display: flex;
        align-items: center;
        gap: 4px;
    }
    
    .points {
        color: #10b981;
        font-weight: 600;
        font-size: 0.85rem;
    }
`;

const OrderItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border: 1px solid ${({ theme }) => theme.colors?.border || '#e2e8f0'};
    border-radius: 8px;
    margin-bottom: 1rem;
    transition: all 0.2s;

    &:hover {
        border-color: ${({ theme }) => theme.colors?.primary || '#059669'};
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    &:last-child {
        margin-bottom: 0;
    }
`;

const OrderInfo = styled.div`
    h5 {
        margin: 0 0 4px 0;
        color: ${({ theme }) => theme.colors?.text || '#1f2937'};
    }
    
    p {
        margin: 0;
        font-size: 0.85rem;
        color: ${({ theme }) => theme.colors?.textLight || '#64748b'};
    }
`;

const OrderStatus = styled.div`
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    background: ${({ status }) => getStatusBg(status)};
    color: ${({ status }) => getStatusColor(status)};
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 2rem;
    color: ${({ theme }) => theme.colors?.textLight || '#64748b'};
    
    svg {
        opacity: 0.5;
        margin-bottom: 1rem;
    }
    
    h4 {
        margin: 0 0 8px 0;
        color: ${({ theme }) => theme.colors?.text || '#1f2937'};
    }
`;

const LoadingState = styled.div`
    text-align: center;
    padding: 3rem;
    color: ${({ theme }) => theme.colors?.textLight || '#64748b'};
`;

const ErrorState = styled.div`
    text-align: center;
    padding: 2rem;
    color: #ef4444;
    background: #fef2f2;
    border-radius: 8px;
    border: 1px solid #fecaca;
`;

const EditButton = styled.button`
    background: ${({ theme }) => theme.colors?.primary || '#059669'};
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.8rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: all 0.2s;

    &:hover {
        opacity: 0.9;
        transform: translateY(-1px);
    }
`;

const RefreshButton = styled.button`
    background: none;
    border: 1px solid ${({ theme }) => theme.colors?.border || '#e2e8f0'};
    color: ${({ theme }) => theme.colors?.textLight || '#64748b'};
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.8rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: all 0.2s;

    &:hover {
        border-color: ${({ theme }) => theme.colors?.primary || '#059669'};
        color: ${({ theme }) => theme.colors?.primary || '#059669'};
    }
`;

// Helper functions
const getActivityColor = (activityType, theme) => {
    const colors = {
        donation: '#10b981',
        order: theme?.colors?.primary || '#059669',
        review: '#8b5cf6',
        rescue: '#f59e0b',
        default: theme?.colors?.textLight || '#64748b'
    };
    return colors[activityType] || colors.default;
};

const getActivityBg = (activityType, theme) => {
    const backgrounds = {
        donation: '#10b98120',
        order: (theme?.colors?.primary || '#059669') + '20',
        review: '#8b5cf620',
        rescue: '#f59e0b20',
        default: '#64748b20'
    };
    return backgrounds[activityType] || backgrounds.default;
};

const getActivityIcon = (activityType) => {
    const icons = {
        donation: <Gift size={20} />,
        order: <ShoppingBag size={20} />,
        review: <Star size={20} />,
        rescue: <Award size={20} />,
        default: <Activity size={20} />
    };
    return icons[activityType] || icons.default;
};

const getStatusBg = (status) => {
    const backgrounds = {
        completed: '#10b98120',
        pending: '#f59e0b20',
        cancelled: '#ef444420',
        processing: '#3b82f620',
        default: '#64748b20'
    };
    return backgrounds[status] || backgrounds.default;
};

const getStatusColor = (status) => {
    const colors = {
        completed: '#10b981',
        pending: '#f59e0b',
        cancelled: '#ef4444',
        processing: '#3b82f6',
        default: '#64748b'
    };
    return colors[status] || colors.default;
};

export default function Profile() {
    const { user, apiCall } = useApp();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const fetchProfileData = useCallback(async (isRefresh = false) => {
        if (!user || !user.id) {
            navigate('/auth');
            return;
        }

        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        setError(null);
        
        try {
            const res = await apiCall(`get_user_profile?user_id=${user.id}`);
            
            if (res && res.success && res.data) {
                setProfileData(res.data);
            } else {
                // If API fails, create basic profile from user context
                setProfileData({
                    user: user,
                    stats: {
                        total_orders: 0,
                        total_donations: 0,
                        points_earned: user.points_earned || 0
                    },
                    activities: [],
                    orders: [],
                    impact_metrics: {
                        meals_equivalent: 0,
                        co2_saved: 0,
                        food_rescued_kg: 0
                    }
                });
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Failed to load profile data. Please try again.');
            // Fallback to user context data
            setProfileData({
                user: user,
                stats: {
                    total_orders: 0,
                    total_donations: 0,
                    points_earned: user.points_earned || 0
                },
                activities: [],
                orders: [],
                impact_metrics: {
                    meals_equivalent: 0,
                    co2_saved: 0,
                    food_rescued_kg: 0
                }
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user, apiCall, navigate]);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

    const handleRefresh = () => {
        fetchProfileData(true);
    };

    if (loading && !refreshing) {
        return <LoadingState>Loading your profile...</LoadingState>;
    }

    if (!profileData || !profileData.user) {
        return (
            <ErrorState>
                <p>{error || 'Could not load profile data. Please try logging in again.'}</p>
                <button onClick={() => fetchProfileData()} style={{marginTop: '1rem'}}>
                    Try Again
                </button>
            </ErrorState>
        );
    }
    
    const { user: profileUser, stats, activities, orders, impact_metrics } = profileData;

    return (
        <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
                <h1>My Profile</h1>
                <RefreshButton onClick={handleRefresh} disabled={refreshing}>
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </RefreshButton>
            </div>
            
            <ProfileLayout>
                <UserCard>
                    <Avatar 
                        src={profileUser.avatar || '/avatars/default_user.jpg'} 
                        alt="Your avatar"
                        onError={(e) => {
                            e.target.src = '/avatars/default_user.jpg';
                        }}
                    />
                    <UserName>{profileUser.name || 'Your Name'}</UserName>
                    <UserEmail>{profileUser.email || 'your.email@example.com'}</UserEmail>
                    <UserBio>{profileUser.bio || 'No bio provided yet. Add one to tell others about yourself!'}</UserBio>
                    
                    <EditButton>
                        <Edit size={14} />
                        Edit Profile
                    </EditButton>
                    
                    <StatGrid>
                        <StatItem>
                           <h4>{stats?.total_orders || 0}</h4>
                           <p>Orders Placed</p>
                        </StatItem>
                        <StatItem>
                           <h4>{stats?.total_donations || profileUser.donation_count || 0}</h4>
                           <p>Donations Made</p>
                        </StatItem>
                        <StatItem>
                           <h4>{impact_metrics?.meals_equivalent || 0}</h4>
                           <p>Meals Provided</p>
                        </StatItem>
                        <StatItem>
                           <h4>{stats?.points_earned || profileUser.points_earned || 0}</h4>
                           <p>Points Earned</p>
                        </StatItem>
                    </StatGrid>
                </UserCard>
                
                <MainContent>
                    <ContentBox>
                        <SectionHeader>
                            <h3>
                                <Activity size={20} />
                                Recent Activity
                            </h3>
                        </SectionHeader>
                        
                        {activities && activities.length > 0 ? (
                            activities.slice(0, 10).map(act => (
                                <ActivityItem key={act.id}>
                                    <IconWrapper activityType={act.activity_type}>
                                        {getActivityIcon(act.activity_type)}
                                    </IconWrapper>
                                    <ActivityContent>
                                        <h5>{act.title || act.description}</h5>
                                        <p>{act.details || 'Activity completed successfully'}</p>
                                        <ActivityMeta>
                                            <div className="date">
                                                <Calendar size={12} />
                                                {act.created_at ? new Date(act.created_at).toLocaleDateString() : 'Recently'}
                                            </div>
                                            {act.points_earned > 0 && (
                                                <div className="points">+{act.points_earned} pts</div>
                                            )}
                                        </ActivityMeta>
                                    </ActivityContent>
                                </ActivityItem>
                            ))
                        ) : (
                            <EmptyState>
                                <Activity size={48} />
                                <h4>No recent activity</h4>
                                <p>Start making donations or ordering food to see your activity here!</p>
                            </EmptyState>
                        )}
                    </ContentBox>
                     
                    <ContentBox>
                        <SectionHeader>
                            <h3>
                                <ShoppingBag size={20} />
                                Order History
                            </h3>
                        </SectionHeader>
                        
                        {orders && orders.length > 0 ? (
                            orders.slice(0, 5).map(order => (
                                <OrderItem key={order.id}>
                                    <OrderInfo>
                                        <h5>Order #{order.id}</h5>
                                        <p>
                                            {order.restaurant_name} • {order.items_count || 1} items • 
                                            ${order.total_amount || '0.00'}
                                        </p>
                                        <p style={{fontSize: '0.8rem', marginTop: '4px'}}>
                                            {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Recently'}
                                        </p>
                                    </OrderInfo>
                                    <OrderStatus status={order.status || 'completed'}>
                                        {order.status || 'Completed'}
                                    </OrderStatus>
                                </OrderItem>
                            ))
                        ) : (
                            <EmptyState>
                                <ShoppingBag size={48} />
                                <h4>No orders yet</h4>
                                <p>Your order history will appear here once you start ordering rescued food!</p>
                            </EmptyState>
                        )}
                    </ContentBox>

                    <ContentBox>
                        <SectionHeader>
                            <h3>
                                <Leaf size={20} />
                                Environmental Impact
                            </h3>
                        </SectionHeader>
                        
                        <StatGrid>
                            <StatItem>
                                <h4>{impact_metrics?.food_rescued_kg || 0} kg</h4>
                                <p>Food Rescued</p>
                            </StatItem>
                            <StatItem>
                                <h4>{impact_metrics?.co2_saved || 0} kg</h4>
                                <p>CO₂ Saved</p>
                            </StatItem>
                            <StatItem>
                                <h4>{impact_metrics?.meals_equivalent || 0}</h4>
                                <p>Meals Equivalent</p>
                            </StatItem>
                            <StatItem>
                                <h4>{impact_metrics?.trees_saved || 0}</h4>
                                <p>Trees Equivalent</p>
                            </StatItem>
                        </StatGrid>
                    </ContentBox>
                </MainContent>
            </ProfileLayout>
        </div>
    );
}