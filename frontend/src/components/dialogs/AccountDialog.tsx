import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

interface AccountDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly user: {
    name: string;
    email: string;
    avatar: string;
  };
  readonly initials: string;
  readonly userId?: string;
}

export function AccountDialog({
  open,
  onOpenChange,
  user,
  initials,
  userId,
}: Readonly<AccountDialogProps>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Account Information</DialogTitle>
          <DialogDescription>
            Manage your account settings and preferences.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold capitalize">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <label htmlFor="userId" className="text-sm font-medium">User ID</label>
              <p id="userId" className="text-sm text-muted-foreground">{userId}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
