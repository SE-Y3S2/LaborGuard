import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
            setError(err.response?.data?.message || 'Failed to fetch jobs. Make sure the job-service is running on port 5003.');
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

    if (loading) return <div>Loading Jobs...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>Available Jobs (SDG 8 Compliant)</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {(userRole === 'employer' || userRole === 'admin') && (
                        <button onClick={() => navigate('/jobs/new')} style={{ padding: '0.5rem', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>
                            + Post a Job
                        </button>
                    )}
                    <button onClick={() => navigate('/dashboard')} style={{ padding: '0.5rem', cursor: 'pointer' }}>
                        My Profile
                    </button>
                </div>
            </div>

            {error && <p style={{ color: 'red', background: '#fee', padding: '10px' }}>{error}</p>}

            {jobs.length === 0 && !loading && <p>No jobs found.</p>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {jobs.map(job => (
                    <div key={job._id} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', background: '#f9f9f9', position: 'relative' }}>
                        <h3 style={{ margin: '0 0 0.5rem 0' }}>{job.title}</h3>
                        {job.compliesWithMinimumWage && (
                            <span style={{ background: '#d4edda', color: '#155724', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', position: 'absolute', top: '1rem', right: '1rem' }}>
                                ✓ Minimum Wage Verified
                            </span>
                        )}
                        <p style={{ margin: '0 0 0.5rem 0', color: '#555' }}>
                            <strong>Wage:</strong> {job.wage.amount} {job.wage.currency} / {job.wage.frequency}
                        </p>
                        <p style={{ margin: '0 0 0.5rem 0', color: '#555' }}>
                            <strong>Location:</strong> {job.location?.city}, {job.location?.country}
                        </p>
                        <p style={{ margin: '0' }}>{job.description}</p>

                        {(userRole === 'admin') && (
                            <button onClick={() => handleDelete(job._id)} style={{ marginTop: '1rem', background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>
                                [Admin] Delete
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default JobDashboard;
