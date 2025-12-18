import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/contexts/AuthContext";

interface LogOutDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function LogOutDialog({ open, onOpenChange }: Readonly<LogOutDialogProps>) {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const { logout } = useAuth();

  const handleLogout = () => {
    try {
      logout();
      navigate("/login");
      notifications.success("Logged out successfully");
    } catch (error) {
      console.error("Error during logout:", error);
      notifications.error("Failed to log out");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
          <AlertDialogDescription>
            You will be redirected to the login page and will need to sign in again to access your account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => handleLogout()}>Log Out</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
