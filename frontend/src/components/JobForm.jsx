import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const JobForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        wageAmount: '',
        wageFrequency: 'hourly',
        city: '',
        country: 'USA',
        address: '',
        jobType: 'full-time',
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

            // Redirect back to job board
            navigate('/jobs');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to post job.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-container">
                <div className="dashboard-header" style={{ justifyContent: 'center', borderBottom: 'none' }}>
                    <div style={{ textAlign: 'center' }}>
                        <h1 className="dashboard-header-title">Post a New Job</h1>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Create an SDG 8 compliant opportunity</p>
                    </div>
                </div>

                <div className="dashboard-card job-form-wrapper">
                    {error && (
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '1rem 1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Job Title</label>
                            <input 
                                name="title" 
                                className="modern-input"
                                placeholder="e.g. Senior Frontend Developer" 
                                value={formData.title} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group" style={{ flex: 2 }}>
                                <label className="form-label">Wage Amount</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>$</span>
                                    <input 
                                        type="number" 
                                        name="wageAmount" 
                                        className="modern-input"
                                        style={{ paddingLeft: '32px' }}
                                        placeholder="0.00" 
                                        value={formData.wageAmount} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                </div>
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label className="form-label">Frequency</label>
                                <select 
                                    name="wageFrequency" 
                                    className="modern-input"
                                    value={formData.wageFrequency} 
                                    onChange={handleChange}
                                >
                                    <option value="hourly" style={{ color: 'black' }}>Hourly</option>
                                    <option value="daily" style={{ color: 'black' }}>Daily</option>
                                    <option value="weekly" style={{ color: 'black' }}>Weekly</option>
                                    <option value="monthly" style={{ color: 'black' }}>Monthly</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Job Type</label>
                            <select 
                                name="jobType" 
                                className="modern-input"
                                value={formData.jobType} 
                                onChange={handleChange}
                            >
                                <option value="full-time" style={{ color: 'black' }}>Full-Time</option>
                                <option value="part-time" style={{ color: 'black' }}>Part-Time</option>
                                <option value="contract" style={{ color: 'black' }}>Contract</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Location</label>
                            <input 
                                name="address" 
                                className="modern-input"
                                placeholder="Street Address (Optional)" 
                                value={formData.address} 
                                onChange={handleChange} 
                            />
                            <div className="form-row" style={{ marginTop: '1rem', marginBottom: 0 }}>
                                <input 
                                    name="city" 
                                    className="modern-input"
                                    placeholder="City" 
                                    value={formData.city} 
                                    onChange={handleChange} 
                                    required 
                                />
                                <input 
                                    name="country" 
                                    className="modern-input"
                                    placeholder="Country" 
                                    value={formData.country} 
                                    onChange={handleChange} 
                                    required 
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Job Description</label>
                            <textarea 
                                name="description" 
                                className="modern-input"
                                placeholder="Describe the responsibilities and requirements..." 
                                value={formData.description} 
                                onChange={handleChange} 
                                required 
                                style={{ minHeight: '150px', resize: 'vertical' }} 
                            />
                        </div>

                        <label className="checkbox-label">
                            <input 
                                type="checkbox" 
                                name="compliesWithMinimumWage" 
                                checked={formData.compliesWithMinimumWage} 
                                onChange={handleChange} 
                            />
                            <div className="checkbox-text">
                                <span className="checkbox-title">Fair Wage Certification</span>
                                <span className="checkbox-desc">I certify this position complies with the legal minimum wage in this jurisdiction in accordance with SDG Goal 8.</span>
                            </div>
                        </label>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 2 }}>
                                {loading ? 'Publishing Opportunity...' : 'Publish Job Opportunity'}
                            </button>
                            <button type="button" className="btn-dashboard" onClick={() => navigate('/jobs')} style={{ flex: 1 }}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default JobForm;
