import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { useApp } from '../contexts/AppContext';
import { Star } from 'lucide-react';

const ReviewsContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const ReviewCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.shadows.md};
  margin-bottom: 1.5rem;
`;

const ReviewHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const Avatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
`;

const RatingContainer = styled.div`
  display: flex;
  color: #f59e0b;
`;

export default function ReviewsPage() {
    const { apiCall } = useApp();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    // In a real app, restaurant_id would come from URL params
    const RESTAURANT_ID_FOR_DEMO = 1;

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        const res = await apiCall(`get_reviews?restaurant_id=${RESTAURANT_ID_FOR_DEMO}`);
        if (res.success) {
            setReviews(res.data.reviews);
        }
        setLoading(false);
    }, [apiCall]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);
    
    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star key={i} fill={i < rating ? '#f59e0b' : 'none'} size={18} />
        ));
    };

    return (
        <ReviewsContainer>
            <h1>Reviews for Restaurant</h1>
            {loading ? <p>Loading reviews...</p> : reviews.length > 0 ? reviews.map(review => (
                <ReviewCard key={review.id}>
                    <ReviewHeader>
                        <Avatar src={review.user_avatar || '/avatars/default_user.jpg'} alt="avatar"/>
                        <div>
                            <h5 style={{margin:0}}>{review.user_name}</h5>
                            <RatingContainer>{renderStars(review.rating)}</RatingContainer>
                        </div>
                    </ReviewHeader>
                    <p>{review.comment}</p>
                    <small style={{color: '#64748b'}}>{new Date(review.created_at).toLocaleDateString()}</small>
                </ReviewCard>
            )) : <p>This restaurant has no reviews yet.</p>}
        </ReviewsContainer>
    );
}