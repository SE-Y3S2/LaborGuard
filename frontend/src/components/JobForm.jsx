import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Post a New Job</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input name="title" placeholder="Job Title" value={formData.title} onChange={handleChange} required style={{ padding: '0.5rem' }} />

                <textarea name="description" placeholder="Job Description" value={formData.description} onChange={handleChange} required style={{ padding: '0.5rem', minHeight: '100px' }} />

                <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="number" name="wageAmount" placeholder="Wage Amount" value={formData.wageAmount} onChange={handleChange} required style={{ padding: '0.5rem', flex: 1 }} />
                    <select name="wageFrequency" value={formData.wageFrequency} onChange={handleChange} style={{ padding: '0.5rem' }}>
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </div>

                <input name="address" placeholder="Street Address" value={formData.address} onChange={handleChange} required style={{ padding: '0.5rem' }} />
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input name="city" placeholder="City" value={formData.city} onChange={handleChange} required style={{ padding: '0.5rem', flex: 1 }} />
                    <input name="country" placeholder="Country" value={formData.country} onChange={handleChange} required style={{ padding: '0.5rem', flex: 1 }} />
                </div>

                <select name="jobType" value={formData.jobType} onChange={handleChange} style={{ padding: '0.5rem' }}>
                    <option value="full-time">Full-Time</option>
                    <option value="part-time">Part-Time</option>
                    <option value="contract">Contract</option>
                </select>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#d4edda', padding: '10px', borderRadius: '4px' }}>
                    <input type="checkbox" name="compliesWithMinimumWage" checked={formData.compliesWithMinimumWage} onChange={handleChange} />
                    I certify this position complies with the legal minimum wage in this jurisdiction.
                </label>

                <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                    <button type="submit" disabled={loading} style={{ flex: 1, padding: '0.8rem', background: '#007bff', color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
                        {loading ? 'Posting...' : 'Post Job'}
                    </button>
                    <button type="button" onClick={() => navigate('/jobs')} style={{ flex: 1, padding: '0.8rem', background: '#6c757d', color: 'white', border: 'none', cursor: 'pointer' }}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default JobForm;
