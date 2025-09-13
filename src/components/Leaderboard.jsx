import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { useApp } from '../contexts/AppContext';
import { Trophy, Medal, Award, Crown, Star, RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const LeaderboardContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: ${({ theme }) => theme.borderRadius || '8px'};
  box-shadow: ${({ theme }) => theme.shadows?.lg || '0 10px 15px -3px rgb(0 0 0 / 0.1)'};
  overflow: hidden;
`;

const Header = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors?.primary || '#059669'} 0%, #10a37f 100%);
  color: white;
  padding: 2rem;
  text-align: center;
`;

const StatsBar = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-around;
  margin-top: 1rem;
  border-radius: 8px;

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const StatItem = styled.div`
  text-align: center;
  
  h3 {
    margin: 0;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
  }
  
  p {
    margin: 0;
    opacity: 0.9;
    font-size: 0.9rem;
  }
  
  .stat-change {
    font-size: 0.8rem;
    opacity: 0.8;
    margin-top: 2px;
  }
`;

const RefreshButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
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

const UserRow = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors?.border || '#e2e8f0'};
  transition: all 0.3s ease;
  position: relative;
  
  &:last-child {
    border-bottom: none;
  }

  &:nth-child(odd) {
    background-color: #f8fafc;
  }

  &:hover {
    background-color: #f1f5f9;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  ${({ rank }) => rank <= 3 && `
    background: linear-gradient(135deg, ${getRankGradient(rank)});
    color: white;
    font-weight: 600;
    
    &:hover {
      background: linear-gradient(135deg, ${getRankGradient(rank)});
      opacity: 0.95;
    }
  `}

  ${({ isCurrentUser }) => isCurrentUser && `
    border: 2px solid #059669;
    background-color: #f0f9ff;
    
    &:hover {
      background-color: #e0f2fe;
    }
  `}
`;

const Rank = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const RankBadge = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  background: ${({ rank }) => getRankColor(rank)};
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
`;

const RankChange = styled.div`
  position: absolute;
  right: 80px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  color: ${({ change, rank }) => {
    if (rank <= 3) return 'rgba(255,255,255,0.8)';
    if (change > 0) return '#10b981';
    if (change < 0) return '#ef4444';
    return '#64748b';
  }};
`;

const Avatar = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 1rem;
  object-fit: cover;
  border: ${({ rank }) => rank <= 3 ? '3px solid rgba(255,255,255,0.8)' : '2px solid #e2e8f0'};
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const UserInfo = styled.div`
  flex-grow: 1;
  
  h4 {
    margin: 0 0 4px 0;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  p {
    margin: 0;
    font-size: 0.8rem;
    opacity: ${({ rank }) => rank <= 3 ? '0.9' : '0.7'};
  }
`;

const UserBadge = styled.span`
  background: ${({ rank }) => rank <= 3 ? 'rgba(255,255,255,0.2)' : '#10b981'};
  color: ${({ rank }) => rank <= 3 ? 'white' : 'white'};
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
`;

const Points = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  
  .points-main {
    font-weight: bold;
    font-size: 1.3rem;
    color: ${({ theme, rank }) => rank <= 3 ? 'white' : theme.colors?.primary || '#059669'};
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .points-change {
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    gap: 2px;
    color: ${({ increase, rank }) => 
      rank <= 3 ? 'rgba(255,255,255,0.8)' : 
      increase ? '#10b981' : increase === false ? '#ef4444' : '#64748b'
    };
  }
`;

const LoadingState = styled.div`
  padding: 3rem;
  text-align: center;
  color: ${({ theme }) => theme.colors?.textLight || '#64748b'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const EmptyState = styled.div`
  padding: 3rem;
  text-align: center;
  color: ${({ theme }) => theme.colors?.textLight || '#64748b'};
  
  svg {
    opacity: 0.5;
    margin-bottom: 1rem;
  }
`;

const ErrorState = styled.div`
  padding: 2rem;
  text-align: center;
  color: #ef4444;
  background: #fef2f2;
  margin: 1rem;
  border-radius: 8px;
  border: 1px solid #fecaca;
`;

const UpdateIndicator = styled.div`
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

// Helper functions
const getRankGradient = (rank) => {
  const gradients = {
    1: '#ffd700, #ffb300', // Gold
    2: '#c0c0c0, #a0a0a0', // Silver
    3: '#cd7f32, #b8860b'  // Bronze
  };
  return gradients[rank] || '#64748b, #475569';
};

const getRankColor = (rank) => {
  const colors = {
    1: '#ffd700', // Gold
    2: '#c0c0c0', // Silver
    3: '#cd7f32'  // Bronze
  };
  return colors[rank] || '#64748b';
};

const getRankIcon = (rank) => {
  switch(rank) {
    case 1: return <Crown size={20} />;
    case 2: return <Medal size={18} />;
    case 3: return <Award size={18} />;
    default: return null;
  }
};

const getRankChangeIcon = (change) => {
  if (change > 0) return <TrendingUp size={12} />;
  if (change < 0) return <TrendingDown size={12} />;
  return <Minus size={12} />;
};

export default function Leaderboard() {
    const { apiCall, user } = useApp();
    const [leaderboard, setLeaderboard] = useState([]);
    const [previousLeaderboard, setPreviousLeaderboard] = useState([]);
    const [stats, setStats] = useState({});
    const [previousStats, setPreviousStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [hasUpdates, setHasUpdates] = useState(false);
    const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());

    const calculateRankChanges = useCallback((current, previous) => {
        return current.map(currentUser => {
            const currentRank = current.findIndex(u => u.id === currentUser.id) + 1;
            const previousRank = previous.findIndex(u => u.id === currentUser.id) + 1;
            
            let rankChange = 0;
            if (previousRank > 0) {
                rankChange = previousRank - currentRank; // Positive = moved up
            }
            
            return {
                ...currentUser,
                currentRank,
                previousRank: previousRank || null,
                rankChange,
                isNew: previousRank === 0
            };
        });
    }, []);

    const fetchLeaderboard = useCallback(async (isRefresh = false, isBackground = false) => {
        if (isRefresh && !isBackground) {
            setRefreshing(true);
        } else if (!isBackground) {
            setLoading(true);
        }
        setError(null);
        
        try {
            const res = await apiCall('get_leaderboard', {}, 'GET');
            if (res && res.success && res.data) {
                const newLeaderboard = res.data.leaderboard || [];
                const newStats = res.data.stats || {};
                
                if (isBackground && leaderboard.length > 0) {
                    // Check for changes in leaderboard
                    const hasLeaderboardChanges = JSON.stringify(newLeaderboard) !== JSON.stringify(leaderboard);
                    const hasStatsChanges = JSON.stringify(newStats) !== JSON.stringify(stats);
                    
                    if (hasLeaderboardChanges || hasStatsChanges) {
                        setHasUpdates(true);
                    }
                } else {
                    setPreviousLeaderboard(leaderboard.length > 0 ? [...leaderboard] : []);
                    setPreviousStats(Object.keys(stats).length > 0 ? {...stats} : {});
                    
                    setLeaderboard(newLeaderboard);
                    setStats(newStats);
                    setLastUpdateTime(Date.now());
                    setHasUpdates(false);
                }
            } else {
                if (!isBackground) {
                    setError('Failed to load leaderboard data');
                    setLeaderboard([]);
                    setStats({});
                }
            }
        } catch (err) {
            console.error('Error fetching leaderboard:', err);
            if (!isBackground) {
                setError('Network error. Please check your connection.');
                setLeaderboard([]);
                setStats({});
            }
        } finally {
            if (!isBackground) {
                setLoading(false);
                setRefreshing(false);
            }
        }
    }, [apiCall, leaderboard, stats]);

    useEffect(() => {
        fetchLeaderboard();
        
        // Set up polling for real-time updates
        const interval = setInterval(() => {
            fetchLeaderboard(true, true); // Background refresh
        }, 20000); // Check every 20 seconds

        return () => clearInterval(interval);
    }, [fetchLeaderboard]);

    const handleRefresh = () => {
        if (hasUpdates) {
            // Apply the updates
            fetchLeaderboard(true);
            setHasUpdates(false);
        } else {
            fetchLeaderboard(true);
        }
    };

    const handleShowUpdates = () => {
        fetchLeaderboard(true);
        setHasUpdates(false);
    };

    // Calculate rank changes
    const leaderboardWithChanges = calculateRankChanges(leaderboard, previousLeaderboard);

    if (loading && !refreshing) {
        return (
            <LeaderboardContainer>
                <Header>
                    <Trophy size={48} style={{marginBottom: '1rem'}} />
                    <h1>Top Contributors</h1>
                </Header>
                <LoadingState>
                    <RefreshCw size={20} className="animate-spin" />
                    Loading leaderboard...
                </LoadingState>
            </LeaderboardContainer>
        );
    }

    if (error && !hasUpdates) {
        return (
            <LeaderboardContainer>
                <Header>
                    <Trophy size={48} style={{marginBottom: '1rem'}} />
                    <h1>Top Contributors</h1>
                </Header>
                <ErrorState>
                    <p>{error}</p>
                    <button onClick={() => fetchLeaderboard()}>Try Again</button>
                </ErrorState>
            </LeaderboardContainer>
        );
    }

    return (
        <LeaderboardContainer>
            {hasUpdates && (
                <UpdateIndicator onClick={handleShowUpdates}>
                    Rankings updated! Click to refresh
                </UpdateIndicator>
            )}
            
            <Header>
                <Trophy size={48} style={{marginBottom: '1rem'}} />
                <h1>Top Contributors</h1>
                <p>Ranking based on points earned from rescuing food and making donations.</p>
                
                <StatsBar>
                    <StatItem>
                        <h3>
                            {stats.total_users || leaderboard.length}
                            {previousStats.total_users && stats.total_users !== previousStats.total_users && (
                                <span style={{fontSize: '0.8rem', opacity: 0.8}}>
                                    ({stats.total_users > previousStats.total_users ? '+' : ''}
                                    {stats.total_users - previousStats.total_users})
                                </span>
                            )}
                        </h3>
                        <p>Total Users</p>
                    </StatItem>
                    <StatItem>
                        <h3>
                            {stats.total_points || leaderboard.reduce((sum, user) => sum + (user.points_earned || 0), 0)}
                            {previousStats.total_points && stats.total_points !== previousStats.total_points && (
                                <span style={{fontSize: '0.8rem', opacity: 0.8}}>
                                    (+{(stats.total_points || 0) - (previousStats.total_points || 0)})
                                </span>
                            )}
                        </h3>
                        <p>Total Points</p>
                    </StatItem>
                    <StatItem>
                        <h3>{stats.total_donations || 0}</h3>
                        <p>Total Donations</p>
                    </StatItem>
                    <StatItem>
                        <h3>{stats.food_rescued || 0}</h3>
                        <p>Food Items Rescued</p>
                    </StatItem>
                </StatsBar>
                
                <RefreshButton onClick={handleRefresh} disabled={refreshing} spinning={refreshing}>
                    <RefreshCw size={16} />
                    {refreshing ? 'Refreshing...' : hasUpdates ? 'Apply Updates' : 'Refresh Rankings'}
                </RefreshButton>
            </Header>
            
            <div>
                {leaderboard.length === 0 ? (
                    <EmptyState>
                        <Trophy size={48} />
                        <h3>No rankings yet</h3>
                        <p>Be the first to earn points by making donations or rescuing food!</p>
                    </EmptyState>
                ) : (
                    leaderboardWithChanges.map((userWithChanges, index) => {
                        const rank = index + 1;
                        const isCurrentUser = user && user.id === userWithChanges.id;
                        
                        return (
                            <UserRow key={userWithChanges.id || index} rank={rank} isCurrentUser={isCurrentUser}>
                                <Rank>
                                    {rank <= 3 ? getRankIcon(rank) : `#${rank}`}
                                    {rank <= 3 && <RankBadge rank={rank}>{rank}</RankBadge>}
                                </Rank>
                                
                                {userWithChanges.rankChange !== 0 && !userWithChanges.isNew && (
                                    <RankChange change={userWithChanges.rankChange} rank={rank}>
                                        {getRankChangeIcon(userWithChanges.rankChange)}
                                        {Math.abs(userWithChanges.rankChange)}
                                    </RankChange>
                                )}
                                
                                <Avatar 
                                    src={userWithChanges.avatar || '/avatars/default_user.jpg'} 
                                    alt={userWithChanges.name || 'User'}
                                    rank={rank}
                                    onError={(e) => {
                                        e.target.src = '/avatars/default_user.jpg';
                                    }}
                                />
                                <UserInfo rank={rank}>
                                    <h4>
                                        {userWithChanges.name || 'Anonymous User'}
                                        {isCurrentUser && <UserBadge rank={rank}>You</UserBadge>}
                                        {userWithChanges.isNew && <UserBadge rank={rank}>New</UserBadge>}
                                    </h4>
                                    <p>
                                        {userWithChanges.donation_count || 0} donations • {userWithChanges.food_rescued || 0} items rescued
                                        {userWithChanges.last_activity && (
                                            <span> • Last active: {new Date(userWithChanges.last_activity).toLocaleDateString()}</span>
                                        )}
                                    </p>
                                </UserInfo>
                                <Points rank={rank}>
                                    <div className="points-main">
                                        {userWithChanges.points_earned || 0} PTS
                                        {rank <= 3 && <Star size={16} />}
                                    </div>
                                    {userWithChanges.points_change !== undefined && (
                                        <div className="points-change" increase={userWithChanges.points_change >= 0}>
                                            {userWithChanges.points_change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                            {userWithChanges.points_change >= 0 ? '+' : ''}{userWithChanges.points_change} today
                                        </div>
                                    )}
                                </Points>
                            </UserRow>
                        );
                    })
                )}
            </div>
        </LeaderboardContainer>
    );
}