import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import client from '../api/client';

export default function InputForm() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
        const [catsRes, persRes] = await Promise.all([
          client.get('/reference/categories'),
          client.get('/reference/personas')
        ]);
        setCategories(catsRes.data);
        setPersonas(persRes.data);
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
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await client.post('/scans', formData);
      navigate(`/scan/${res.data.id}/failures`);
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
    <div className="container">
      <div className="glass-panel" style={{ padding: '40px' }}>
        <h2 style={{ marginBottom: '8px' }}>New Idea Scan</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
          Define your product concept to analyze competitive white space.
        </p>
        
        {isSubmitting ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Loader2 size={64} style={{ color: 'var(--accent-color)', animation: 'spin 1.5s linear infinite', marginBottom: '24px' }} />
            <h3 style={{ margin: 0 }}>Analyzing competitive landscape...</h3>
            <p style={{ color: 'var(--text-muted)' }}>Extracting claims and scoring whitespace.</p>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
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
                  <option value="ultra-premium">Ultra-Premium</option>
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
    </div>
  );
}
