import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [filterPending, setFilterPending] = useState(false);
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
            setTimeout(() => setSuccess(''), 3000);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update role');
        }
    };

    const handleStatusToggle = async (userId, currentStatus) => {
        try {
            await axios.put(`${API_URL}/${userId}/status`, { isActive: !currentStatus }, { headers: getHeaders() });
            setSuccess(`User account ${!currentStatus ? 'activated' : 'deactivated'}`);
            setTimeout(() => setSuccess(''), 3000);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update status');
        }
    };

    const handleApproval = async (userId) => {
        try {
            await axios.put(`${API_URL}/${userId}/approve`, {}, { headers: getHeaders() });
            setSuccess('User officially approved!');
            setTimeout(() => setSuccess(''), 3000);
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
                setTimeout(() => setSuccess(''), 3000);
                fetchUsers();
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete user');
            }
        }
    };

    const filteredUsers = filterPending ? users.filter(u => !u.isApproved && u.role !== 'worker' && u.role !== 'admin') : users;

    if (loading) return (
        <div className="admin-dashboard-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10rem' }}>
            <div className="loader-ring"></div>
            <p style={{ marginTop: '1.5rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Loading Administrative Access...</p>
        </div>
    );

    return (
        <div className="admin-dashboard-wrapper">
            <div className="admin-header">
                <div>
                    <h2>Platform Governance</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        Manage platform access, roles, and registration approvals.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '1rem' }}>
                        <input 
                            type="checkbox" 
                            id="filterPending" 
                            checked={filterPending} 
                            onChange={() => setFilterPending(!filterPending)}
                        />
                        <label htmlFor="filterPending" style={{ fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer' }}>Show Pending Only</label>
                    </div>
                    <button onClick={() => navigate('/dashboard')} className="btn-small btn-action-outline">
                        My Profile
                    </button>
                </div>
            </div>

            {error && <div className="alert-box alert-danger">{error}</div>}
            {success && <div className="alert-box alert-success">{success}</div>}

            <div className="table-container">
                <table className="modern-table">
                    <thead>
                        <tr>
                            <th>User Profile</th>
                            <th>Verification Check</th>
                            <th>Platform Role</th>
                            <th>Approval Actions</th>
                            <th>Account Management</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                                    No users found matching current filters.
                                </td>
                            </tr>
                        ) : filteredUsers.map(user => (
                            <tr key={user._id}>
                                <td>
                                    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                                        {user.firstName} {user.lastName}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{user.email}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: '600', marginTop: '0.2rem' }}>{user.phone}</div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <span className={`status-dot ${user.isEmailVerified ? 'bg-success' : 'bg-danger'}`}></span>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Email {user.isEmailVerified ? 'Verified' : 'Unverified'}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <span className={`status-dot ${user.isApproved ? 'bg-success' : 'bg-warning'}`}></span>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Status: {user.isApproved ? 'Approved' : 'Pending Approval'}</span>
                                        </div>
                                    </div>
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
                                    {user.isApproved ? (
                                        <button className="badge badge-success" disabled style={{ border: 'none', opacity: 0.8 }}>
                                            Validated ✓
                                        </button>
                                    ) : (
                                        <button 
                                            className="badge badge-warning btn-hover-active" 
                                            onClick={() => handleApproval(user._id)}
                                            style={{ cursor: 'pointer', border: 'none', boxShadow: '0 4px 10px rgba(217, 119, 6, 0.2)' }}
                                        >
                                            APPROVE USER 🛡️
                                        </button>
                                    )}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                                        <button
                                            onClick={() => handleStatusToggle(user._id, user.isActive)}
                                            className="btn-small btn-action-outline"
                                            title={user.isActive ? 'Block Access' : 'Restore Access'}
                                        >
                                            {user.isActive ? 'Suspend' : 'Activate'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user._id)}
                                            className="btn-small btn-danger-outline"
                                            title="Permanently Delete"
                                        >
                                            Delete
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
