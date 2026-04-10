const statusOptions = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'under_review', label: 'Under review' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'rejected', label: 'Rejected' }
];

const ComplaintFilters = ({ filters, onChange }) => {
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_auto] items-end mb-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-text-primary">Search complaints</span>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value, page: 1 })}
            placeholder="Search by title, employer or status"
            className="modern-input"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-text-primary">Filter by status</span>
          <select
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value, page: 1 })}
            className="modern-select"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>
      <button
        type="button"
        className="btn-primary max-w-max"
        onClick={() => onChange({ search: '', status: '', page: 1, limit: filters.limit })}
      >
        Clear filters
      </button>
    </div>
  );
};

export default ComplaintFilters;
