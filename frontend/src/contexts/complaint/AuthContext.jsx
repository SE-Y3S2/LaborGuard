import { createContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../../services/complaint/apiClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken') || '');
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || '');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isAuthenticated = Boolean(accessToken);

  const setSession = ({ accessToken: token, userRole: role, profile: sessionProfile }) => {
    if (token) {
      localStorage.setItem('accessToken', token);
      setAccessToken(token);
    }

    if (role) {
      localStorage.setItem('userRole', role);
      setUserRole(role);
    }

    if (sessionProfile) {
      setProfile(sessionProfile);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
    setAccessToken('');
    setUserRole('');
    setProfile(null);
  };

  const fetchProfile = async () => {
    if (!accessToken) return;
    setLoading(true);
    setError('');

    try {
      const response = await authApi.get('/users/me');
      setProfile(response.data.data);
      setUserRole(response.data.data.role || userRole);
    } catch (err) {
      logout();
      setError('Session expired. Please log in again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken && !profile) {
      fetchProfile();
    }
  }, [accessToken]);

  const value = useMemo(
    () => ({
      accessToken,
      userRole,
      profile,
      loading,
      error,
      isAuthenticated,
      setSession,
      logout,
      fetchProfile
    }),
    [accessToken, userRole, profile, loading, error, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
