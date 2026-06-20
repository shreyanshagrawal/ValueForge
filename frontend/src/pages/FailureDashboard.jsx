import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, ShieldAlert, ArrowRight } from 'lucide-react';
import client from '../api/client';
import Stepper from '../components/Stepper';

export default function FailureDashboard() {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const [failures, setFailures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchFailures() {
      try {
        const res = await client.get(`/scans/${scanId}/failure-risks`);
        setFailures(res.data);
      } catch (err) {
        console.error("Error fetching failures", err);
        setError("The scan may not exist, or it hasn't finished processing yet.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchFailures();
  }, [scanId]);

  if (isLoading) {
    return <div className="container" style={{ textAlign: 'center', marginTop: '100px' }}>Loading historical risks...</div>;
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
    <div className="container">
      <Stepper scanId={scanId} />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <ShieldAlert size={32} color="var(--danger-color)" />
        <h2 style={{ margin: 0 }}>Historical Failure Risks</h2>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '1.1rem' }}>
        Before exploring white space, review past market failures that share similar positioning and claims to your concept.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '40px' }}>
        {failures.map((match, index) => {
          const f = match.failure_case;
          return (
            <div key={match.id} className={`glass-panel animate-slide-up stagger-${(index % 4) + 1}`} style={{ 
              padding: '24px', 
              borderLeft: '4px solid var(--danger-color)',
              background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.05) 0%, var(--panel-bg) 100%)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, color: '#f87171' }}>{f.product_name}</h3>
                <div style={{ 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  color: '#fca5a5', 
                  padding: '4px 10px', 
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <AlertTriangle size={14} />
                  {match.similarity_score.toFixed(0)}% pattern match
                </div>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <span style={{ 
                  display: 'inline-block', 
                  background: 'rgba(255, 255, 255, 0.1)', 
                  padding: '4px 10px', 
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--text-secondary)',
                  marginBottom: '12px'
                }}>
                  {f.failure_reason_type.replace(/_/g, ' ')}
                </span>
                <p style={{ margin: '0 0 8px 0', fontSize: '0.95rem' }}><strong>Positioning Used:</strong> {f.positioning_used}</p>
                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)' }}><strong>Summary:</strong> {f.failure_summary}</p>
              </div>
              
              <div style={{ 
                background: 'var(--bg-color)', 
                padding: '12px 16px', 
                borderRadius: 'var(--border-radius-sm)',
                borderLeft: '2px solid var(--text-muted)'
              }}>
                <p style={{ margin: 0, fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--text-main)' }}>
                  <strong>Lesson Learned:</strong> {f.lesson_learned}
                </p>
              </div>
            </div>
          );
        })}
        {failures.length === 0 && (
          <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No strong historical failure patterns detected for this concept.
          </div>
        )}
      </div>

      <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-color)' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0, cursor: 'pointer', textTransform: 'none', color: 'var(--text-primary)', fontSize: '1rem' }}>
          <input 
            type="checkbox" 
            checked={acknowledged} 
            onChange={(e) => setAcknowledged(e.target.checked)} 
            style={{ width: '20px', height: '20px', margin: 0, cursor: 'pointer' }}
          />
          I understand these market risks and want to see my opportunities.
        </label>
        
        <button 
          className="btn btn-primary" 
          disabled={!acknowledged}
          onClick={() => navigate(`/scan/${scanId}/grid`)}
        >
          Continue to Whitespace Map <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
