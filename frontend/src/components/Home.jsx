import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    return (
        <div className="home-wrapper">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-background"></div>
                
                <div className="hero-content">
                    <div className="hero-badge">
                        <span>🎯</span> SDG 8 Compliant Platform
                    </div>
                    
                    <h1 className="hero-title">
                        Empowering Fair Labor Worldwide
                    </h1>
                    
                    <p className="hero-subtitle">
                        LaborGuard is a revolutionary platform ensuring transparent contracts, fair wages, 
                        and safe working conditions for global workers, driving sustainable economic growth.
                    </p>
                    
                    <div className="hero-actions">
                        <Link to="/register" className="hero-btn hero-btn-primary">
                            Get Started
                        </Link>
                        <Link to="/jobs" className="hero-btn hero-btn-secondary">
                            Browse Jobs
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="section-header">
                    <h2 className="section-title">Why LaborGuard?</h2>
                    <p className="section-subtitle">Transforming the labor ecosystem with transparency and trust.</p>
                </div>
                
                <div className="features-grid">
                    {/* Feature 1 */}
                    <div className="feature-card">
                        <div className="feature-icon icon-blue">🛡️</div>
                        <h3 className="feature-title">Verified Wages</h3>
                        <p className="feature-desc">
                            All job postings on our platform are strictly verified to comply with regional minimum wage laws, guaranteeing fair compensation.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="feature-card">
                        <div className="feature-icon icon-green">⚖️</div>
                        <h3 className="feature-title">Transparent Dispute Resolution</h3>
                        <p className="feature-desc">
                            Integrated smart-contracts and a network of legal experts ensure any employment disputes are handled swiftly and fairly.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="feature-card">
                        <div className="feature-icon icon-purple">👥</div>
                        <h3 className="feature-title">Community Driven</h3>
                        <p className="feature-desc">
                            Connect with millions of workers, NGOs, and advocates in a safe space dedicated to promoting decent work for all.
                        </p>
                    </div>
                </div>
            </section>

            {/* Call To Action */}
            <section className="cta-section">
                <div className="cta-box">
                    <h2 className="cta-title">Join the Movement</h2>
                    <p className="cta-desc">
                        Whether you are an employer seeking talent or a worker demanding fair treatment, your journey starts here.
                    </p>
                    <Link to="/register" className="hero-btn hero-btn-primary" style={{ padding: '0.8rem 3rem' }}>
                        Create an Account
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
