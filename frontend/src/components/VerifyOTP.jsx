import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const VerifyOTP = () => {
    const [code, setCode] = useState('');
    const [type, setType] = useState('email');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    // Retrieve userId passed from successful registration
    const userId = location.state?.userId || '';

    const API_URL = 'http://localhost:5001/api/auth';

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!userId) {
            setError('Missing User ID. Please register or login again.');
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/verify`, { userId, code, type });
            setSuccess(response.data.message);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
        }
    };

    return (
        <div style={{ border: '1px solid #ccc', padding: '2rem', borderRadius: '8px', maxWidth: '400px', margin: '2rem auto' }}>
            <h2>Verify OTP</h2>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
                Please enter the 6-digit code sent to your email or phone.
            </p>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}

            <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <select value={type} onChange={(e) => setType(e.target.value)} style={{ padding: '0.5rem' }}>
                    <option value="email">Verify Email</option>
                    <option value="sms">Verify Phone</option>
                </select>

                <input
                    maxLength={6}
                    placeholder="6-digit code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    style={{ padding: '0.5rem', letterSpacing: '2px', textAlign: 'center', fontSize: '1.2rem' }}
                />

                <button type="submit" style={{ padding: '0.5rem', background: '#e0a800', color: 'black', border: 'none', cursor: 'pointer' }}>
                    Verify Now
                </button>
            </form>
        </div>
    );
};

export default VerifyOTP;
