import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/core/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboards/Dashboard';
import OAuthSuccess from './components/auth/OAuthSuccess';
import VerifyOTP from './components/auth/VerifyOTP';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import AdminDashboard from './components/dashboards/AdminDashboard';
import JobDashboard from './components/jobs/JobDashboard';
import JobForm from './components/jobs/JobForm';
import Navbar from './components/core/Navbar';
import { AuthProvider } from './contexts/complaint/AuthContext';
import ProtectedRoute from './components/core/ProtectedRoute';
import MyComplaintsPage from './pages/complaint/MyComplaintsPage';
import NewComplaintPage from './pages/complaint/NewComplaintPage';
import AdminComplaintBoard from './pages/complaint/AdminComplaintBoard';
import OfficerComplaintBoard from './pages/complaint/OfficerComplaintBoard';
import ComplaintDetailPage from './pages/complaint/ComplaintDetailPage';
import DevTestPage from './pages/complaint/DevTestPage';

const ComplaintsRoot = () => {
  const role = localStorage.getItem('userRole');
  if (role === 'worker') return <Navigate to="/complaints/my" replace />;
  if (role === 'admin') return <Navigate to="/complaints/admin" replace />;
  if (role === 'legal_officer') return <Navigate to="/complaints/officer" replace />;
  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen w-full">
          <Navbar />
          <main className="flex-1 flex flex-col w-full">
            <Routes>
              <Route path="/dev/test" element={<DevTestPage />} />
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify" element={<VerifyOTP />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/jobs" element={<JobDashboard />} />
              <Route path="/jobs/new" element={<JobForm />} />
              <Route path="/complaints" element={<ComplaintsRoot />} />
              <Route path="/complaints/my" element={<ProtectedRoute allowedRoles={[ 'worker' ]}><MyComplaintsPage /></ProtectedRoute>} />
              <Route path="/complaints/new" element={<ProtectedRoute allowedRoles={[ 'worker' ]}><NewComplaintPage /></ProtectedRoute>} />
              <Route path="/complaints/admin" element={<ProtectedRoute allowedRoles={[ 'admin' ]}><AdminComplaintBoard /></ProtectedRoute>} />
              <Route path="/complaints/officer" element={<ProtectedRoute allowedRoles={[ 'legal_officer' ]}><OfficerComplaintBoard /></ProtectedRoute>} />
              <Route path="/complaints/:id" element={<ProtectedRoute allowedRoles={[ 'worker', 'admin', 'legal_officer' ]}><ComplaintDetailPage /></ProtectedRoute>} />
              <Route path="/oauth-success" element={<OAuthSuccess />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
