import { useEffect } from "react";
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const notifications = useNotifications();

  useEffect(() => {
    document.title = 'CRAI - Login';
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSuccess = (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      login(credentialResponse.credential);
      navigate('/dashboard');
      notifications.success("Logged in successfully!");
    }
  };

  const handleError = () => {
    console.error('Login Failed');
    notifications.error("Login failed. Please try again.");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 mx-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Log In</h1>
          <p className="text-muted-foreground">
            Sign in with your Google account to continue
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              useOneTap={false}
              theme="filled_blue"
              size="large"
              text="signin_with"
              width="384"
            />
          </div>
        </div>

        <Link
          to="/"
          className="block text-center text-sm text-primary hover:underline"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
