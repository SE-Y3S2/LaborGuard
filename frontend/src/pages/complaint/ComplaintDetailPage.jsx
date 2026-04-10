import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AuthContext from '../../contexts/complaint/AuthContext';
import { getComplaintById, assignComplaint, updateComplaintStatus } from '../../services/complaint/complaintService';
import ComplaintDetail from '../../components/complaints/ComplaintDetail';
import LoadingSpinner from '../../components/core/LoadingSpinner';
import EmptyState from '../../components/core/EmptyState';

const statusOptions = ['pending', 'under_review', 'resolved', 'rejected'];

const ComplaintDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userRole } = useContext(AuthContext);
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadComplaint = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getComplaintById(id);
      setComplaint(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load complaint details.');
      if (err.response?.status === 404) {
        navigate('/complaints');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaint();
  }, [id]);

  const handleStatusUpdate = async (payload) => {
    await updateComplaintStatus(id, payload);
    await loadComplaint();
  };

  const handleAssign = async (payload) => {
    await assignComplaint(id, payload);
    await loadComplaint();
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-bg-secondary p-8 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-bg-secondary p-8 flex items-center justify-center">
        <div className="max-w-xl rounded-[24px] border border-slate-200 bg-white p-10 shadow-sm">
          <EmptyState title="Unable to load complaint" description={error} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-bg-secondary p-4 md:p-8 xl:p-12">
      <div className="max-w-[1400px] mx-auto space-y-8">
        <div className="rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm">
          <button onClick={() => navigate(-1)} className="text-accent-primary font-semibold hover:text-accent-hover mb-4">← Back to complaints</button>
          <ComplaintDetail
            complaint={complaint}
            role={userRole}
            statusOptions={statusOptions}
            onStatusUpdate={handleStatusUpdate}
            onAssign={handleAssign}
          />
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetailPage;
