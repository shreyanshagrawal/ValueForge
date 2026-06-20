import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import Stepper from '../components/Stepper';

function ValuePropositions() {
  const { scanId } = useParams();
  const navigate = useNavigate();
  
  const [vps, setVps] = useState([]);
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFlags, setShowFlags] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const vpRes = await apiClient.get(`/scans/${scanId}/value-propositions`);
        setVps(vpRes.data);
        
        try {
          const flagRes = await apiClient.get(`/scans/${scanId}/misalignment-flags`);
          setFlags(flagRes.data);
        } catch (e) {
          setFlags([]);
        }
        
      } catch (err) {
        setError('Failed to load value propositions.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [scanId]);

  if (loading) return <div className="loading-state">Generating Value Propositions...</div>;
  if (error) return <div className="error-state">{error}</div>;

  const getClassColor = (cls) => {
    const mapping = {
      true_whitespace: 'var(--color-true-ws)',
      conditional: 'var(--color-conditional)',
      brand_whitespace: 'var(--color-brand-ws)',
      contested: 'var(--color-contested)'
    };
    return mapping[cls] || 'var(--color-gray)';
  };

  return (
    <div>
      <Stepper currentStep={3} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Product Value Propositions</h2>
        <button 
          className="btn-outline" 
          onClick={async () => {
            try {
              setLoading(true);
              const res = await apiClient.post(`/scans/${scanId}/brief`);
              if (res.data.status === 'ready') {
                window.location.href = `http://localhost:8000${res.data.download_url}`;
              }
            } catch (err) {
              alert('Failed to generate brand brief.');
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
        >
          {loading ? 'Generating...' : '⬇ Download Brand Brief'}
        </button>
      </div>

      {/* Misalignment Flags Section */}
      <div className="flags-panel" style={{ marginBottom: '3rem', backgroundColor: '#fff', border: '1px solid var(--color-contested)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        <div 
          style={{ padding: '1rem', backgroundColor: 'var(--color-contested)', color: 'white', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
          onClick={() => setShowFlags(!showFlags)}
        >
          <h3 style={{ color: 'white', margin: 0 }}>⚠️ Claims to Avoid ({flags.length})</h3>
          <span>{showFlags ? '▲' : '▼'}</span>
        </div>
        
        {showFlags && (
          <div style={{ padding: '1.5rem' }}>
            {flags.length === 0 ? (
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>No critical misalignments detected.</p>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {flags.map((flag) => (
                  <div key={flag.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>"{flag.flagged_claim_code}"</span>
                      <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: 'var(--bg-color)', borderRadius: '4px' }}>
                        {flag.flag_reason}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)' }}>{flag.explanation}</p>
                    {flag.suggested_replacement_code && (
                      <div style={{ fontSize: '0.875rem', color: 'var(--primary-teal)' }}>
                        ↳ Suggestion: Try "{flag.suggested_replacement_code}" instead
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* VP Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {vps.map((vp) => (
          <div 
            key={vp.id} 
            style={{ 
              backgroundColor: 'var(--card-bg)', 
              borderRadius: 'var(--radius-lg)', 
              boxShadow: vp.rank === 1 ? 'var(--shadow-lg)' : 'var(--shadow-md)',
              border: vp.rank === 1 ? `2px solid ${getClassColor(vp.whitespace_classification)}` : '1px solid var(--border-color)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header Area */}
            <div style={{ padding: '1.5rem', backgroundColor: vp.rank === 1 ? 'var(--primary-navy)' : 'var(--bg-color)', color: vp.rank === 1 ? 'white' : 'inherit' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', padding: '0.25rem 0.5rem', backgroundColor: getClassColor(vp.whitespace_classification), color: 'white', borderRadius: '4px' }}>
                  Option {vp.rank}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: vp.rank === 1 ? '#cbd5e1' : 'var(--text-muted)' }}>
                  FOS: {vp.fos_score.toFixed(1)}
                </span>
              </div>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem', lineHeight: '1.3', color: vp.rank === 1 ? 'white' : 'var(--primary-navy)' }}>
                "{vp.headline}"
              </h3>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: vp.rank === 1 ? '#cbd5e1' : 'var(--text-muted)' }}>
                <li>{vp.subclaim_1}</li>
                <li>{vp.subclaim_2}</li>
              </ul>
            </div>

            {/* Details Area */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', flexGrow: 1 }}>
              
              {/* Score Badges */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Tier-CDS</strong>
                  <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '4px', backgroundColor: vp.cds_zone === 'green' ? 'var(--color-true-ws)' : vp.cds_zone === 'yellow' ? 'var(--color-conditional)' : 'var(--color-contested)', color: 'white' }}>
                    {vp.tier_cds_score?.toFixed(1)} ({vp.cds_zone})
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>BPS Indicator</strong>
                  <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>{vp.bps_score?.toFixed(1)}</span>
                </div>
                <div>
                  <strong style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>CRS Sub-filters ({vp.crs_score?.toFixed(1)})</strong>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Believability: {vp.crs_believability?.toFixed(1)}
                      <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--border-color)', borderRadius: '2px', marginTop: '2px' }}><div style={{ width: `${vp.crs_believability}%`, height: '100%', backgroundColor: 'var(--primary-teal)', borderRadius: '2px' }}></div></div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Relevance: {vp.crs_relevance?.toFixed(1)}
                      <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--border-color)', borderRadius: '2px', marginTop: '2px' }}><div style={{ width: `${vp.crs_relevance}%`, height: '100%', backgroundColor: 'var(--primary-teal)', borderRadius: '2px' }}></div></div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Fatigue Inv: {vp.crs_fatigue_inverse?.toFixed(1)}
                      <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--border-color)', borderRadius: '2px', marginTop: '2px' }}><div style={{ width: `${vp.crs_fatigue_inverse}%`, height: '100%', backgroundColor: 'var(--primary-teal)', borderRadius: '2px' }}></div></div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Intent: {vp.crs_trigger_alignment?.toFixed(1)}
                      <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--border-color)', borderRadius: '2px', marginTop: '2px' }}><div style={{ width: `${vp.crs_trigger_alignment}%`, height: '100%', backgroundColor: 'var(--primary-teal)', borderRadius: '2px' }}></div></div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <strong style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Hero Ingredients</strong>
                <div style={{ marginTop: '0.5rem' }}>
                  {vp.hero_ingredients.map(i => <span key={i} style={{ display: 'inline-block', backgroundColor: 'var(--bg-color)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.875rem', marginRight: '0.5rem', marginBottom: '0.5rem' }}>{i.replace(/_/g, ' ')}</span>)}
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>{vp.ingredient_rationale}</p>
              </div>

              <div>
                <strong style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Format & Packaging</strong>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', fontWeight: '500' }}>{vp.recommended_format.replace(/_/g, ' ')}</p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{vp.packaging_direction}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <strong style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Price Band</strong>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary-teal)' }}>₹{vp.price_band_min} - ₹{vp.price_band_max}</p>
                </div>
                <div>
                  <strong style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Trend Window</strong>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>{vp.first_mover_window}</p>
                </div>
              </div>

              <div>
                <strong style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Channel Fit</strong>
                <div style={{ marginTop: '0.5rem' }}>
                  {vp.channel_fit.map(c => <span key={c} style={{ display: 'inline-block', border: '1px solid var(--border-color)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', marginRight: '0.5rem' }}>{c}</span>)}
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ValuePropositions;
