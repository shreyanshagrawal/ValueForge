import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, ArrowRight, Clock, Beaker } from 'lucide-react';
import client from '../api/client';

const EXAMPLES = [
  {
    label: "Premium Snack Foods (Contested)",
    data: {
      product_name: "NaturaSnack Premium",
      category_code: "snack_foods",
      persona_code: "urban_health_seeker",
      primary_benefit_idea: "A natural, doctor recommended snack food with high fibre and high protein for wellness.",
      key_ingredient: "Oats",
      target_price_tier: "premium",
      use_live_data: false
    }
  },
  {
    label: "Ultra-Premium Energy Drinks (Whitespace)",
    data: {
      product_name: "Zenith Energy",
      category_code: "energy_drinks",
      persona_code: "fitness_millennial",
      primary_benefit_idea: "A plant-based, no sugar energy drink optimized for sustained performance and focus.",
      key_ingredient: "Matcha",
      target_price_tier: "ultra_premium",
      use_live_data: false
    }
  }
];

const STATUS_MESSAGES = {
  pending: "Initializing scan...",
  extracting_claims: "Scanning competitive landscape...",
  scoring_claims: "Computing market & consumer scores...",
  matching_failures: "Matching against failure patterns...",
  generating_vps: "Generating recommendations...",
  complete: "Scan complete! Redirecting..."
};

export default function InputForm() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [recentScans, setRecentScans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pollScanId, setPollScanId] = useState(null);
  const [scanStatus, setScanStatus] = useState("pending");
  const pollIntervalRef = useRef(null);
  
  const [formData, setFormData] = useState({
    product_name: '',
    category_code: '',
    persona_code: '',
    primary_benefit_idea: '',
    key_ingredient: '',
    target_price_tier: 'mid',
    use_live_data: false
  });

  useEffect(() => {
    async function fetchRefData() {
      try {
        const [catsRes, persRes, scansRes] = await Promise.all([
          client.get('/reference/categories'),
          client.get('/reference/personas'),
          client.get('/scans')
        ]);
        setCategories(catsRes.data);
        setPersonas(persRes.data);
        setRecentScans(scansRes.data);
        if (catsRes.data.length > 0) {
          setFormData(f => ({ ...f, category_code: catsRes.data[0].category_code }));
        }
        if (persRes.data.length > 0) {
          setFormData(f => ({ ...f, persona_code: persRes.data[0].persona_code }));
        }
      } catch (err) {
        console.error("Error fetching reference data", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRefData();
    
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (pollScanId) {
      pollIntervalRef.current = setInterval(async () => {
        try {
          const res = await client.get(`/scans/${pollScanId}`);
          setScanStatus(res.data.status);
          
          if (res.data.status === 'complete') {
            clearInterval(pollIntervalRef.current);
            setTimeout(() => {
              navigate(`/scan/${pollScanId}/failures`);
            }, 500); // Small delay for visual completion
          } else if (res.data.status.startsWith('failed')) {
            clearInterval(pollIntervalRef.current);
            alert(`Scan failed: ${res.data.status}`);
            setIsSubmitting(false);
            setPollScanId(null);
          }
        } catch (err) {
          console.error("Error polling scan status", err);
        }
      }, 1500);
    }
    return () => clearInterval(pollIntervalRef.current);
  }, [pollScanId, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };
  
  const loadExample = (exampleData) => {
    setFormData(exampleData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setScanStatus("pending");
    try {
      const res = await client.post('/scans', formData);
      setPollScanId(res.data.id);
    } catch (err) {
      console.error("Error creating scan", err);
      alert("An error occurred during analysis.");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '100px' }}>
        <Loader2 className="lucide-spin" size={48} style={{ color: 'var(--accent-color)', margin: '0 auto', display: 'block', animation: 'spin 2s linear infinite' }} />
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="container" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', alignItems: 'start' }}>
      <div className="glass-panel" style={{ padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <h2 style={{ marginBottom: '8px' }}>New Idea Scan</h2>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              Define your product concept to analyze competitive white space.
            </p>
          </div>
          
          {!isSubmitting && (
            <div style={{ display: 'flex', gap: '10px' }}>
              {EXAMPLES.map((ex, i) => (
                <button 
                  key={i} 
                  type="button" 
                  onClick={() => loadExample(ex.data)}
                  className="btn btn-outline"
                  style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                  title="Load a pre-configured demo example"
                >
                  <Beaker size={14} /> Example {i+1}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {isSubmitting ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Loader2 size={64} style={{ color: 'var(--accent-color)', animation: 'spin 1.5s linear infinite', marginBottom: '32px', display: 'inline-block' }} />
            <h3 style={{ margin: '0 0 8px 0' }}>{STATUS_MESSAGES[scanStatus] || "Processing..."}</h3>
            <p style={{ color: 'var(--text-muted)' }}>This takes a few moments to run across thousands of data points.</p>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            
            <div style={{ marginTop: '40px', maxWidth: '400px', margin: '40px auto 0', height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
               <div style={{ 
                 height: '100%', 
                 background: 'var(--accent-color)', 
                 width: scanStatus === 'pending' ? '10%' :
                        scanStatus === 'extracting_claims' ? '30%' :
                        scanStatus === 'scoring_claims' ? '50%' :
                        scanStatus === 'matching_failures' ? '70%' :
                        scanStatus === 'generating_vps' ? '90%' : '100%',
                 transition: 'width 1s ease-in-out'
               }}></div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
            
            <div>
              <label>Product Name</label>
              <input required name="product_name" value={formData.product_name} onChange={handleChange} placeholder="e.g. MegaWhey Pro" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label>Category</label>
                <select name="category_code" value={formData.category_code} onChange={handleChange}>
                  {categories.map(c => <option key={c.category_code} value={c.category_code}>{c.display_name}</option>)}
                </select>
              </div>
              
              <div>
                <label>Target Persona</label>
                <select name="persona_code" value={formData.persona_code} onChange={handleChange}>
                  {personas.map(p => <option key={p.persona_code} value={p.persona_code}>{p.display_name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label>Primary Benefit Idea</label>
              <textarea 
                required 
                maxLength={200}
                name="primary_benefit_idea" 
                value={formData.primary_benefit_idea} 
                onChange={handleChange} 
                rows={3} 
                placeholder="A high protein bar for serious athletes"
              />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px', marginBottom: 0 }}>
                Describe your product idea in a sentence or two — we'll extract the claims. (Max 200 chars)
              </p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label>Key Ingredient (Optional)</label>
                <input name="key_ingredient" value={formData.key_ingredient} onChange={handleChange} placeholder="e.g. Ashwagandha" />
              </div>
              
              <div>
                <label>Target Price Tier</label>
                <select name="target_price_tier" value={formData.target_price_tier} onChange={handleChange}>
                  <option value="mass">Mass</option>
                  <option value="mid">Mid</option>
                  <option value="premium">Premium</option>
                  <option value="ultra_premium">Ultra-Premium</option>
                </select>
              </div>
            </div>
            
            <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input 
                type="checkbox" 
                id="use_live_data" 
                name="use_live_data" 
                checked={formData.use_live_data} 
                onChange={handleChange}
                disabled={formData.category_code !== 'protein_bars'}
              />
              <label htmlFor="use_live_data" style={{ margin: 0, fontWeight: 'normal' }}>
                Use live market data (protein bars only, experimental)
              </label>
              <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Fetches real current listings instead of the demo dataset.
              </div>
            </div>
            
            <div style={{ marginTop: '16px', textAlign: 'right' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '12px 32px' }} disabled={isSubmitting}>
                Run Analysis
              </button>
            </div>
            
          </form>
        )}
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={20} /> Recent Scans
        </h3>
        {recentScans.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No recent scans found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentScans.map(scan => (
              <Link 
                key={scan.id} 
                to={`/scan/${scan.id}/failures`}
                style={{ 
                  display: 'block', 
                  padding: '16px', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-color)';
                  e.currentTarget.style.backgroundColor = 'rgba(13, 148, 136, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--primary-navy)', marginBottom: '4px' }}>
                  {scan.product_name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{scan.category_code} • {scan.target_price_tier}</span>
                  <span style={{ 
                    color: scan.status === 'complete' ? 'var(--color-true-ws)' : 'var(--text-muted)' 
                  }}>
                    {scan.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
