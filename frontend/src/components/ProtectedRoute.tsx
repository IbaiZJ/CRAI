import { Navigate } from "react-router-dom";
import { auth } from "../../database/config/firebase";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Verifica si el usuario está autenticado con Firebase
  const isAuthenticated = auth.currentUser !== null;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
