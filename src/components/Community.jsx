import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { useApp } from '../contexts/AppContext';
import { MessageSquare, Heart, Share2, Award, Utensils, Gift, Tag, RefreshCw } from 'lucide-react';

const FeedContainer = styled.div`
  max-width: 700px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FeedItem = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: ${({ theme }) => theme.borderRadius || '8px'};
  box-shadow: ${({ theme }) => theme.shadows?.md || '0 4px 6px -1px rgb(0 0 0 / 0.1)'};
  border-left: 4px solid ${({ activityType, theme }) => getActivityColor(activityType, theme)};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  }
`;

const ItemHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const Avatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid ${({ theme }) => theme.colors?.border || '#e2e8f0'};
`;

const ActivityBadge = styled.div`
  background: ${({ activityType, theme }) => getActivityColor(activityType, theme)}20;
  color: ${({ activityType, theme }) => getActivityColor(activityType, theme)};
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ItemFooter = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors?.border || '#e2e8f0'};
  color: ${({ theme }) => theme.colors?.textLight || '#64748b'};
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: inherit;
  font-weight: 500;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
    color: ${({ theme }) => theme.colors?.primary || '#059669'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.colors?.textLight || '#64748b'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${({ theme }) => theme.colors?.textLight || '#64748b'};
`;

const RefreshButton = styled.button`
  background: ${({ theme }) => theme.colors?.primary || '#059669'};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: ${({ theme }) => theme.borderRadius || '8px'};
  font-weight: 500;
  cursor: pointer;
  margin: 0 auto 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    animation: ${props => props.spinning ? 'spin 1s linear infinite' : 'none'};
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
`;

const NewPostsIndicator = styled.div`
  background: ${({ theme }) => theme.colors?.primary || '#059669'};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  cursor: pointer;
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`;

// Helper function to get activity colors
const getActivityColor = (activityType, theme) => {
  const colors = {
    donation: theme?.colors?.success || '#10b981',
    discount: theme?.colors?.warning || '#f59e0b', 
    product_listed: theme?.colors?.info || '#3b82f6',
    food_rescued: theme?.colors?.primary || '#059669',
    review_posted: theme?.colors?.secondary || '#8b5cf6',
    default: theme?.colors?.textLight || '#64748b'
  };
  return colors[activityType] || colors.default;
};

const activityIcons = {
    donation: <Gift size={16} />,
    discount: <Tag size={16} />,
    product_listed: <Utensils size={16} />,
    food_rescued: <Award size={16} />,
    review_posted: <MessageSquare size={16} />,
    default: <MessageSquare size={16} />
};

const activityLabels = {
    donation: 'Donation Made',
    discount: 'Discount Offered',
    product_listed: 'Food Listed',
    food_rescued: 'Food Rescued',
    review_posted: 'Review Posted',
    default: 'Activity'
};

export default function Community() {
    const { apiCall, user } = useApp();
    const [feed, setFeed] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [lastFetchTime, setLastFetchTime] = useState(Date.now());
    const [newPostsAvailable, setNewPostsAvailable] = useState(false);

    const fetchFeed = useCallback(async (isRefresh = false, isBackground = false) => {
        if (isRefresh && !isBackground) {
            setRefreshing(true);
        } else if (!isBackground) {
            setLoading(true);
        }
        setError(null);
        
        try {
            const res = await apiCall('get_community_feed', {}, 'GET');
            if (res && res.success && res.data) {
                const newFeed = res.data.feed || [];
                
                if (isBackground && feed.length > 0) {
                    // Check if there are new posts
                    const latestPostTime = newFeed.length > 0 ? new Date(newFeed[0].created_at).getTime() : 0;
                    if (latestPostTime > lastFetchTime) {
                        setNewPostsAvailable(true);
                    }
                } else {
                    setFeed(newFeed);
                    setLastFetchTime(Date.now());
                    setNewPostsAvailable(false);
                }
            } else {
                if (!isBackground) {
                    setError('Failed to load community feed');
                    setFeed([]);
                }
            }
        } catch (err) {
            console.error('Error fetching community feed:', err);
            if (!isBackground) {
                setError('Network error. Please check your connection.');
                setFeed([]);
            }
        } finally {
            if (!isBackground) {
                setLoading(false);
                setRefreshing(false);
            }
        }
    }, [apiCall, feed.length, lastFetchTime]);

    useEffect(() => {
        fetchFeed();
        
        // Set up polling for real-time updates
        const interval = setInterval(() => {
            fetchFeed(true, true); // Background refresh
        }, 15000); // Check every 15 seconds

        return () => clearInterval(interval);
    }, [fetchFeed]);

    const handleRefresh = () => {
        fetchFeed(true);
        setNewPostsAvailable(false);
    };

    const handleShowNewPosts = () => {
        fetchFeed(true);
        setNewPostsAvailable(false);
    };

    const handleLike = async (itemId, itemType) => {
        if (!user || !user.id) {
            setError('Please log in to like posts');
            return;
        }

        // Optimistic update
        setFeed(prevFeed => prevFeed.map(item => 
            item.id === itemId ? {
                ...item,
                likes_count: item.user_liked 
                    ? (item.likes_count || 1) - 1 
                    : (item.likes_count || 0) + 1,
                user_liked: !item.user_liked
            } : item
        ));

        try {
            const res = await apiCall('toggle_like', { 
                item_id: itemId, 
                item_type: itemType,
                user_id: user.id
            });
            
            if (res && res.success && res.data) {
                // Update with server response
                setFeed(prevFeed => prevFeed.map(item => 
                    item.id === itemId ? {
                        ...item,
                        likes_count: res.data.likes_count,
                        user_liked: res.data.user_liked
                    } : item
                ));
            } else {
                // Revert optimistic update on failure
                setFeed(prevFeed => prevFeed.map(item => 
                    item.id === itemId ? {
                        ...item,
                        likes_count: item.user_liked 
                            ? (item.likes_count || 0) + 1 
                            : (item.likes_count || 1) - 1,
                        user_liked: !item.user_liked
                    } : item
                ));
            }
        } catch (err) {
            console.error('Error toggling like:', err);
            // Revert optimistic update on error
            setFeed(prevFeed => prevFeed.map(item => 
                item.id === itemId ? {
                    ...item,
                    likes_count: item.user_liked 
                        ? (item.likes_count || 0) + 1 
                        : (item.likes_count || 1) - 1,
                    user_liked: !item.user_liked
                } : item
            ));
        }
    };

    if (loading && !refreshing) {
        return (
            <div>
                <h1 style={{textAlign: 'center', marginBottom: '2rem'}}>Community Wall</h1>
                <LoadingMessage>
                    <RefreshCw size={20} className="animate-spin" />
                    Loading community feed...
                </LoadingMessage>
            </div>
        );
    }

    return (
        <div>
            <h1 style={{textAlign: 'center', marginBottom: '1rem'}}>Community Wall</h1>
            <RefreshButton onClick={handleRefresh} disabled={refreshing} spinning={refreshing}>
                <RefreshCw size={16} />
                {refreshing ? 'Refreshing...' : 'Refresh Feed'}
            </RefreshButton>
            
            {newPostsAvailable && (
                <NewPostsIndicator onClick={handleShowNewPosts}>
                    New posts available! Click to refresh
                </NewPostsIndicator>
            )}
            
            {error && (
                <ErrorMessage>
                    {error}
                    <button 
                        onClick={() => fetchFeed()} 
                        style={{
                            marginLeft: '1rem',
                            background: 'transparent',
                            border: '1px solid currentColor',
                            color: 'inherit',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Try Again
                    </button>
                </ErrorMessage>
            )}
            
            <FeedContainer>
                {feed.length === 0 ? (
                    <EmptyState>
                        <MessageSquare size={48} style={{marginBottom: '1rem', opacity: 0.5}} />
                        <h3>No community activity yet</h3>
                        <p>Be the first to make a donation or list food to rescue!</p>
                    </EmptyState>
                ) : (
                    feed.map(item => (
                        <FeedItem key={`${item.type || 'activity'}-${item.id}`} activityType={item.activity_type || item.post_type}>
                            <ItemHeader>
                                <Avatar 
                                    src={item.user_avatar || '/avatars/default_user.jpg'} 
                                    alt={`${item.user_name || 'User'} avatar`}
                                    onError={(e) => {
                                        e.target.src = '/avatars/default_user.jpg';
                                    }}
                                />
                                <div style={{flex: 1}}>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                                        <h5 style={{margin: 0}}>{item.user_name || 'Anonymous User'}</h5>
                                        <ActivityBadge activityType={item.activity_type || item.post_type}>
                                            {activityIcons[item.activity_type || item.post_type] || activityIcons.default}
                                            {activityLabels[item.activity_type || item.post_type] || activityLabels.default}
                                        </ActivityBadge>
                                    </div>
                                    <p style={{margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b'}}>
                                        {item.created_at ? new Date(item.created_at).toLocaleString() : 'Recently'}
                                    </p>
                                </div>
                            </ItemHeader>
                            
                            <div>
                                <p style={{margin: '0 0 0.5rem 0', fontWeight: '500'}}>
                                    {item.title || item.content || item.description || 'New activity'}
                                </p>
                                {item.description && item.content !== item.description && (
                                    <p style={{margin: '0', color: '#64748b', fontSize: '0.9rem'}}>
                                        {item.description}
                                    </p>
                                )}
                                {item.points_earned > 0 && (
                                    <p style={{margin: '0.5rem 0 0 0', color: '#10b981', fontWeight: '600', fontSize: '0.9rem'}}>
                                        +{item.points_earned} points earned
                                    </p>
                                )}
                            </div>

                            <ItemFooter>
                                <ActionButton 
                                    onClick={() => handleLike(item.id, item.type || 'activity')}
                                    disabled={!user}
                                >
                                    <Heart 
                                        size={18} 
                                        fill={item.user_liked ? '#ef4444' : 'none'}
                                        color={item.user_liked ? '#ef4444' : 'currentColor'}
                                    />
                                    <span>{item.likes_count || 0} Likes</span>
                                </ActionButton>
                                <ActionButton disabled>
                                    <MessageSquare size={18}/>
                                    <span>{item.comments_count || 0} Comments</span>
                                </ActionButton>
                                <ActionButton disabled>
                                    <Share2 size={18}/>
                                    <span>{item.shares_count || 0} Shares</span>
                                </ActionButton>
                            </ItemFooter>
                        </FeedItem>
                    ))
                )}
            </FeedContainer>
        </div>
    );
}