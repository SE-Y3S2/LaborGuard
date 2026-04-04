import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import VerifyPage from './pages/public/VerifyPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';
import ResetPasswordPage from './pages/public/ResetPasswordPage';
import OAuthSuccessPage from './pages/public/OAuthSuccessPage';

// Worker Pages
import WorkerDashboard from './pages/worker/WorkerDashboard';
import JobBoardPage from './pages/worker/JobBoardPage';
import MyComplaints from './pages/worker/MyComplaints';
import NewComplaintPage from './pages/worker/NewComplaintPage';
import ComplaintDetailsPage from './pages/worker/ComplaintDetailsPage';
import MyAppointments from './pages/worker/MyAppointments';
import WorkerProfile from './pages/worker/WorkerProfile';

// Portals
import EmployerDashboard from './pages/employer/EmployerDashboard';
import JobFormPage from './pages/employer/JobFormPage';
import JobApplicantsPage from './pages/employer/JobApplicantsPage';
import LegalDashboard from './pages/legal/LegalDashboard';
import NGODashboard from './pages/ngo/NGODashboard'; 

// Shared
import CommunityFeedPage from './pages/community/CommunityFeedPage';
import ChatPage from './pages/messaging/ChatPage';
import AdminDashboard from './pages/admin/AdminDashboard';

import { ProtectedRoute, PublicRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <Router>
      <Toaster position="top-right" expand={false} richColors closeButton />
      <Routes>
        {/* Public Landing & Shared Content */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/jobs" element={<JobBoardPage />} />
          
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/oauth-success" element={<OAuthSuccessPage />} />
          </Route>
        </Route>

        {/* Worker Portal */}
        <Route element={<ProtectedRoute allowedRoles={['worker']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/worker/dashboard" element={<WorkerDashboard />} />
            <Route path="/worker/jobs" element={<JobBoardPage />} />
            <Route path="/worker/complaints" element={<MyComplaints />} />
            <Route path="/worker/complaints/new" element={<NewComplaintPage />} />
            <Route path="/worker/complaints/:id" element={<ComplaintDetailsPage />} />
            <Route path="/worker/appointments" element={<MyAppointments />} />
            <Route path="/worker/profile" element={<WorkerProfile />} />
          </Route>
        </Route>

        {/* Employer Portal */}
        <Route element={<ProtectedRoute allowedRoles={['employer']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/employer/dashboard" element={<EmployerDashboard />} />
            <Route path="/employer/jobs" element={<EmployerDashboard />} />
            <Route path="/employer/jobs/new" element={<JobFormPage />} />
            <Route path="/employer/jobs/:id" element={<JobApplicantsPage />} />
            <Route path="/employer/jobs/:id/edit" element={<JobFormPage />} />
          </Route>
        </Route>

        {/* Legal Portal */}
        <Route element={<ProtectedRoute allowedRoles={['lawyer']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/legal/dashboard" element={<LegalDashboard />} />
            <Route path="/legal/cases" element={<LegalDashboard />} />
            <Route path="/legal/cases/:id" element={<ComplaintDetailsPage />} />
          </Route>
        </Route>

        {/* NGO Portal */}
        <Route element={<ProtectedRoute allowedRoles={['ngo']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/ngo/dashboard" element={<NGODashboard />} />
          </Route>
        </Route>

        {/* Admin Portal */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>
        </Route>

        {/* Common Shared Authenticated Routes */}
        <Route element={<ProtectedRoute allowedRoles={['worker', 'admin', 'lawyer', 'employer', 'ngo']} />}>
           <Route element={<DashboardLayout />}>
              <Route path="/community" element={<CommunityFeedPage />} />
              <Route path="/messages" element={<ChatPage />} />
           </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
