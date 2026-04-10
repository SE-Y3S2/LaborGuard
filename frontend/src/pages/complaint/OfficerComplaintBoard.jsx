import { useEffect, useState } from 'react';
import { getComplaintStats } from '../../services/complaint/complaintService';
import EmptyState from '../../components/core/EmptyState';

const OfficerComplaintBoard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await getComplaintStats();
        setStats(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load complaint statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-bg-secondary p-4 md:p-8 xl:p-12">
      <div className="max-w-[1200px] mx-auto space-y-8">
        <div className="rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-secondary">Legal officer workspace</p>
          <h1 className="text-3xl font-extrabold text-text-primary mt-3">Assigned complaints</h1>
          <p className="text-text-secondary mt-2">Review your assigned cases and update complaint statuses from the detail page.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.16em] font-semibold text-text-secondary">Pending review</p>
            <div className="mt-4 text-4xl font-extrabold text-text-primary">{stats?.byStatus?.pending || 0}</div>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.16em] font-semibold text-text-secondary">Under review</p>
            <div className="mt-4 text-4xl font-extrabold text-text-primary">{stats?.byStatus?.under_review || 0}</div>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.16em] font-semibold text-text-secondary">Resolved</p>
            <div className="mt-4 text-4xl font-extrabold text-text-primary">{stats?.byStatus?.resolved || 0}</div>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm">
          {error ? (
            <div className="text-rose-600">{error}</div>
          ) : loading ? (
            <div className="py-16 text-center text-text-secondary">Loading your dashboard...</div>
          ) : (
            <EmptyState
              title="Assigned case list coming soon"
              description="Legal officer actions are driven by assignments from admins. Open a complaint detail page to update the status once you have an assignment." 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default OfficerComplaintBoard;
