import React from 'react';
import { useLocation, Link } from 'react-router-dom';

export default function Stepper({ scanId }) {
  const location = useLocation();
  const path = location.pathname;
  
  const steps = [
    { name: "Failures", path: `/scan/${scanId}/failures`, id: "failures" },
    { name: "Whitespace Grid", path: `/scan/${scanId}/grid`, id: "grid" },
    { name: "Propositions", path: `/scan/${scanId}/propositions`, id: "propositions" }
  ];
  
  return (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '32px', fontSize: '0.9rem', padding: '16px 20px', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--panel-border)' }}>
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
  );
}
