import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { ArrowRight, Heart, Leaf, Users } from 'lucide-react';

const HeroSection = styled.section`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, #10a37f 100%);
  color: white;
  padding: 6rem 2rem;
  border-radius: ${({ theme }) => theme.borderRadius};
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  margin: 0 0 1rem;
  color: white;
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  max-width: 600px;
  margin: 0 auto 2rem;
  opacity: 0.9;
`;

const CTAButton = styled(Link)`
  background: white;
  color: ${({ theme }) => theme.colors.primary};
  padding: 1rem 2.5rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.1rem;
  transition: transform 0.2s, box-shadow 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  }
`;

const ImpactSection = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
`;

const ImpactCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  padding: 2rem;
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.shadows.md};
  text-align: center;
`;

const ImpactIcon = styled.div`
  background: ${({ theme }) => theme.colors.primary}1A;
  color: ${({ theme }) => theme.colors.primary};
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
`;

const ImpactValue = styled.p`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  color: ${({ theme }) => theme.colors.primary};
`;

const ImpactLabel = styled.p`
  margin: 0.25rem 0 0;
  color: ${({ theme }) => theme.colors.textLight};
`;

export default function Home() {
  const { apiCall } = useApp();
  const [impact, setImpact] = useState(null);

  useEffect(() => {
    const fetchImpact = async () => {
      const res = await apiCall('get_impact_stats');
      if (res.success) {
        setImpact({ ...res.data.stats, ...res.data.metrics });
      }
    };
    fetchImpact();
  }, [apiCall]);

  return (
    <div>
      <HeroSection>
        <Title>Save Food. Feed People.</Title>
        <Subtitle>Join a community dedicated to reducing food waste and fighting hunger, one meal at a time.</Subtitle>
        <CTAButton to="/products">
          Find Food Now <ArrowRight size={20} />
        </CTAButton>
      </HeroSection>
      
      <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem' }}>Our Collective Impact</h2>
      
      {impact ? (
        <ImpactSection>
          <ImpactCard>
            <ImpactIcon><Heart size={32} /></ImpactIcon>
            <ImpactValue>{impact.meals_provided?.toLocaleString() || 0}</ImpactValue>
            <ImpactLabel>Meals Provided</ImpactLabel>
          </ImpactCard>
          <ImpactCard>
            <ImpactIcon><Leaf size={32} /></ImpactIcon>
            <ImpactValue>{impact.co2_prevented_kg?.toLocaleString() || 0} kg</ImpactValue>
            <ImpactLabel>CO2 Emissions Saved</ImpactLabel>
          </ImpactCard>
          <ImpactCard>
            <ImpactIcon><Users size={32} /></ImpactIcon>
            <ImpactValue>{impact.active_users?.toLocaleString() || 0}</ImpactValue>
            <ImpactLabel>Active Community Members</ImpactLabel>
          </ImpactCard>
        </ImpactSection>
      ) : <p style={{textAlign: 'center'}}>Loading impact statistics...</p>}
    </div>
  );
}