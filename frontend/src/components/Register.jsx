import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        birthDate: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'worker',
        documents: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const API_URL = 'http://localhost:5001/api/auth';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        // Basic client-side validation
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            const submitData = { ...formData };
            if (submitData.documents) {
                submitData.documents = submitData.documents.split(',').map(d => d.trim());
            } else {
                submitData.documents = [];
            }

            const response = await axios.post(`${API_URL}/register`, submitData);
            setSuccess(response.data.message);
            // Redirect to verification UI and pass the newly created userId
            setTimeout(() => navigate('/verify', { state: { userId: response.data.data.userId } }), 1000);
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${API_URL}/google`;
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card glass-container">
                <div className="auth-header">
                    <h2>Join LaborGuard</h2>
                    <p>Create an account to access the platform</p>
                </div>

                {error && <div style={{ color: 'var(--accent-danger)', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
                {success && <div style={{ color: 'var(--accent-success)', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>{success}</div>}

                <form onSubmit={handleRegister}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group" style={{ marginBottom: '0' }}>
                            <label className="form-label">First Name</label>
                            <input name="firstName" className="modern-input" placeholder="First Name" onChange={handleChange} required />
                        </div>
                        <div className="form-group" style={{ marginBottom: '0' }}>
                            <label className="form-label">Last Name</label>
                            <input name="lastName" className="modern-input" placeholder="Last Name" onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Role</label>
                        <select name="role" className="modern-select" onChange={handleChange}>
                            <option value="worker">Worker</option>
                            <option value="lawyer">Lawyer / Legal Officer</option>
                            <option value="ngo">NGO Member</option>
                            <option value="employer">Employer</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Date of Birth</label>
                        <input name="birthDate" type="date" className="modern-input" onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input name="email" type="email" className="modern-input" placeholder="name@example.com" onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <input name="phone" className="modern-input" placeholder="+947..." onChange={handleChange} required />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group" style={{ marginBottom: '0' }}>
                            <label className="form-label">Password</label>
                            <input name="password" type="password" className="modern-input" placeholder="••••••••" onChange={handleChange} required />
                        </div>
                        <div className="form-group" style={{ marginBottom: '0' }}>
                            <label className="form-label">Confirm Password</label>
                            <input name="confirmPassword" type="password" className="modern-input" placeholder="••••••••" onChange={handleChange} required />
                        </div>
                    </div>

                    {['lawyer', 'employer', 'ngo'].includes(formData.role) && (
                        <div className="form-group animate-fade-in" style={{ marginTop: '1rem' }}>
                            <label className="form-label" style={{ color: 'var(--accent-primary)' }}>Verification Documents Required</label>
                            <input name="documents" className="modern-input" placeholder="Drive URLs (comma separated)" onChange={handleChange} required />
                            <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Admins will review these documents before approving your account.</small>
                        </div>
                    )}

                    <button type="submit" className="btn-primary" style={{ marginTop: '1.5rem' }} disabled={isLoading}>
                        {isLoading ? 'Creating Account...' : 'Register Now'}
                    </button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
                    <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--glass-border)' }}></div>
                    <span style={{ padding: '0 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>OR</span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--glass-border)' }}></div>
                </div>

                <button onClick={handleGoogleLogin} className="btn-google">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                </button>

                <div className="auth-footer">
                    Already have an account? 
                    <Link to="/login">Log in here</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
