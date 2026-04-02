import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    
    // Check if user is logged in natively (since we don't have global state yet, we just check localStorage)
    const token = localStorage.getItem('accessToken');
    const userRole = localStorage.getItem('userRole');

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    return (
        <nav className="navbar glass-container">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    Labor<span>Guard</span>
                </Link>

                <div className="navbar-menu">
                    <Link to="/jobs" className="nav-item">Jobs</Link>
                    
                    {token ? (
                        <div className="nav-profile-area" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem' }}>
                            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                                <div className="nav-avatar" style={{ 
                                    width: '40px', 
                                    height: '40px', 
                                    borderRadius: '50%', 
                                    background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '1.2rem',
                                    border: '2px solid rgba(255,255,255,0.2)',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(56, 189, 248, 0.2)',
                                    transition: 'transform 0.2s, box-shadow 0.2s'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(56, 189, 248, 0.4)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(56, 189, 248, 0.2)'; }}
                                title="My Profile"
                                >
                                    {userRole ? userRole.charAt(0).toUpperCase() : 'U'}
                                </div>
                            </Link>

                            {/* Optional quick logout icon button */}
                            <button onClick={handleLogout} style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                padding: '0.4rem',
                                fontSize: '1.2rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '50%',
                                transition: 'color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                            title="Log Out"
                            >
                                ⎋
                            </button>
                        </div>
                    ) : (
                        <div className="nav-auth-buttons">
                            <Link to="/login" className="btn-login-outline">Log In</Link>
                            <Link to="/register" className="btn-primary">Sign Up</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
