import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const JobDashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // The Job Service is running on Port 5003
    const API_URL = 'http://localhost:5003/api/jobs';

    const userRole = localStorage.getItem('userRole'); // We need to store this on login!

    const fetchJobs = async () => {
        try {
            const response = await axios.get(API_URL);
            setJobs(response.data.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch jobs. Make sure the job-service is running.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleDelete = async (jobId) => {
        if (window.confirm('Delete this job?')) {
            try {
                const token = localStorage.getItem('accessToken');
                await axios.delete(`${API_URL}/${jobId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchJobs();
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete job');
            }
        }
    };

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <div>
                        <h1 className="dashboard-header-title">Job Board</h1>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Browse SDG 8 Compliant Opportunities</p>
                    </div>
                    <div className="dashboard-header-actions">
                        {(userRole === 'employer' || userRole === 'admin') && (
                            <button className="btn-dashboard" onClick={() => navigate('/jobs/new')} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                                <span style={{ marginRight: '8px' }}>+</span> Post a Job
                            </button>
                        )}
                        <button className="btn-dashboard" onClick={() => navigate('/dashboard')}>
                            My Profile
                        </button>
                    </div>
                </div>

                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '1rem 1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
                        {error}
                    </div>
                )}

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                        <div style={{ margin: '0 auto 1.5rem auto', width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        <h3 style={{ color: 'var(--text-primary)' }}>Loading Jobs...</h3>
                    </div>
                ) : (
                    <>
                        {jobs.length === 0 ? (
                            <div className="empty-state">
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                                <h3>No Jobs Found</h3>
                                <p>There are no jobs available right now. Please check back later.</p>
                                {(userRole === 'employer' || userRole === 'admin') && (
                                    <button className="btn-dashboard" style={{ marginTop: '1.5rem' }} onClick={() => navigate('/jobs/new')}>
                                        Post the first job
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="jobs-grid">
                                {jobs.map(job => (
                                    <div key={job._id} className="dashboard-card job-card">
                                        <div className="job-header">
                                            <h3 className="job-title">{job.title}</h3>
                                            {job.compliesWithMinimumWage && (
                                                <div className="job-badge-verified">
                                                    <span>✓</span> Verified Wage
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="job-details">
                                            <div className="job-detail-chip">
                                                <span>💰</span> {job.wage.amount} {job.wage.currency} / {job.wage.frequency}
                                            </div>
                                            <div className="job-detail-chip">
                                                <span>📍</span> {job.location?.city || 'Remote'}, {job.location?.country}
                                            </div>
                                            <div className="job-detail-chip">
                                                <span>⏱️</span> <span style={{ textTransform: 'capitalize' }}>{job.jobType || 'Full-time'}</span>
                                            </div>
                                        </div>
                                        
                                        <p className="job-description">
                                            {job.description.length > 150 
                                                ? `${job.description.substring(0, 150)}...` 
                                                : job.description}
                                        </p>

                                        <div className="job-actions">
                                            {(userRole === 'admin' || userRole === 'employer') && (
                                                <button className="btn-danger" onClick={() => handleDelete(job._id)}>
                                                    Delete Job
                                                </button>
                                            )}
                                            {/* Apply button placeholder for workers */}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default JobDashboard;
