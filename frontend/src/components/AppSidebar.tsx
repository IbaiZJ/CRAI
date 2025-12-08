import * as React from "react";
import { NavUnified } from "@/components/NavUnified";
import { NavUser } from "@/components/NavUser";
import { TeamSwitcher } from "@/components/TeamSwitcher";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";
import { sidebarConfig as data } from "@/constants/sidebarConstants";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavUnified items={data.nav as any} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
