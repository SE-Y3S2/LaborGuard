import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    
    // Role-specific data
    const [workerStats, setWorkerStats] = useState({ total: 0, pending: 0, approved: 0 });
    const [applications, setApplications] = useState([]);
    
    const [adminUsers, setAdminUsers] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [success, setSuccess] = useState('');

    const navigate = useNavigate();

    const AUTH_API = 'http://localhost:5001/api';
    const JOBS_API = 'http://localhost:5003/api';
    const COMPLAINT_API = 'http://localhost:5005/api';

    const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('accessToken')}` });

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) return navigate('/login');

            // 1. Fetch Basic Profile
            const profileRes = await axios.get(`${AUTH_API}/users/me`, { headers: getHeaders() });
            const userData = profileRes.data.data;
            setProfile(userData);
            localStorage.setItem('userRole', userData.role);

            // 2. Fetch Role-Specific Data in Parallel
            if (userData.role === 'worker') {
                const appsRes = await axios.get(`${JOBS_API}/jobs/my-applications`, { headers: getHeaders() }).catch(() => ({ data: { data: [] } }));
                const apps = appsRes.data.data || [];
                setApplications(apps);
                setWorkerStats({
                    total: apps.length,
                    pending: apps.filter(a => a.status === 'pending').length,
                    approved: apps.filter(a => a.status === 'accepted').length
                });
            } else if (userData.role === 'admin') {
                const [usersRes, complaintsRes, jobsRes] = await Promise.all([
                    axios.get(`${AUTH_API}/admin/users`, { headers: getHeaders() }).catch(() => ({ data: { data: { users: [] } } })),
                    axios.get(`${COMPLAINT_API}/complaints`, { headers: getHeaders() }).catch(() => ({ data: { data: [] } })),
                    axios.get(`${JOBS_API}/jobs`, { headers: getHeaders() }).catch(() => ({ data: { data: [] } }))
                ]);
                setAdminUsers(usersRes.data.data.users || []);
                setComplaints(complaintsRes.data.data || []);
                setJobs(jobsRes.data.data || []);
            }
        } catch (err) {
            setError('Session expired. Please log in again.');
            localStorage.removeItem('accessToken');
            setTimeout(() => navigate('/login'), 2000);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [navigate]);

    // ADMIN ACTIONS
    const handleApproval = async (userId) => {
        try {
            await axios.put(`${AUTH_API}/admin/users/${userId}/approve`, {}, { headers: getHeaders() });
            setSuccess('User registration approved!');
            fetchDashboardData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) { alert(err.response?.data?.message || 'Approval failed'); }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Permanently delete this user?')) {
            try {
                await axios.delete(`${AUTH_API}/admin/users/${userId}`, { headers: getHeaders() });
                setSuccess('User removed from platform');
                fetchDashboardData();
                setTimeout(() => setSuccess(''), 3000);
            } catch (err) { alert('Deletion failed'); }
        }
    };

    if (loading) return (
        <div className="dashboard-wrapper">
            <div className="loader-container" style={{ textAlign: 'center', marginTop: '10rem' }}>
                <div className="loader-ring"></div>
                <p style={{ marginTop: '1.5rem', fontWeight: 700 }}>Initializing Mission Control...</p>
            </div>
        </div>
    );

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-container">
                {/* Header Information */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                    <div>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>
                            {profile.role === 'admin' ? 'Administrative Access' : 'Worker Portal'}
                        </span>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                            {profile.role === 'admin' ? 'Platform Governance' : 'Command Center'}
                        </h1>
                    </div>
                </div>

                {success && <div className="alert-box alert-success" style={{ marginBottom: '2rem' }}>{success}</div>}

                {/* ROLE: ADMIN VIEW */}
                {profile.role === 'admin' ? (
                    <>
                        <div className="dashboard-grid">
                            <div className="dashboard-tile stats-tile" onClick={() => setActiveTab('users')} style={{ cursor: 'pointer' }}>
                                <span className="stats-label">Pending Access</span>
                                <div className="stats-value" style={{ color: '#f59e0b' }}>{adminUsers.filter(u => !u.isApproved && u.role !== 'worker').length}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sign-up requests</div>
                            </div>
                            <div className="dashboard-tile stats-tile" onClick={() => setActiveTab('disputes')} style={{ cursor: 'pointer' }}>
                                <span className="stats-label">Active Disputes</span>
                                <div className="stats-value" style={{ color: 'var(--accent-primary)' }}>{complaints.filter(c => c.status !== 'resolved').length}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Pending resolution</div>
                            </div>
                            <div className="dashboard-tile stats-tile">
                                <span className="stats-label">Job Postings</span>
                                <div className="stats-value">{jobs.length}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total vacancies</div>
                            </div>
                            <div className="dashboard-tile stats-tile" style={{ background: 'var(--accent-primary)', color: 'white' }}>
                                <span className="stats-label" style={{ color: 'rgba(255,255,255,0.8)' }}>Platform Trust</span>
                                <div className="stats-value" style={{ color: 'white' }}>High</div>
                                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>Secure Governance</div>
                            </div>
                        </div>

                        {/* Admin Multi-Tab Layout */}
                        <div className="dashboard-tile" style={{ marginTop: '2.5rem', minHeight: '500px' }}>
                            <div className="tile-header" style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '0' }}>
                                <div style={{ display: 'flex', gap: '2rem' }}>
                                    <button onClick={() => setActiveTab('overview')} style={{ padding: '1rem 0', background: 'none', border: 'none', borderBottom: activeTab === 'overview' ? '3px solid var(--accent-primary)' : '3px solid transparent', color: activeTab === 'overview' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}>Requests</button>
                                    <button onClick={() => setActiveTab('disputes')} style={{ padding: '1rem 0', background: 'none', border: 'none', borderBottom: activeTab === 'disputes' ? '3px solid var(--accent-primary)' : '3px solid transparent', color: activeTab === 'disputes' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}>Labor Disputes</button>
                                    <button onClick={() => setActiveTab('jobs')} style={{ padding: '1rem 0', background: 'none', border: 'none', borderBottom: activeTab === 'jobs' ? '3px solid var(--accent-primary)' : '3px solid transparent', color: activeTab === 'jobs' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}>Job Listings</button>
                                    <button onClick={() => setActiveTab('management')} style={{ padding: '1rem 0', background: 'none', border: 'none', borderBottom: activeTab === 'management' ? '3px solid var(--accent-primary)' : '3px solid transparent', color: activeTab === 'management' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}>Management</button>
                                </div>
                            </div>

                            <div style={{ padding: '2rem 0' }}>
                                {/* TAB 1: USER REQUESTS */}
                                {(activeTab === 'overview' || activeTab === 'users') && (
                                    <>
                                        <h3 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Registration Request Queue</h3>
                                        <div className="applications-list">
                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <thead>
                                                    <tr style={{ textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                        <th style={{ paddingBottom: '1rem' }}>Organization / User</th>
                                                        <th style={{ paddingBottom: '1rem' }}>Role Request</th>
                                                        <th style={{ paddingBottom: '1rem' }}>Contact</th>
                                                        <th style={{ paddingBottom: '1rem', textAlign: 'right' }}>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {adminUsers.filter(u => !u.isApproved && u.role !== 'worker').length === 0 ? (
                                                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Queue is clear. No pending approvals.</td></tr>
                                                    ) : adminUsers.filter(u => !u.isApproved && u.role !== 'worker').map(user => (
                                                        <tr key={user._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                            <td style={{ padding: '1.2rem 0' }}>
                                                                <div style={{ fontWeight: 800 }}>{user.firstName} {user.lastName}</div>
                                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user.email}</div>
                                                            </td>
                                                            <td><span className="status-badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>{user.role.toUpperCase()}</span></td>
                                                            <td style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{user.phone || 'No Phone'}</td>
                                                            <td style={{ textAlign: 'right' }}>
                                                                <button onClick={() => handleApproval(user._id)} style={{ background: 'var(--accent-success)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 800, marginRight: '0.5rem' }}>APPROVE</button>
                                                                <button onClick={() => handleDeleteUser(user._id)} style={{ background: 'transparent', border: '1px solid #fee2e2', color: '#dc2626', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>REJECT</button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                )}

                                {/* TAB 2: DISPUTES */}
                                {activeTab === 'disputes' && (
                                    <>
                                        <h3 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Labor Complaint Management</h3>
                                        {complaints.length === 0 ? (
                                            <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>No disputes recorded on platform.</p>
                                        ) : (
                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <thead>
                                                    <tr style={{ textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                        <th style={{ paddingBottom: '1rem' }}>Complainant</th>
                                                        <th style={{ paddingBottom: '1rem' }}>Type</th>
                                                        <th style={{ paddingBottom: '1rem' }}>Status</th>
                                                        <th style={{ paddingBottom: '1rem', textAlign: 'right' }}>Management</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {complaints.map(complaint => (
                                                        <tr key={complaint._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                            <td style={{ padding: '1.2rem 0' }}>
                                                                <div style={{ fontWeight: 800 }}>Complaint #{complaint._id.substring(18)}</div>
                                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Date: {new Date(complaint.createdAt).toLocaleDateString()}</div>
                                                            </td>
                                                            <td><span className="status-badge" style={{ background: '#fef3c7', color: '#92400e' }}>Ref: Law-B12</span></td>
                                                            <td><span className={`status-badge status-${complaint.status}`}>{complaint.status}</span></td>
                                                            <td style={{ textAlign: 'right' }}>
                                                                <button style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', fontWeight: 800, cursor: 'pointer' }}>Assign Officer</button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </>
                                )}

                                {/* TAB 3: JOBS */}
                                {activeTab === 'jobs' && (
                                    <>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                            <h3 style={{ fontWeight: 800 }}>Active Vacancies Moderation</h3>
                                            <button onClick={() => navigate('/jobs/new')} className="btn-tile-action btn-tile-primary" style={{ margin: 0, width: 'auto', padding: '0.6rem 1.2rem' }}>+ Create Admin Vacancy</button>
                                        </div>
                                        {jobs.length === 0 ? <p style={{ textAlign: 'center', padding: '3rem' }}>No jobs found.</p> : (
                                            <div className="applications-list">
                                                {jobs.slice(0, 5).map(job => (
                                                    <div key={job._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
                                                        <div>
                                                            <div style={{ fontWeight: 800 }}>{job.title}</div>
                                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Posted by: Official System</div>
                                                        </div>
                                                        <button style={{ background: '#fee2e2', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}>🗑️</button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* TAB 4: MANAGEMENT */}
                                {activeTab === 'management' && (
                                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
                                        <h3>Administrative Power</h3>
                                        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '1rem auto' }}>Manage legal officers, system parameters, and platform health.</p>
                                        <button className="btn-tile-action btn-tile-primary" style={{ width: '250px', margin: '0 auto' }}>Manage Legal Repository</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    /* ROLE: WORKER VIEW (Restored existing high-end UI) */
                    <>
                        <div className="dashboard-grid">
                            <div className="dashboard-tile stats-tile">
                                <span className="stats-label">Applied Jobs</span>
                                <div className="stats-value">{workerStats.total}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total trackings</div>
                            </div>
                            <div className="dashboard-tile stats-tile">
                                <span className="stats-label" style={{ color: '#f59e0b' }}>Pending Review</span>
                                <div className="stats-value" style={{ color: '#f59e0b' }}>{workerStats.pending}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Awaiting employer</div>
                            </div>
                            <div className="dashboard-tile stats-tile">
                                <span className="stats-label" style={{ color: 'var(--accent-success)' }}>Approved Jobs</span>
                                <div className="stats-value" style={{ color: 'var(--accent-success)' }}>{workerStats.approved}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Active placements</div>
                            </div>
                            <div className="dashboard-tile stats-tile" style={{ background: 'var(--accent-primary)', color: 'white' }}>
                                <span className="stats-label" style={{ color: 'rgba(255,255,255,0.8)' }}>Platform Points</span>
                                <div className="stats-value" style={{ color: 'white' }}>100</div>
                                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Trust Level 1</div>
                            </div>

                            <div className="dashboard-tile profile-tile">
                                <div className="profile-avatar-large">{profile.firstName.charAt(0)}</div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{profile.firstName} {profile.lastName}</h2>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{profile.email}</p>
                                <Link to="#" className="btn-tile-action btn-tile-primary">Edit My Profile</Link>
                                <Link to="/jobs" className="btn-tile-action">Browse New Jobs</Link>
                            </div>

                            <div className="dashboard-tile main-content-tile">
                                <div className="tile-header"><h3 className="tile-title">Recent Applications</h3></div>
                                {applications.length === 0 ? <p style={{ textAlign: 'center', padding: '4rem' }}>No applications yet.</p> : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                <th style={{ paddingBottom: '1rem' }}>Job Opportunity</th>
                                                <th style={{ paddingBottom: '1rem' }}>Status</th>
                                                <th style={{ paddingBottom: '1rem', textAlign: 'right' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {applications.map(app => (
                                                <tr key={app._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '1.2rem 0' }}><div style={{ fontWeight: 700 }}>{app.jobId?.title}</div></td>
                                                    <td><span className={`status-badge status-${app.status}`}>{app.status}</span></td>
                                                    <td style={{ textAlign: 'right' }}><button style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', fontWeight: 800 }}>View Details</button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
