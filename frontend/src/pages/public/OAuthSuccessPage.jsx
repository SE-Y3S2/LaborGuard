import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

const OAuthSuccessPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setAuth } = useAuthStore();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const accessToken = params.get("token");
        const refreshToken = params.get("refreshToken");
        const role = params.get("role");
        const userId = params.get("userId");
        const email = params.get("email");

        if (accessToken) {
            setAuth({ id: userId, email, role }, accessToken, refreshToken);
            
            setTimeout(() => {
                if (role === "admin") navigate("/admin/dashboard");
                else if (role === "worker") navigate("/worker/dashboard");
                else if (role === "employer") navigate("/employer/dashboard");
                else if (role === "lawyer") navigate("/legal/dashboard");
                else navigate("/");
            }, 1000);
        } else {
            navigate("/login?error=oauth_failed");
        }
    }, [navigate, location, setAuth]);

    return (
        <div className="auth-wrapper login-bg">
            <div className="auth-card animate-fade-in glass-container text-center py-12">
                <div className="flex justify-center mb-6">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                </div>
                <h2 className="text-2xl font-bold">Authenticating...</h2>
                <p className="text-muted-foreground mt-2">Securely connecting your account to LaborGuard.</p>
            </div>
        </div>
    );
};

export default OAuthSuccessPage;
