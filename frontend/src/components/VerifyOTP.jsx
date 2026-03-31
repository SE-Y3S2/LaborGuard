import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const VerifyOTP = () => {
    const [code, setCode] = useState('');
    const [type, setType] = useState('email');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Retrieve userId passed from successful registration
    const userId = location.state?.userId || '';

    const API_URL = 'http://localhost:5001/api/auth';

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        if (!userId) {
            setError('Missing User ID. Please register or login again.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/verify`, { userId, code, type });
            setSuccess(response.data.message);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card glass-container">
                <div className="auth-header">
                    <h2>Verify Your Account</h2>
                    <p>Enter the 6-digit code sent to your email or phone</p>
                </div>

                {error && <div style={{ color: 'var(--accent-danger)', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
                {success && <div style={{ color: 'var(--accent-success)', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>{success}</div>}

                <form onSubmit={handleVerify}>
                    <div className="form-group">
                        <label className="form-label">Verification Type</label>
                        <select className="modern-select" value={type} onChange={(e) => setType(e.target.value)}>
                            <option value="email">Verify Email</option>
                            <option value="sms">Verify Phone</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">6-Digit Code</label>
                        <input
                            type="text"
                            maxLength={6}
                            className="modern-input"
                            placeholder="000000"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                            style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '1.5rem', fontWeight: '600' }}
                        />
                    </div>

                    <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }} disabled={isLoading}>
                        {isLoading ? 'Verifying...' : 'Verify Now'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VerifyOTP;
