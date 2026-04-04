import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/api/authApi";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

export const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { 
    user, 
    isAuthenticated, 
    login: storeLogin, 
    logout: storeLogout,
    updateUser: storeUpdateUser
  } = useAuthStore();

  // Get My Profile
  const useGetProfile = () => {
    return useQuery({
      queryKey: ["profile", user?.userId],
      queryFn: async () => {
        const res = await authApi.getMyProfile();
        return res.data.data;
      },
      enabled: isAuthenticated && !!user?.userId,
    });
  };

  // Login Mutation
  const loginMutation = useMutation({
    mutationFn: ({ email, password }) => authApi.loginUser(email, password),
    onSuccess: (res) => {
      const { user, accessToken, refreshToken } = res.data.data;
      storeLogin({ user, accessToken, refreshToken });
      
      toast.success("Welcome back!");
      
      // Redirect based on role
      if (user.role === 'admin') navigate("/admin/dashboard");
      else if (user.role === 'worker') navigate("/worker/dashboard");
      else if (user.role === 'employer') navigate("/employer/dashboard");
      else if (user.role === 'lawyer') navigate("/legal/dashboard");
      else if (user.role === 'ngo') navigate("/ngo/dashboard");
      else navigate("/");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Login failed");
    },
  });

  // Register Mutation
  const registerMutation = useMutation({
    mutationFn: (formData) => authApi.registerUser(formData),
    onSuccess: (res) => {
      toast.success("Registration successful! Please verify your account.");
      navigate("/verify", { state: { userId: res.data.data.userId } });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Registration failed");
    },
  });

  // Verify OTP Mutation
  const verifyMutation = useMutation({
    mutationFn: ({ userId, code, type }) => authApi.verifyCode(userId, code, type),
    onSuccess: (res) => {
      const { user, accessToken, refreshToken } = res.data.data;
      storeLogin({ user, accessToken, refreshToken });
      toast.success("Account verified successfully!");
      navigate(`/${user.role}/dashboard`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Verification failed");
    },
  });

  // Logout
  const logout = () => {
    storeLogout();
    queryClient.clear();
    toast.info("Logged out successfully");
    navigate("/login");
  };

  // Update Profile
  const updateProfileMutation = useMutation({
    mutationFn: (data) => authApi.updateMyProfile(data),
    onSuccess: (res) => {
      storeUpdateUser(res.data.data);
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries(["profile"]);
    },
  });

  // Change Password
  const changePasswordMutation = useMutation({
    mutationFn: ({ current, next }) => authApi.changePassword(current, next),
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
    login: loginMutation,
    register: registerMutation,
    verify: verifyMutation,
    logout,
    updateProfile: updateProfileMutation,
    changePassword: changePasswordMutation,
  };
};
