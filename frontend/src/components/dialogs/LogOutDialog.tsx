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
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface LogOutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogOutDialog({ open, onOpenChange }: LogOutDialogProps) {
  const navigate = useNavigate();
  const notifications = useNotifications();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      sessionStorage.removeItem("email");
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
