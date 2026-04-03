import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const navigate = useNavigate();
    
    // Check if user is logged in
    const token = localStorage.getItem('accessToken');
    const userRole = localStorage.getItem('userRole');

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);
    const closeDrawer = () => setIsDrawerOpen(false);

    return (
        <>
            {/* Drawer Overlay Backdrop */}
            {isDrawerOpen && <div className="drawer-backdrop" onClick={closeDrawer}></div>}
            
            {/* Side Drawer */}
            <aside className={`drawer ${isDrawerOpen ? 'open' : ''}`}>
                <div className="drawer-header">
                    <h3 className="drawer-title">Menu</h3>
                    <button className="drawer-close-btn" onClick={closeDrawer}>✕</button>
                </div>
                
                <div className="drawer-links">
                    <Link to="/" className="drawer-link" onClick={closeDrawer}>Home</Link>
                    <Link to="/jobs" className="drawer-link" onClick={closeDrawer}>Jobs</Link>
                    
                    <Link to="#" className="drawer-link" onClick={closeDrawer}>News</Link>
                    <Link to="#" className="drawer-link" onClick={closeDrawer}>About</Link>
                    
                    {!token && (
                        <div className="drawer-auth">
                            <Link to="/login" className="drawer-btn-outline" onClick={closeDrawer}>Log In</Link>
                            <Link to="/register" className="drawer-btn-primary" onClick={closeDrawer}>Sign up</Link>
                        </div>
                    )}
                </div>
            </aside>

            {/* Standard Navbar */}
            <nav className="navbar">
                <div className="navbar-container">
                    
                    {/* Left Section: Hamburger + Logo */}
                    <div className="navbar-left">
                        <button className="hamburger-btn" onClick={toggleDrawer} aria-label="Open menu">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </svg>
                        </button>

                        <Link to="/" className="navbar-logo">
                            Labor<span>Guard</span>
                        </Link>
                    </div>

                    {/* Right Section: Desktop Menu + Profile */}
                    <div className="navbar-menu">
                        <Link to="/" className="nav-item">Home</Link>
                        <Link to="/jobs" className="nav-item">Jobs</Link>
                        <Link to="#" className="nav-item">News</Link>
                        
                        {token ? (
                            <div className="nav-profile-area" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginLeft: '1rem' }}>
                                <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                                    <div className="nav-avatar" style={{ 
                                        width: '38px', 
                                        height: '38px', 
                                        borderRadius: '50%', 
                                        background: 'var(--accent-primary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(37, 137, 245, 0.2)',
                                        transition: 'transform 0.2s, box-shadow 0.2s'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 137, 245, 0.4)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 137, 245, 0.2)'; }}
                                    title="My Dashboard"
                                    >
                                        {userRole ? userRole.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                </Link>

                                <button onClick={handleLogout} style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    padding: '0.4rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-danger)'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                                title="Log Out"
                                >
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                        <polyline points="16 17 21 12 16 7"></polyline>
                                        <line x1="21" y1="12" x2="9" y2="12"></line>
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <div className="nav-auth-buttons">
                                <Link to="/register" className="nav-item" style={{ 
                                    color: '#ffb703', 
                                    fontWeight: '700',
                                    borderBottom: '2px solid #ffb703',
                                    paddingBottom: '2px'
                                }}>Sign up</Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navbar;
