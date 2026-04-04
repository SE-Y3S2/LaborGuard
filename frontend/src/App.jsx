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

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen w-full">
        <Navbar />
        <main className="flex-1 flex flex-col w-full">
          <Routes>
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
            <Route path="/oauth-success" element={<OAuthSuccess />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
