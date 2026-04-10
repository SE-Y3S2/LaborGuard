import { useState } from 'react';
import { createComplaint } from '../../services/complaint/complaintService';
import Alert from '../core/Alert';

const categories = [
  'Wage Violation',
  'Workplace Safety',
  'Harassment',
  'Contract Breach',
  'Other'
];

const ComplaintForm = ({ onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [employerName, setEmployerName] = useState('');
  const [employerDetails, setEmployerDetails] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      await createComplaint({
        title,
        description,
        category,
        employerInfo: {
          name: employerName,
          details: employerDetails
        }
      });
      setSuccess('Your complaint is filed successfully.');
      setTitle('');
      setDescription('');
      setEmployerName('');
      setEmployerDetails('');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to file complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-extrabold text-text-primary mb-3">File a new complaint</h2>
      <p className="text-text-secondary mb-6">Submit the details of the labor concern and our system will track it for review.</p>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      <form onSubmit={handleSubmit} className="grid gap-6">
        <label className="block">
          <span className="form-label">Complaint title</span>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="modern-input" placeholder="Describe the issue in a short title" />
        </label>

        <label className="block">
          <span className="form-label">Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="modern-select">
            {categories.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="form-label">Complaint details</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="5" required className="modern-input resize-none" placeholder="Provide a detailed description of the issue." />
        </label>

        <div className="grid gap-6 sm:grid-cols-2">
          <label className="block">
            <span className="form-label">Employer / Company</span>
            <input type="text" value={employerName} onChange={(e) => setEmployerName(e.target.value)} className="modern-input" placeholder="e.g. Acme Construction" />
          </label>
          <label className="block">
            <span className="form-label">Employer contact or location</span>
            <input type="text" value={employerDetails} onChange={(e) => setEmployerDetails(e.target.value)} className="modern-input" placeholder="City, branch or supervisor name" />
          </label>
        </div>

        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Filing complaint...' : 'Submit complaint'}
        </button>
      </form>
    </div>
  );
};

export default ComplaintForm;
