import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
                // Not admin or token expired
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
            fetchUsers(); // Refresh list
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update role');
        }
    };

    const handleStatusToggle = async (userId, currentStatus) => {
        try {
            await axios.put(`${API_URL}/${userId}/status`, { isActive: !currentStatus }, { headers: getHeaders() });
            setSuccess(`User account ${!currentStatus ? 'activated' : 'deactivated'}`);
            fetchUsers(); // Refresh list
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update status');
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Are you sure you want to permanently delete this user?')) {
            try {
                await axios.delete(`${API_URL}/${userId}`, { headers: getHeaders() });
                setSuccess('User deleted successfully');
                fetchUsers(); // Refresh list
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete user');
            }
        }
    };

    if (loading) return <div>Loading Admin Dashboard...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Admin Dashboard - User Management</h2>
                <button onClick={() => navigate('/dashboard')} style={{ padding: '0.5rem', cursor: 'pointer' }}>
                    Back to My Profile
                </button>
            </div>

            {error && <p style={{ color: 'red', padding: '10px', background: '#fee' }}>{error}</p>}
            {success && <p style={{ color: 'green', padding: '10px', background: '#efe' }}>{success}</p>}

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                <thead>
                    <tr style={{ background: '#f4f4f4', textAlign: 'left' }}>
                        <th style={{ padding: '10px', border: '1px solid #ccc' }}>Name</th>
                        <th style={{ padding: '10px', border: '1px solid #ccc' }}>Email</th>
                        <th style={{ padding: '10px', border: '1px solid #ccc' }}>Role</th>
                        <th style={{ padding: '10px', border: '1px solid #ccc' }}>Status</th>
                        <th style={{ padding: '10px', border: '1px solid #ccc' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user._id}>
                            <td style={{ padding: '10px', border: '1px solid #ccc' }}>{user.name}</td>
                            <td style={{ padding: '10px', border: '1px solid #ccc' }}>{user.email}</td>
                            <td style={{ padding: '10px', border: '1px solid #ccc' }}>
                                <select
                                    value={user.role}
                                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                    style={{ padding: '0.2rem' }}
                                >
                                    <option value="worker">Worker</option>
                                    <option value="lawyer">Lawyer</option>
                                    <option value="ngo">NGO</option>
                                    <option value="employer">Employer</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </td>
                            <td style={{ padding: '10px', border: '1px solid #ccc', color: user.isActive ? 'green' : 'red' }}>
                                {user.isActive ? 'Active' : 'Inactive'}
                            </td>
                            <td style={{ padding: '10px', border: '1px solid #ccc' }}>
                                <button
                                    onClick={() => handleStatusToggle(user._id, user.isActive)}
                                    style={{ marginRight: '5px', padding: '0.2rem 0.5rem', background: user.isActive ? '#ffc107' : '#28a745', border: 'none', cursor: 'pointer' }}
                                >
                                    {user.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                    onClick={() => handleDelete(user._id)}
                                    style={{ padding: '0.2rem 0.5rem', background: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' }}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminDashboard;
