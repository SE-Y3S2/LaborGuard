import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getComplaintById, updateComplaintStatus } from '../../services/complaint/complaintService';
import Alert from '../../components/core/Alert';
import { useAuth } from '@/hooks/useAuth';
import {
  ArrowLeft, Clock, Building2, User, Tag,
  CheckCircle2, XCircle, Loader2, MessageSquare
} from 'lucide-react';

const STATUS_OPTIONS = ['pending', 'under_review', 'resolved', 'rejected'];

const STATUS_CONFIG = {
  pending:      { label: 'Pending',    cls: 'bg-amber-100 text-amber-700' },
  under_review: { label: 'In Review',  cls: 'bg-blue-100 text-blue-700' },
  resolved:     { label: 'Resolved',   cls: 'bg-green-100 text-green-700' },
  rejected:     { label: 'Rejected',   cls: 'bg-red-100 text-red-700' },
};

const ComplaintDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchComplaint = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getComplaintById(id);
      const data = response.data.data;
      setComplaint(data);
      setNewStatus(data.status);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaint(); }, [id]);

  const handleStatusUpdate = async () => {
    if (newStatus === complaint.status) return;
    setUpdating(true);
    setError('');
    setSuccess('');
    try {
      await updateComplaintStatus(id, { status: newStatus });
      setComplaint((prev) => ({ ...prev, status: newStatus }));
      setSuccess(`Status updated to "${newStatus.replace('_', ' ')}" successfully.`);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update complaint status.');
    } finally {
      setUpdating(false);
    }
  };

  const canUpdateStatus = ['admin', 'lawyer'].includes(user?.role);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-primary border-r-transparent" />
        <p className="mt-4 text-xs font-black uppercase tracking-widest text-slate-400">Loading complaint...</p>
      </div>
    );
  }

  if (error && !complaint) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <Alert type="error" message={error} />
        <button
          onClick={() => navigate(-1)}
          className="mt-4 flex items-center gap-2 text-sm font-bold text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Go back
        </button>
      </div>
    );
  }

  const sc = STATUS_CONFIG[complaint?.status] || { label: complaint?.status, cls: 'bg-slate-100 text-slate-700' };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8 animate-fade-in pb-20">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {error   && <Alert type="error"   message={error} />}
      {success && <Alert type="success" message={success} />}

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm space-y-8">

        {/* Title & Status */}
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <div className="flex-1">
            <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3 ${sc.cls}`}>
              {sc.label}
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {complaint?.title}
            </h1>
          </div>
          {complaint?.priority === 'critical' && (
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-red-100 text-red-600 h-fit">
              Critical Priority
            </span>
          )}
        </div>

        {/* Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { icon: Tag,        label: 'Category',   value: complaint?.category },
            { icon: Building2,  label: 'Employer',   value: complaint?.employerInfo?.name || '—' },
            { icon: Clock,      label: 'Filed On',   value: new Date(complaint?.createdAt).toLocaleDateString() },
            { icon: User,       label: 'Filed By',   value: complaint?.worker?.firstName ? `${complaint.worker.firstName} ${complaint.worker.lastName}` : '—' },
          ].map((m, i) => (
            <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl">
              <m.icon className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{m.label}</p>
                <p className="text-sm font-bold text-slate-700 mt-0.5">{m.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Description */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Description</h2>
          <p className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
            {complaint?.description}
          </p>
        </div>

        {/* Evidence files if any */}
        {complaint?.evidence?.length > 0 && (
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Evidence</h2>
            <div className="flex flex-wrap gap-3">
              {complaint.evidence.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                  className="text-xs font-bold text-primary hover:underline border border-primary/20 bg-primary/5 px-3 py-1.5 rounded-full">
                  Document {i + 1}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Status Update — only for admin/lawyer */}
        {canUpdateStatus && (
          <div className="pt-4 border-t border-slate-100">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Update Status</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="modern-select flex-1 max-w-xs">
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                ))}
              </select>
              <button
                onClick={handleStatusUpdate}
                disabled={updating || newStatus === complaint.status}
                className="btn-primary max-w-[180px] py-3">
                {updating ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />Updating...</>
                ) : (
                  <><CheckCircle2 className="h-4 w-4 mr-2" />Update Status</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Message Button */}
        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={() => navigate(`/messages?complaint=${complaint._id}`)}
            className="flex items-center gap-2 text-sm font-black text-primary hover:underline uppercase tracking-widest">
            <MessageSquare className="h-4 w-4" />
            Send Message About This Case
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetailPage;