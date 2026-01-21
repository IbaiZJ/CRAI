import * as React from "react";
import { BadgeCheck, Bell, ChevronsUpDown, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { AccountDialog } from "@/components/dialogs/AccountDialog";
import { LogOutDialog } from "@/components/dialogs/LogOutDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { user } = useAuth();
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [isLogOutDialogOpen, setIsLogOutDialogOpen] = useState(false);
  const notifications = useNotifications();

  // Initals for AvatarFallback - memoized
  const initials = React.useMemo(
    () => {
      if (!user?.fullName) return "US";
      return user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "US";
    },
    [user?.fullName]
  );

  if (!user) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.picture || ''} alt={user.fullName} referrerPolicy="no-referrer" />
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium capitalize">{user.fullName}</span>
                <span className="truncate text-xs leading-relaxed">{user.email || ''}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.picture || ''} alt={user.fullName} referrerPolicy="no-referrer" />
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium capitalize">{user.fullName}</span>
                  <span className="truncate text-xs leading-relaxed">{user.email || ''}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            {/* <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup> */}
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setIsAccountDialogOpen(true)}>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              {/* <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem> */}
              <DropdownMenuItem onClick={() => notifications.info("This is a notification")}>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsLogOutDialogOpen(true)} /*className="cursor-pointer"*/>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      <AccountDialog
        open={isAccountDialogOpen}
        onOpenChange={setIsAccountDialogOpen}
        user={{
          name: user.fullName,
          email: user.email ?? "",
          avatar: user.picture ?? "",
        }}
        initials={initials}
        userId={user.sub}
      />

      <LogOutDialog open={isLogOutDialogOpen} onOpenChange={setIsLogOutDialogOpen} />
    </SidebarMenu>
  );
}
