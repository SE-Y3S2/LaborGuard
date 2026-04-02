import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

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
                localStorage.setItem('userRole', response.data.data.role);
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

    if (error) {
        return (
            <div className="dashboard-wrapper">
                <div className="dashboard-card" style={{ maxWidth: '500px', textAlign: 'center' }}>
                    <h3 style={{ color: 'var(--accent-danger)', marginBottom: '1rem' }}>Session Expired</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{error}</p>
                    <button className="btn-primary" onClick={() => navigate('/login')}>Back to Log In</button>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="dashboard-wrapper">
                <div className="dashboard-card" style={{ maxWidth: '500px', textAlign: 'center', padding: '4rem 2rem' }}>
                    <div style={{ margin: '0 auto 1.5rem auto', width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <h3 style={{ color: 'var(--text-primary)' }}>Loading Profile...</h3>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <h1 className="dashboard-header-title">My Profile</h1>
                    <div className="dashboard-header-actions">
                        <button className="btn-dashboard" onClick={() => navigate('/jobs')}>
                            <span style={{ marginRight: '8px' }}>💼</span> Job Board
                        </button>
                        {profile.role === 'admin' && (
                            <button className="btn-dashboard" onClick={() => navigate('/admin')} style={{ borderColor: 'var(--primary-color)', color: 'var(--primary-color)', background: 'rgba(56, 189, 248, 0.1)' }}>
                                <span style={{ marginRight: '8px' }}>🛡️</span> Admin Panel
                            </button>
                        )}
                        <button className="btn-dashboard" onClick={handleLogout} style={{ borderColor: 'rgba(239, 68, 68, 0.5)', color: '#ef4444' }}>
                            Logout
                        </button>
                    </div>
                </div>

                <div className="dashboard-card profile-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--glass-border)' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', color: 'white', textTransform: 'uppercase' }}>
                            {profile.name ? profile.name.charAt(0) : 'U'}
                        </div>
                        <div>
                            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.8rem' }}>{profile.name}</h2>
                            <span style={{ display: 'inline-block', padding: '0.2rem 0.8rem', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', fontSize: '0.85rem', textTransform: 'capitalize' }}>
                                {profile.role} Account
                            </span>
                        </div>
                    </div>

                    <div className="profile-grid">
                        <div className="profile-item">
                            <div className="profile-label">Email Address</div>
                            <div className="profile-value">{profile.email}</div>
                        </div>
                        
                        <div className="profile-item">
                            <div className="profile-label">Phone Number</div>
                            <div className="profile-value">{profile.phone || 'Not provided'}</div>
                        </div>

                        <div className="profile-item">
                            <div className="profile-label">Account Status</div>
                            <div className="profile-value" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: profile.isEmailVerified ? '#34d399' : '#f59e0b' }}>
                                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: profile.isEmailVerified ? '#34d399' : '#f59e0b' }}></span>
                                {profile.isEmailVerified ? 'Verified' : 'Pending Verification'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
