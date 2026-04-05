/**
 * useAuth.js
 *
 * FIXES:
 *  - authApi.getMyProfile()    → authApi.getProfile()
 *  - authApi.loginUser()       → authApi.login()
 *  - authApi.registerUser()    → authApi.register()
 *  - authApi.verifyCode()      → authApi.verifyEmail() / verifySms()
 *  - authApi.updateMyProfile() → authApi.updateProfile()
 *  - login: storeLogin         → setAuth: storeLogin (authStore has setAuth, not login)
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/api/authApi";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

export const useAuth = () => {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();

  // [FIX] authStore has 'setAuth', not 'login' — renamed destructuring key
  const {
    user,
    isAuthenticated,
    setAuth: storeLogin,       // was: login: storeLogin — UNDEFINED CRASH
    logout: storeLogout,
    updateUser: storeUpdateUser
  } = useAuthStore();

  // ── Get My Profile ─────────────────────────────────────────────────────────
  const useGetProfile = () => {
    return useQuery({
      queryKey: ["profile", user?.userId],
      queryFn: async () => {
        // [FIX] was: authApi.getMyProfile() — method does not exist
        const res = await authApi.getProfile();
        return res.data.data;
      },
      enabled: isAuthenticated && !!user?.userId,
    });
  };

  // ── Login ──────────────────────────────────────────────────────────────────
  const loginMutation = useMutation({
    // [FIX] was: authApi.loginUser(email, password) — method does not exist
    mutationFn: ({ email, password }) => authApi.login({ email, password }),
    onSuccess: (res) => {
      const { user, accessToken, refreshToken } = res.data.data;

      // [FIX] storeLogin is now setAuth(user, accessToken, refreshToken)
      storeLogin(user, accessToken, refreshToken);
      toast.success("Welcome back!");

      const roleRoutes = {
        admin         : "/admin/dashboard",
        worker        : "/worker/dashboard",
        employer      : "/employer/dashboard",
        legal_officer : "/legal/dashboard",
        ngo           : "/ngo/dashboard",
      };
      navigate(roleRoutes[user.role] || "/");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Login failed");
    },
  });

  // ── Register ───────────────────────────────────────────────────────────────
  const registerMutation = useMutation({
    // [FIX] was: authApi.registerUser(formData) — method does not exist
    mutationFn: (formData) => authApi.register(formData),
    onSuccess: (res) => {
      toast.success("Registration successful! Please verify your account.");
      navigate("/verify", { state: { userId: res.data.data.userId } });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Registration failed");
    },
  });

  // ── Verify OTP ─────────────────────────────────────────────────────────────
  const verifyMutation = useMutation({
    // [FIX] was: authApi.verifyCode(userId, code, type) — method does not exist
    //       authApi has verifyEmail(userId, code) and verifySms(userId, code)
    mutationFn: ({ userId, code, type }) =>
      type === "sms"
        ? authApi.verifySms(userId, code)
        : authApi.verifyEmail(userId, code),
    onSuccess: (res) => {
      const { user, accessToken, refreshToken } = res.data.data;
      storeLogin(user, accessToken, refreshToken);
      toast.success("Account verified successfully!");
      const roleRoutes = {
        admin         : "/admin/dashboard",
        worker        : "/worker/dashboard",
        employer      : "/employer/dashboard",
        legal_officer : "/legal/dashboard",
        ngo           : "/ngo/dashboard",
      };
      navigate(roleRoutes[user.role] || "/");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Verification failed");
    },
  });

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = () => {
    storeLogout();
    queryClient.clear();
    toast.info("Logged out successfully");
    navigate("/login");
  };

  // ── Update Profile ─────────────────────────────────────────────────────────
  const updateProfileMutation = useMutation({
    // [FIX] was: authApi.updateMyProfile(data) — method does not exist
    mutationFn: (data) => authApi.updateProfile(data),
    onSuccess: (res) => {
      storeUpdateUser(res.data.data);
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries(["profile"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update profile");
    },
  });

  // ── Change Password ────────────────────────────────────────────────────────
  const changePasswordMutation = useMutation({
    // [FIX] authApi.changePassword expects { currentPassword, newPassword }
    mutationFn: ({ current, next }) =>
      authApi.changePassword({ currentPassword: current, newPassword: next }),
    onSuccess: () => {
      toast.success("Password changed successfully");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to change password");
    },
  });

  return {
    user,
    isAuthenticated,
    useGetProfile,
    login          : loginMutation,
    register       : registerMutation,
    verify         : verifyMutation,
    logout,
    updateProfile  : updateProfileMutation,
    changePassword : changePasswordMutation,
  };
};