import { useEffect, useState } from 'react';
import { getAllComplaints, getComplaintStats } from '../../services/complaint/complaintService';
import ComplaintFilters from '../../components/complaints/ComplaintFilters';
import ComplaintList from '../../components/complaints/ComplaintList';
import EmptyState from '../../components/core/EmptyState';

const AdminComplaintBoard = () => {
  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: '', page: 1, limit: 10 });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      const response = await getComplaintStats();
      setStats(response.data.data);
    } catch {
      setStats(null);
    }
  };

  const fetchComplaints = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getAllComplaints({
        page: filters.page,
        limit: filters.limit,
        status: filters.status,
        search: filters.search
      });
      setComplaints(response.data.data.complaints || []);
      setPagination(response.data.data.pagination || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [filters.page]);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-bg-secondary p-4 md:p-8 xl:p-12">
      <div className="max-w-[1400px] mx-auto space-y-8">
        <div className="rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-secondary">Admin complaint console</p>
              <h1 className="text-3xl font-extrabold text-text-primary mt-3">Complaint management</h1>
              <p className="text-text-secondary mt-2">Manage and review all incoming complaints with fast filtering and status control.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_0.7fr]">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-text-secondary">Pending</p>
                <div className="mt-4 text-3xl font-extrabold text-text-primary">{stats?.byStatus?.pending || 0}</div>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-text-secondary">Under review</p>
                <div className="mt-4 text-3xl font-extrabold text-text-primary">{stats?.byStatus?.under_review || 0}</div>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-text-secondary">Resolved</p>
                <div className="mt-4 text-3xl font-extrabold text-text-primary">{stats?.byStatus?.resolved || 0}</div>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm">
              <ComplaintFilters filters={filters} onChange={setFilters} />
              {error && <div className="text-rose-600 mb-4">{error}</div>}
              {loading ? (
                <div className="py-16 text-center text-text-secondary">Loading complaints...</div>
              ) : complaints.length ? (
                <ComplaintList complaints={complaints} role="admin" pagination={pagination} onPageChange={(page) => setFilters({ ...filters, page })} />
              ) : (
                <EmptyState title="No complaints found" description="Try clearing filters or wait for new complaints to appear in the queue." />
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-extrabold text-text-primary mb-3">Board insights</h2>
              <p className="text-text-secondary mb-4">Use the dashboard cards above to review the pipeline. Admin tools are available inside each complaint detail.</p>
              <ul className="space-y-3 text-text-secondary">
                <li>• Assign imported cases to legal officers</li>
                <li>• Move statuses from pending to under review</li>
                <li>• Generate complaint reports when needed</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AdminComplaintBoard;
