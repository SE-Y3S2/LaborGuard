import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const JobDashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Application Modal State
    const [selectedJob, setSelectedJob] = useState(null);
    const [experience, setExperience] = useState('');
    const [details, setDetails] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const navigate = useNavigate();
    const JOBS_API = 'http://localhost:5003/api/jobs';
    const userRole = localStorage.getItem('userRole');

    const fetchJobs = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const [jobsRes, appsRes] = await Promise.all([
                axios.get(JOBS_API),
                token && userRole === 'worker' ? axios.get(`${JOBS_API}/my-applications`, { headers }) : Promise.resolve({ data: { data: [] } })
            ]);

            setJobs(jobsRes.data.data);
            setMyApplications(appsRes.data.data || []);
            setError('');
        } catch (err) {
            setError('Failed to fetch jobs.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleApplySubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = localStorage.getItem('accessToken');
            await axios.post(`${JOBS_API}/${selectedJob._id}/apply`, {
                workerExperience: experience,
                additionalDetails: details
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccess('Application submitted successfully!');
            setSelectedJob(null);
            setExperience('');
            setDetails('');
            fetchJobs();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to apply');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (jobId) => {
        if (window.confirm('Delete this job?')) {
            try {
                const token = localStorage.getItem('accessToken');
                await axios.delete(`${JOBS_API}/${jobId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchJobs();
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete job');
            }
        }
    };

    const hasApplied = (jobId) => myApplications.some(app => app.jobId?._id === jobId);

    return (
        <div className="dashboard-wrapper" style={{ backgroundColor: '#f8fafc' }}>
            <div className="dashboard-container">
                <div className="dashboard-header" style={{ marginBottom: '4rem' }}>
                    <div>
                        <h1 className="dashboard-header-title" style={{ fontSize: '2.8rem', fontWeight: 800, color: 'white' }}>Opportunity Portal</h1>
                        <p style={{ marginTop: '0.5rem', fontWeight: 600, color: 'white' }}>Vacancies For Informal Workers</p>
                    </div>
                    <div className="dashboard-header-actions" style={{ gap: '1rem' }}>
                        {(userRole === 'employer' || userRole === 'admin') && (
                            <button className="btn-dashboard btn-tile-primary" onClick={() => navigate('/jobs/new')} style={{ padding: '0.8rem 1.5rem', fontWeight: 700 }}>
                                + Create Vacancy
                            </button>
                        )}
                        <button className="btn-dashboard" onClick={() => navigate('/dashboard')} style={{ padding: '0.8rem 1.5rem', fontWeight: 700 }}>
                            Command Center
                        </button>
                    </div>
                </div>

                {success && <div className="alert-box alert-success" style={{ marginBottom: '2rem', animation: 'fadeIn 0.3s ease' }}>{success}</div>}

                {loading ? (
                    <div className="loader-container" style={{ textAlign: 'center', padding: '5rem' }}>
                        <div className="loader-ring"></div>
                        <p style={{ marginTop: '1.5rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Syncing vacancies...</p>
                    </div>
                ) : (
                    <div className="jobs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                        {jobs.map(job => (
                            <div key={job._id} className="dashboard-tile" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <div style={{
                                    height: '200px',
                                    backgroundImage: `url(${job.imageUrl})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    position: 'relative'
                                }}>
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6))' }}></div>
                                    <div style={{ position: 'absolute', bottom: '1rem', left: '1.5rem', right: '1.5rem', color: 'white' }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9 }}>{job.jobType}</div>
                                        <h3 style={{ margin: '0.2rem 0 0.5rem 0', fontSize: '1.4rem', fontWeight: 800, lineHeight: 1.2 }}>{job.title}</h3>
                                    </div>
                                </div>

                                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.2rem' }}>
                                        <div className="status-badge" style={{ backgroundColor: '#f1f5f9', color: 'var(--text-primary)', border: 'none', fontSize: '0.7rem', display: 'flex', alignItems: 'center' }}>
                                            💰 {job.wage.amount} {job.wage.currency} / {job.wage.frequency}
                                        </div>
                                        <div className="status-badge" style={{ backgroundColor: '#f1f5f9', color: 'var(--text-primary)', border: 'none', fontSize: '0.7rem', display: 'flex', alignItems: 'center' }}>
                                            📍 {job.location?.city}
                                        </div>
                                    </div>

                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2rem', flex: 1 }}>
                                        {job.description.length > 150 ? `${job.description.substring(0, 150)}...` : job.description}
                                    </p>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1.2rem', borderTop: '1px solid #f1f5f9' }}>
                                        {userRole === 'worker' ? (
                                            hasApplied(job._id) ? (
                                                <button disabled className="btn-tile-action" style={{ width: '100%', margin: 0, background: '#dcfce7', color: '#166534', border: 'none' }}>Applied Successfully ✓</button>
                                            ) : (
                                                <button className="btn-tile-action btn-tile-primary" style={{ width: '100%', margin: 0 }} onClick={() => setSelectedJob(job)}>Apply Now</button>
                                            )
                                        ) : (
                                            <button className="btn-tile-action" style={{ width: '100%', margin: 0 }} onClick={() => navigate('/login')}>Login to Apply</button>
                                        )}

                                        {(userRole === 'admin' || userRole === 'employer') && (
                                            <button
                                                onClick={() => handleDelete(job._id)}
                                                style={{ marginLeft: '1rem', background: '#fee2e2', border: 'none', padding: '0.8rem', borderRadius: '12px', cursor: 'pointer', transition: 'transform 0.2s' }}
                                                onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                                                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                            >🗑️</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* APPLICATION MODAL */}
            {selectedJob && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div className="dashboard-tile" style={{ maxWidth: '600px', width: '100%', padding: '2.5rem', animation: 'fadeIn 0.3s ease-out', position: 'relative' }}>
                        <button onClick={() => setSelectedJob(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>✕</button>

                        <div style={{ marginBottom: '2rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>Submitting Application For</span>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>{selectedJob.title}</h2>
                        </div>

                        <form onSubmit={handleApplySubmit}>
                            <div className="form-group">
                                <label className="form-label" style={{ fontWeight: 800 }}>1. Your Relevant Experience</label>
                                <textarea
                                    className="modern-input"
                                    placeholder="Describe your past work, skills, and why you're a good fit for this role..."
                                    value={experience}
                                    onChange={(e) => setExperience(e.target.value)}
                                    required
                                    style={{ minHeight: '120px' }}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" style={{ fontWeight: 800 }}>2. Additional Details (Availability, Phone, etc.)</label>
                                <textarea
                                    className="modern-input"
                                    placeholder="Any Other info for the employer?"
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                    style={{ minHeight: '80px' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                                <button type="submit" className="btn-tile-action btn-tile-primary" style={{ flex: 2, padding: '1rem', fontSize: '1rem' }} disabled={submitting}>
                                    {submitting ? 'Submitting Portfolio...' : 'Submit My Application'}
                                </button>
                                <button type="button" className="btn-tile-action" style={{ flex: 1, padding: '1rem' }} onClick={() => setSelectedJob(null)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobDashboard;
