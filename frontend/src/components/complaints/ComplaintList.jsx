import { Link } from 'react-router-dom';

const ComplaintList = ({ complaints, role, onRefresh, pagination, onPageChange }) => {
  if (!complaints?.length) {
    return (
      <div className="rounded-[20px] border border-slate-200 bg-white p-8 text-center">
        <p className="text-text-secondary">No complaints found for the selected filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full border-collapse">
        <thead className="bg-slate-50 text-left text-[0.85rem] text-text-secondary uppercase tracking-[0.08em]">
          <tr>
            <th className="px-6 py-4">Complaint</th>
            <th className="px-6 py-4">Category</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Submitted</th>
            <th className="px-6 py-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((complaint) => (
            <tr key={complaint._id} className="border-t border-slate-200 hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4">
                <div className="font-semibold text-text-primary">{complaint.title}</div>
                <div className="text-[0.85rem] text-text-secondary mt-1">{complaint.employerInfo?.name || 'Employer details not provided'}</div>
              </td>
              <td className="px-6 py-4 text-text-secondary">{complaint.category || 'General'}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex rounded-full px-3 py-1 text-[0.75rem] font-bold uppercase ${complaint.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : complaint.status === 'under_review' ? 'bg-sky-100 text-sky-700' : complaint.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                  {complaint.status}
                </span>
              </td>
              <td className="px-6 py-4 text-text-secondary">{new Date(complaint.createdAt).toLocaleDateString()}</td>
              <td className="px-6 py-4 text-right">
                <Link
                  to={`/complaints/${complaint._id}`}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-text-primary transition hover:bg-slate-100"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {pagination && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 p-4 text-sm text-text-secondary">
          <span>{`Showing ${pagination.currentPage} of ${pagination.totalPages} pages`}</span>
          <div className="flex gap-3">
            <button
              type="button"
              className="rounded-full border border-slate-300 bg-white px-4 py-2 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => onPageChange(Math.max(1, pagination.currentPage - 1))}
              disabled={pagination.currentPage <= 1}
            >
              Previous
            </button>
            <button
              type="button"
              className="rounded-full border border-slate-300 bg-white px-4 py-2 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => onPageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
              disabled={pagination.currentPage >= pagination.totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintList;
