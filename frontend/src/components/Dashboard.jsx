import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) return navigate('/login');

                const response = await axios.get('http://localhost:5001/api/users/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProfile(response.data.data);
            } catch (err) {
                setError('Failed to load profile. Token might be expired.');
                localStorage.removeItem('accessToken');
            }
        };
        fetchProfile();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
    };

    if (error) return <div><p style={{ color: 'red' }}>{error}</p><button onClick={() => navigate('/login')}>Back to Login</button></div>;
    if (!profile) return <div>Loading...</div>;

    return (
        <div style={{ padding: '2rem' }}>
            <h2>Welcome, {profile.name}!</h2>
            <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <p><strong>Email:</strong> {profile.email}</p>
                <p><strong>Role:</strong> {profile.role}</p>
                <p><strong>Verified:</strong> {profile.isEmailVerified ? 'Yes' : 'No'}</p>
                <p><strong>Phone:</strong> {profile.phone}</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
                {profile.role === 'admin' && (
                    <button onClick={() => navigate('/admin')} style={{ padding: '0.5rem 1rem', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
                        Admin Panel
                    </button>
                )}
                <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', background: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Dashboard;
