import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'worker'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const API_URL = 'http://localhost:5001/api/auth';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_URL}/register`, formData);
            setSuccess(response.data.message);
            // Redirect to verification UI and pass the newly created userId
            setTimeout(() => navigate('/verify', { state: { userId: response.data.data.userId } }), 1000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${API_URL}/google`;
    };

    return (
        <div style={{ border: '1px solid #ccc', padding: '2rem', borderRadius: '8px', maxWidth: '400px', margin: '2rem auto' }}>
            <h2>Register</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}

            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <input name="name" placeholder="Full Name" onChange={handleChange} required style={{ padding: '0.5rem' }} />
                <input name="email" type="email" placeholder="Email" onChange={handleChange} required style={{ padding: '0.5rem' }} />
                <input name="phone" placeholder="Phone (+947...)" onChange={handleChange} required style={{ padding: '0.5rem' }} />
                <input name="password" type="password" placeholder="Password" onChange={handleChange} required style={{ padding: '0.5rem' }} />
                <select name="role" onChange={handleChange} style={{ padding: '0.5rem' }}>
                    <option value="worker">Worker</option>
                    <option value="lawyer">Lawyer / Legal Officer</option>
                    <option value="ngo">NGO Member</option>
                    <option value="employer">Employer</option>
                    <option value="admin">Admin</option>
                </select>

                <button type="submit" style={{ padding: '0.5rem', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer', marginTop: '1rem' }}>
                    Register
                </button>
            </form>

            <div style={{ margin: '1rem 0', textAlign: 'center' }}>OR</div>

            <button onClick={handleGoogleLogin} style={{ padding: '0.5rem', width: '100%', background: '#db4437', color: 'white', border: 'none', cursor: 'pointer' }}>
                Register with Google
            </button>

            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <Link to="/login">Already have an account? Login</Link>
            </div>
        </div>
    );
};

export default Register;
