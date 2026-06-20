import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import Stepper from '../components/Stepper';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Target, ArrowRight } from 'lucide-react';

export default function AuthenticClaimTerritory() {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await client.get(`/scans/${scanId}/authentic-territory`);
        setData(res.data);
      } catch (err) {
        console.error("Error fetching territory data", err);
        setError("The scan may not exist, or it hasn't finished processing yet.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [scanId]);

  if (loading) {
    return <div className="container" style={{ textAlign: 'center', marginTop: '100px' }}>Loading territory visualization...</div>;
  }
  
  if (error) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '100px' }}>
        <h2 style={{ color: 'var(--danger-color)' }}>We couldn't load this scan.</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{error}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <button className="btn btn-outline" onClick={() => window.location.reload()}>Retry</button>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Start Over</button>
        </div>
      </div>
    );
  }
  
  const axesData = [
    { subject: 'Market Openness', fullMark: 100 },
    { subject: 'Consumer Response', fullMark: 100 },
    { subject: 'Brand Permission', fullMark: 100 }
  ];
  
  const chartData = axesData.map(axis => {
    const dataPoint = { subject: axis.subject, fullMark: axis.fullMark };
    data.forEach(claim => {
      if (axis.subject === 'Market Openness') dataPoint[claim.claim_code] = claim.market_openness;
      if (axis.subject === 'Consumer Response') dataPoint[claim.claim_code] = claim.crs_score;
      if (axis.subject === 'Brand Permission') dataPoint[claim.claim_code] = claim.bps_score;
    });
    return dataPoint;
  });

  const authenticClaims = data.filter(c => c.is_authentic_territory);
  
  return (
    <div className="container">
      <Stepper scanId={scanId} />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <Target size={32} color="var(--accent-color)" />
        <h2 style={{ margin: 0 }}>Authentic Claim Territory</h2>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px', marginBottom: '40px' }}>
        <div className="glass-panel" style={{ padding: '24px', height: '500px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid stroke="var(--border-color)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--text-muted)' }} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)' }} />
              {data.map((claim) => {
                const isAuthentic = claim.is_authentic_territory;
                return (
                  <Radar 
                    key={claim.claim_code}
                    name={claim.claim_code.replace(/_/g, ' ')} 
                    dataKey={claim.claim_code} 
                    stroke={isAuthentic ? 'var(--primary-teal)' : 'var(--text-muted)'}
                    fill={isAuthentic ? 'var(--primary-teal)' : 'var(--text-muted)'} 
                    fillOpacity={isAuthentic ? 0.5 : 0.05}
                    strokeWidth={isAuthentic ? 2 : 1}
                  />
                );
              })}
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        <div>
          <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', background: 'var(--panel-bg)' }}>
            <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)' }}>What is this?</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.95rem' }}>
              <strong>Authentic Claim Territory</strong> is where all three dimensions align — the market has room, consumers want it, and your brand can credibly claim it.
              Claims highlighted here are the ONLY claims your brand can both find AND win.
            </p>
          </div>
          
          <div className="glass-panel" style={{ padding: '24px', borderTop: '4px solid var(--primary-teal)' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>Qualifying Claims ({authenticClaims.length})</h3>
            {authenticClaims.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No claims hit the threshold for true whitespace across all three dimensions.
              </p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-primary)' }}>
                {authenticClaims.map((c, i) => (
                  <li key={i} style={{ marginBottom: '8px', textTransform: 'capitalize' }}>
                    {c.claim_code.replace(/_/g, ' ')}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'right', marginTop: '20px' }}>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate(`/scan/${scanId}/propositions`)}
          style={{ padding: '12px 32px' }}
        >
          Continue to Value Propositions <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
