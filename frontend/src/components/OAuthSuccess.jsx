import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const OAuthSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Parse URL parameters
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const refreshToken = params.get('refreshToken');

        if (token) {
            // Store tokens
            localStorage.setItem('accessToken', token);
            if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

            // Redirect to dashboard
            setTimeout(() => navigate('/dashboard'), 1500); // Give user a moment to see success state
        } else {
            navigate('/login?error=oauth_failed');
        }
    }, [navigate, location]);

    return (
        <div className="auth-wrapper">
            <div className="auth-card glass-container" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '50px', height: '50px', border: '4px solid rgba(255,255,255,0.2)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                </div>
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Authenticating...</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Securely connecting your account to LaborGuard.</p>
                
                <style>
                    {`
                        @keyframes spin {
                            to { transform: rotate(360deg); }
                        }
                    `}
                </style>
            </div>
        </div>
    );
};

export default OAuthSuccess;
