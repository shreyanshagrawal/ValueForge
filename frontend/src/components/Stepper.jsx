import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import client from '../api/client';

export default function Stepper({ scanId }) {
  const location = useLocation();
  const path = location.pathname;
  const [scan, setScan] = useState(null);
  
  useEffect(() => {
    async function fetchScan() {
      if (!scanId) return;
      try {
        const res = await client.get(`/scans/${scanId}`);
        setScan(res.data);
      } catch (err) {
        console.error("Error fetching scan info in Stepper", err);
      }
    }
    fetchScan();
  }, [scanId]);
  
  const steps = [
    { name: "Failures", path: `/scan/${scanId}/failures`, id: "failures" },
    { name: "Whitespace Grid", path: `/scan/${scanId}/grid`, id: "grid" },
    { name: "Propositions", path: `/scan/${scanId}/propositions`, id: "propositions" }
  ];
  
  return (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', fontSize: '0.9rem', padding: '16px 20px', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--panel-border)' }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        {steps.map((step, idx) => {
          const isActive = path.includes(step.id);
          return (
            <React.Fragment key={step.id}>
              <Link 
                to={step.path} 
                style={{ 
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: isActive ? 600 : 400,
                  textDecoration: 'none',
                  padding: '4px 8px',
                  background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                  borderRadius: '4px',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <span style={{ color: isActive ? 'var(--accent-color)' : 'inherit', marginRight: '6px' }}>{idx + 1}.</span> 
                {step.name}
              </Link>
              {idx < steps.length - 1 && <span style={{ color: 'var(--panel-border)' }}>—</span>}
            </React.Fragment>
          );
        })}
      </div>
      
      {scan && (
        <div style={{
          padding: '4px 10px',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: scan.data_source === 'live' ? '#10b981' : '#f97316',
          backgroundColor: scan.data_source === 'live' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(249, 115, 22, 0.1)',
          border: `1px solid ${scan.data_source === 'live' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(249, 115, 22, 0.2)'}`
        }}>
          {scan.data_source === 'live' ? 'Live Market Data' : 'Demo Dataset'}
        </div>
      )}
    </div>
  );
}
