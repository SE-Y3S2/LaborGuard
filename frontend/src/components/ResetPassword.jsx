import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Try to grab the email if we navigated here from the ForgotPassword page
    const initialEmail = location.state?.email || '';

    const [formData, setFormData] = useState({
        email: initialEmail,
        code: '',
        newPassword: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const API_URL = 'http://localhost:5001/api/auth';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await axios.post(`${API_URL}/reset-password`, formData);
            setSuccess(response.data.message);

            // Redirect to login after successful reset
            setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ border: '1px solid #ccc', padding: '2rem', borderRadius: '8px', maxWidth: '400px', margin: '2rem auto' }}>
            <h2>Reset Password</h2>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                Please enter the 6-digit code sent to your email, along with your new password.
            </p>

            {error && <p style={{ color: 'red', fontSize: '0.9rem' }}>{error}</p>}
            {success && <p style={{ color: 'green', fontSize: '0.9rem' }}>{success}</p>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                    type="email"
                    name="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{ padding: '0.5rem' }}
                />
                <input
                    maxLength={6}
                    name="code"
                    placeholder="6-digit Reset Code"
                    value={formData.code}
                    onChange={handleChange}
                    required
                    style={{ padding: '0.5rem', letterSpacing: '2px', textAlign: 'center', fontSize: '1.2rem' }}
                />
                <input
                    type="password"
                    name="newPassword"
                    placeholder="New Strong Password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                    style={{ padding: '0.5rem' }}
                />

                <p style={{ fontSize: '0.8rem', color: '#666', margin: 0 }}>
                    * Needs 8 chars, 1 uppercase, 1 lowercase, 1 number, & 1 special char.
                </p>

                <button type="submit" disabled={loading} style={{ padding: '0.5rem', background: '#e0a800', color: 'black', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
                    {loading ? 'Resetting...' : 'Reset Password'}
                </button>
            </form>

            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <Link to="/login">Back to Login</Link>
            </div>
        </div>
    );
};

export default ResetPassword;
