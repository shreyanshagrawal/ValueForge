import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import Stepper from '../components/Stepper';
import { LayoutGrid, ArrowRight, X, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const CATEGORIES = ["Energy", "Recovery", "Immunity", "Taste", "Convenience", "Sustainability"];
const BUCKETS = ["Underserved", "Moderate", "Saturated"];

const CLASS_COLORS = {
  true_whitespace: '#10b981', // Green
  conditional: '#eab308', // Yellow
  brand_whitespace: '#f97316', // Orange
  contested: '#ef4444', // Red
  consumer_whitespace: '#64748b' // Gray
};

export default function WhitespaceGrid() {
// ... omitting for a cleaner replace

  const renderTrendIcon = (c) => {
    if (c.trend_direction === 'rising') return <TrendingUp size={16} color="#10b981" title={`Rising (+${c.trend_velocity_score}%)`} />;
    if (c.trend_direction === 'declining') return <TrendingDown size={16} color="#ef4444" title={`Declining (${c.trend_velocity_score}%)`} />;
    if (c.trend_direction === 'peaking') return <Minus size={16} color="#eab308" title={`Peaking (+${c.trend_velocity_score}%)`} />;
    return null;
  };
  const { scanId } = useParams();
  const navigate = useNavigate();
  const [gridData, setGridData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCell, setActiveCell] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await client.get(`/scans/${scanId}/whitespace`);
        setGridData(res.data.grid);
      } catch (err) {
        console.error("Error fetching whitespace", err);
        setError("The scan may not exist, or it hasn't finished processing yet.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [scanId]);

  const getCellData = (cat, buck) => {
    return gridData.find(g => g.need_category === cat && g.coverage_bucket === buck)?.claims || [];
  };

  const getDominantClass = (claims) => {
    if (!claims.length) return null;
    const counts = {};
    let maxCount = 0;
    let domClass = claims[0].whitespace_classification;
    claims.forEach(c => {
      counts[c.whitespace_classification] = (counts[c.whitespace_classification] || 0) + 1;
      if (counts[c.whitespace_classification] > maxCount) {
        maxCount = counts[c.whitespace_classification];
        domClass = c.whitespace_classification;
      }
    });
    return domClass;
  };

  const getAverageBps = (claims) => {
    if (!claims.length) return 0;
    return claims.reduce((sum, c) => sum + c.bps_score, 0) / claims.length;
  };

  if (isLoading) {
    return <div className="container" style={{ textAlign: 'center', marginTop: '100px' }}>Loading whitespace map...</div>;
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

  return (
    <div className="container" style={{ maxWidth: '1100px' }}>
      <Stepper scanId={scanId} />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <LayoutGrid size={32} color="var(--accent-color)" />
        <h2 style={{ margin: 0 }}>Whitespace Opportunities Map</h2>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '1.1rem' }}>
        Click any cell to explore specific claims. Darker cells represent higher brand permission (credibility).
      </p>

      {/* Grid Legend */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '24px', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', background: CLASS_COLORS.true_whitespace, borderRadius: '4px' }}></div> True Whitespace
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', background: CLASS_COLORS.conditional, borderRadius: '4px' }}></div> Conditional
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', background: CLASS_COLORS.brand_whitespace, borderRadius: '4px' }}></div> Brand Whitespace
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', background: CLASS_COLORS.contested, borderRadius: '4px' }}></div> Contested
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', background: 'var(--bg-color)', border: '1px dashed var(--border-color)', borderRadius: '4px' }}></div> Empty
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr 1fr 1fr', gap: '12px', marginBottom: '40px' }}>
        {/* Header Row */}
        <div></div>
        {BUCKETS.map(b => (
          <div key={b} style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)', paddingBottom: '12px', borderBottom: '1px solid var(--panel-border)' }}>
            {b}
          </div>
        ))}

        {/* Matrix Rows */}
        {CATEGORIES.map(cat => (
          <React.Fragment key={cat}>
            <div style={{ display: 'flex', alignItems: 'center', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {cat}
            </div>
            {BUCKETS.map(buck => {
              const claims = getCellData(cat, buck);
              const domClass = getDominantClass(claims);
              const avgBps = getAverageBps(claims);
              
              const isEmpty = claims.length === 0;
              const baseColor = isEmpty ? 'var(--bg-color)' : CLASS_COLORS[domClass] || CLASS_COLORS.consumer_whitespace;
              // Opacity logic: map BPS (40-90) to 0.3 - 1.0
              const opacity = isEmpty ? 1 : Math.max(0.3, Math.min(1.0, avgBps / 100));

              return (
                <div 
                  key={`${cat}-${buck}`}
                  onClick={() => setActiveCell({ cat, buck, claims })}
                  style={{
                    height: '100px',
                    backgroundColor: baseColor,
                    opacity: opacity,
                    borderRadius: '8px',
                    border: isEmpty ? '1px dashed var(--border-color)' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isEmpty ? 'transparent' : '#fff',
                    fontWeight: 600,
                    fontSize: '1.2rem',
                    transition: 'transform var(--transition-fast)',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.02)' }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                >
                  {claims.length > 0 ? claims.length : ''}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Expanded Cell Panel */}
      {activeCell && (
        <div className="glass-panel animate-slide-up" style={{ padding: '24px', marginBottom: '40px', borderLeft: '4px solid var(--accent-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>
              {activeCell.cat} Claims in {activeCell.buck} Market
            </h3>
            <button 
              onClick={() => setActiveCell(null)} 
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
          </div>

          {activeCell.claims.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No claims discovered in this intersection.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
              {activeCell.claims.map(c => (
                <div key={c.claim_code} style={{ background: 'var(--bg-color)', padding: '16px', borderRadius: '8px', border: `1px solid ${CLASS_COLORS[c.whitespace_classification] || 'var(--border-color)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, textTransform: 'capitalize' }}>{c.claim_code.replace(/_/g, ' ')}</h4>
                    {renderTrendIcon(c)}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    <span>Final Opportunity Score:</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.fos_score.toFixed(1)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <span>Brand Permission:</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.bps_score.toFixed(1)}</span>
                  </div>
                  <div style={{ marginTop: '12px', fontSize: '0.75rem', textTransform: 'uppercase', padding: '4px 8px', background: 'var(--card-bg)', borderRadius: '4px', display: 'inline-block', color: CLASS_COLORS[c.whitespace_classification] || 'var(--text-main)' }}>
                    {c.whitespace_classification.replace(/_/g, ' ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ textAlign: 'right', marginTop: '40px' }}>
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
