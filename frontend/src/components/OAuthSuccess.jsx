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
            navigate('/dashboard');
        } else {
            navigate('/login?error=oauth_failed');
        }
    }, [navigate, location]);

    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Authenticating via Google...</h2>
            <p>Please wait while we redirect you.</p>
        </div>
    );
};

export default OAuthSuccess;
