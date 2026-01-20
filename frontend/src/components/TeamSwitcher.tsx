import * as React from "react";

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

export function TeamSwitcher({
  teams,
}: Readonly<{
  teams: {
    name: string;
    logo: React.ElementType | string;
    plan: string;
  }[];
}>) {
  const activeTeam = teams[0];

  if (!activeTeam) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div
          className="flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm select-none bg-transparent shadow-none cursor-default"
          tabIndex={-1}
        >
          <div className="text-sidebar-primary-foreground flex aspect-square size-10 items-center justify-center rounded-lg">
            {typeof activeTeam.logo === 'string' ? (
              <img src={activeTeam.logo} alt={activeTeam.name} className="size-10 object-contain" />
            ) : (
              <activeTeam.logo className="size-6" />
            )}
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{activeTeam.name}</span>
            <span className="truncate text-xs">{activeTeam.plan}</span>
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
