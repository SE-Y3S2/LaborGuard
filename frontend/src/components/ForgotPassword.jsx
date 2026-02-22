import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const API_URL = 'http://localhost:5001/api/auth';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await axios.post(`${API_URL}/forgot-password`, { email });
            setSuccess(response.data.message);

            // Redirect to Reset Password page, passing the email so they don't have to type it again
            setTimeout(() => {
                navigate('/reset-password', { state: { email } });
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to request reset code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ border: '1px solid #ccc', padding: '2rem', borderRadius: '8px', maxWidth: '400px', margin: '2rem auto' }}>
            <h2>Forgot Password</h2>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                Enter your registered email address to receive a 6-digit password reset code.
            </p>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                    type="email"
                    placeholder="Your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ padding: '0.5rem' }}
                />
                <button type="submit" disabled={loading} style={{ padding: '0.5rem', background: '#007bff', color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
                    {loading ? 'Sending...' : 'Send Reset Code'}
                </button>
            </form>

            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <Link to="/login">Back to Login</Link>
            </div>
        </div>
    );
};

export default ForgotPassword;
