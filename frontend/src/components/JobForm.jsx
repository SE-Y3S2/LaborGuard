import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const INDUSTRY_PRESETS = [
    { id: 'construction', label: 'Construction', icon: '🏗️', url: 'https://images.unsplash.com/photo-1541913057-25e11409ee10?q=80&w=2070&auto=format&fit=crop' },
    { id: 'agriculture', label: 'Agriculture', icon: '🚜', url: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=2070&auto=format&fit=crop' },
    { id: 'cleaning', label: 'Cleaning / Home', icon: '🧹', url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6958?q=80&w=2070&auto=format&fit=crop' },
    { id: 'logistics', label: 'Delivery / logistics', icon: '📦', url: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaad21?q=80&w=1965&auto=format&fit=crop' },
    { id: 'security', label: 'Security', icon: '🛡️', url: 'https://images.unsplash.com/photo-1557597774-9d2739f85a94?q=80&w=2073&auto=format&fit=crop' },
    { id: 'other', label: 'Other Service', icon: '⚙️', url: 'https://images.unsplash.com/photo-1541913057-25e11409ee10?q=80&w=2070&auto=format&fit=crop' }
];

const JobForm = () => {
    const navigate = useNavigate();
    const [selectedPreset, setSelectedPreset] = useState(INDUSTRY_PRESETS[0]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        wageAmount: '',
        wageFrequency: 'daily',
        city: '',
        country: 'USA',
        address: '',
        jobType: 'contract',
        compliesWithMinimumWage: false
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const API_URL = 'http://localhost:5003/api/jobs';

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('accessToken');

            const payload = {
                title: formData.title,
                description: formData.description,
                imageUrl: selectedPreset.url,
                wage: {
                    amount: Number(formData.wageAmount),
                    currency: 'USD',
                    frequency: formData.wageFrequency
                },
                location: {
                    address: formData.address,
                    city: formData.city,
                    country: formData.country
                },
                jobType: formData.jobType,
                compliesWithMinimumWage: formData.compliesWithMinimumWage
            };

            await axios.post(API_URL, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            navigate('/jobs');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to post job.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-wrapper" style={{ backgroundColor: '#f8fafc' }}>
            <div className="dashboard-container" style={{ maxWidth: '900px' }}>
                <div className="dashboard-header" style={{ justifyContent: 'center', borderBottom: 'none', marginBottom: '3rem' }}>
                    <div style={{ textAlign: 'center' }}>
                        <h1 className="dashboard-header-title" style={{ fontSize: '2.5rem', fontWeight: 800 }}>Create New Opportunity</h1>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontWeight: 600 }}>Set the visual standard for your vacancy</p>
                    </div>
                </div>

                {error && <div className="alert-box alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                    {/* INNOVATIVE IMAGE PICKER */}
                    <div className="dashboard-tile" style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>1. Visual Industry Asset</h2>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            {INDUSTRY_PRESETS.map((preset) => (
                                <div 
                                    key={preset.id}
                                    onClick={() => setSelectedPreset(preset)}
                                    style={{
                                        cursor: 'pointer',
                                        padding: '1rem',
                                        borderRadius: '15px',
                                        textAlign: 'center',
                                        border: `2px solid ${selectedPreset.id === preset.id ? 'var(--accent-primary)' : '#edf2f7'}`,
                                        background: selectedPreset.id === preset.id ? 'rgba(37, 137, 245, 0.05)' : 'white',
                                        transition: 'all 0.2s',
                                        position: 'relative'
                                    }}
                                >
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{preset.icon}</div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{preset.label}</div>
                                    {selectedPreset.id === preset.id && (
                                        <div style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--accent-primary)', color: 'white', borderRadius: '50%', width: '20px', height: '20px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div style={{ 
                            height: '250px', 
                            borderRadius: '15px', 
                            backgroundImage: `url(${selectedPreset.url})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            display: 'flex',
                            alignItems: 'flex-end',
                            padding: '2rem',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}></div>
                            <div style={{ position: 'relative', color: 'white', fontWeight: 700, fontSize: '1.2rem' }}>
                                Preview: {selectedPreset.label} Environment
                            </div>
                        </div>
                    </div>

                    {/* CORE DETAILS */}
                    <div className="dashboard-tile" style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>2. Mission Details</h2>
                        
                        <div className="form-group">
                            <label className="form-label">Position Title</label>
                            <input name="title" className="modern-input" placeholder="e.g. Masonry / Construction Help" value={formData.title} onChange={handleChange} required />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Wage Amount ($)</label>
                                <input type="number" name="wageAmount" className="modern-input" placeholder="0.00" value={formData.wageAmount} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Payment Frequency</label>
                                <select name="wageFrequency" className="modern-select" value={formData.wageFrequency} onChange={handleChange}>
                                    <option value="daily">Daily Wage</option>
                                    <option value="per-task">Flat Fee (Per Task)</option>
                                    <option value="hourly">Hourly Rate</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Job Type</label>
                                <select name="jobType" className="modern-select" value={formData.jobType} onChange={handleChange}>
                                    <option value="contract">On-Call Contract</option>
                                    <option value="temporary">Temporary Placement</option>
                                    <option value="full-time">Permanent / Full-Time</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Region / City</label>
                            <input name="city" className="modern-input" placeholder="City Name" value={formData.city} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Execution Requirements & Description</label>
                            <textarea name="description" className="modern-input" placeholder="Describe the daily duties and skill requirements..." value={formData.description} onChange={handleChange} required style={{ minHeight: '120px' }} />
                        </div>

                        <label className="checkbox-label" style={{ background: '#f8fafc', padding: '1.2rem', marginBottom: 0 }}>
                            <input type="checkbox" name="compliesWithMinimumWage" checked={formData.compliesWithMinimumWage} onChange={handleChange} />
                            <div className="checkbox-text">
                                <span className="checkbox-title">Fair Wage Compliance</span>
                                <span className="checkbox-desc" style={{ color: 'var(--text-secondary)' }}>I certify this posting follows local labor laws and fair wage standards.</span>
                            </div>
                        </label>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <button type="submit" className="btn-tile-action btn-tile-primary" disabled={loading} style={{ flex: 2, padding: '1.2rem', fontSize: '1.1rem' }}>
                            {loading ? 'Streaming to LaborGuard...' : '🚀 Publish Vacancy Post'}
                        </button>
                        <button type="button" className="btn-tile-action" onClick={() => navigate('/jobs')} style={{ flex: 1, padding: '1.2rem' }}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default JobForm;
