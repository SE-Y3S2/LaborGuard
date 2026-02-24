import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Make sure this matches your backend API URL
    const API_URL = 'http://localhost:5001/api/auth';

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_URL}/login`, { email, password });
            localStorage.setItem('accessToken', response.data.data.accessToken);
            localStorage.setItem('userRole', response.data.data.user.role);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${API_URL}/google`;
    };

    return (
        <div style={{ border: '1px solid #ccc', padding: '2rem', borderRadius: '8px', maxWidth: '400px', margin: '2rem auto' }}>
            <h2>Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                    type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
                    required style={{ padding: '0.5rem' }}
                />
                <input
                    type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                    required style={{ padding: '0.5rem' }}
                />
                <button type="submit" style={{ padding: '0.5rem', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Login with Password
                </button>
                <div style={{ textAlign: 'right' }}>
                    <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: '#007bff' }}>Forgot Password?</Link>
                </div>
            </form>

            <div style={{ margin: '1rem 0', textAlign: 'center' }}>OR</div>

            <button onClick={handleGoogleLogin} style={{ padding: '0.5rem', width: '100%', background: '#db4437', color: 'white', border: 'none', cursor: 'pointer' }}>
                Login with Google
            </button>

            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <Link to="/register">Don't have an account? Register</Link>
            </div>
        </div>
    );
};

export default Login;
