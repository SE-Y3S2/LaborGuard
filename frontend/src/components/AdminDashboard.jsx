import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const API_URL = 'http://localhost:5001/api/admin/users';

    const getHeaders = () => {
        const token = localStorage.getItem('accessToken');
        return { Authorization: `Bearer ${token}` };
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get(API_URL, { headers: getHeaders() });
            setUsers(response.data.data.users);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch users. Ensure you are logged in as an Admin.');
            if (err.response?.status === 401 || err.response?.status === 403) {
                setTimeout(() => navigate('/dashboard'), 3000);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        try {
            await axios.put(`${API_URL}/${userId}/role`, { role: newRole }, { headers: getHeaders() });
            setSuccess('User role updated successfully');
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update role');
        }
    };

    const handleStatusToggle = async (userId, currentStatus) => {
        try {
            await axios.put(`${API_URL}/${userId}/status`, { isActive: !currentStatus }, { headers: getHeaders() });
            setSuccess(`User account ${!currentStatus ? 'activated' : 'deactivated'}`);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update status');
        }
    };

    const handleApprovalToggle = async (userId) => {
        try {
            // Wait, adminRoutes only exposes /approve, not toggle approval. Let's assume it sets it to true.
            await axios.put(`${API_URL}/${userId}/approve`, {}, { headers: getHeaders() });
            setSuccess('User officially approved!');
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to approve user');
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Are you sure you want to permanently delete this user?')) {
            try {
                await axios.delete(`${API_URL}/${userId}`, { headers: getHeaders() });
                setSuccess('User deleted successfully');
                fetchUsers();
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete user');
            }
        }
    };

    if (loading) return (
        <div className="admin-dashboard-wrapper" style={{ display: 'flex', justifyContent: 'center', marginTop: '5rem' }}>
            <div className="badge badge-warning" style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}>Loading Dashboard Data...</div>
        </div>
    );

    return (
        <div className="admin-dashboard-wrapper">
            <div className="admin-header">
                <div>
                    <h2 style={{ marginBottom: '0.2rem' }}>User Management</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Approve NGOs/Employers & manage platform access</p>
                </div>
                <button onClick={() => navigate('/dashboard')} className="btn-action-outline btn-small">
                    Back to Profile
                </button>
            </div>

            {error && <div style={{ color: 'var(--accent-danger)', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{error}</div>}
            {success && <div style={{ color: 'var(--accent-success)', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{success}</div>}

            <div className="table-container">
                <table className="modern-table">
                    <thead>
                        <tr>
                            <th>User Details</th>
                            <th>Docs (Links)</th>
                            <th>Role</th>
                            <th>Verification</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id}>
                                <td>
                                    <div style={{ fontWeight: 600 }}>{user.firstName} {user.lastName}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user.email}</div>
                                    <div style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>{user.phone}</div>
                                </td>
                                <td>
                                    {user.documents && user.documents.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                            {user.documents.map((doc, i) => (
                                                <a href={doc} target="_blank" rel="noreferrer" key={i} style={{ fontSize: '0.85rem' }}>[View Doc {i+1}]</a>
                                            ))}
                                        </div>
                                    ) : <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>None</span>}
                                </td>
                                <td>
                                    <select
                                        className="table-select"
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                    >
                                        <option value="worker">Worker</option>
                                        <option value="lawyer">Lawyer</option>
                                        <option value="ngo">NGO</option>
                                        <option value="employer">Employer</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-start' }}>
                                        {user.isEmailVerified ? <span className="badge badge-success">Email ✓</span> : <span className="badge badge-danger">Email ✕</span>}
                                        {user.isApproved ? (
                                            <span className="badge badge-success">Approved ✓</span>
                                        ) : (
                                            <button className="badge badge-warning" onClick={() => handleApprovalToggle(user._id)} style={{ cursor: 'pointer', border: 'none' }}>Pending Approval (Click)</button>
                                        )}
                                        {!user.isActive && <span className="badge badge-danger">Deactivated</span>}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column', alignItems: 'flex-start' }}>
                                        <button
                                            onClick={() => handleStatusToggle(user._id, user.isActive)}
                                            className="btn-small btn-action-outline"
                                        >
                                            {user.isActive ? 'Deactivate Login' : 'Reactivate Login'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user._id)}
                                            className="btn-small btn-danger-outline"
                                        >
                                            Delete User
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;
