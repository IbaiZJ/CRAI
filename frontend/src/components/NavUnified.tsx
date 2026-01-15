import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { ChevronRight, CopyMinus, CopyPlus, type LucideIcon } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export type UnifiedNavItem = {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  navType?: "button" | "collapsible"
  items?: { title: string; url: string }[]
  actions?: { label: string; icon?: LucideIcon }[]
}

export function NavUnified({ items, label = "Navigation" }: Readonly<{ items: ReadonlyArray<UnifiedNavItem>; label?: string }>) {
  const { isMobile } = useSidebar()
  const location = useLocation()
  
  const [openItems, setOpenItems] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('sidebar-collapsible-state')
    if (!saved) return {}
    try {
      return JSON.parse(saved)
    } catch {
      return {}
    }
  })

  const toggleItem = (title: string, isOpen: boolean) => {
    const newState = { ...openItems, [title]: isOpen }
    setOpenItems(newState)
    localStorage.setItem('sidebar-collapsible-state', JSON.stringify(newState))
  }

  const closeAllTabs = () => {
    setOpenItems({})
    localStorage.setItem('sidebar-collapsible-state', JSON.stringify({}))
  }

  const openAllTabs = () => {
    const allOpen = items.reduce((acc, item) => {
      if (item.navType === "collapsible" && item.items && item.items.length > 0) {
        acc[item.title] = true
      }
      return acc
    }, {} as Record<string, boolean>)
    setOpenItems(allOpen)
    localStorage.setItem('sidebar-collapsible-state', JSON.stringify(allOpen))
  }

  return (
    <SidebarGroup>
      <div className="flex items-center justify-between px-2 py-1">
        <SidebarGroupLabel>{label}</SidebarGroupLabel>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
            onClick={openAllTabs}
            title="Open all tabs"
          >
            <CopyPlus className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
            onClick={closeAllTabs}
            title="Close all tabs"
          >
            <CopyMinus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <SidebarMenu>
        {items.map((item) => {
          const hasChildren = item.items && item.items.length > 0
          const hasActions = item.actions && item.actions.length > 0
          const navType = item.navType || (hasChildren ? "collapsible" : "button")
          const isActive = location.pathname === item.url

          if (navType === "collapsible" && hasChildren) {
            const isOpen = openItems[item.title] ?? item.isActive ?? false
            
            return (
              <SidebarMenuItem key={item.title}>
                <Collapsible
                  open={isOpen}
                  onOpenChange={(open) => toggleItem(item.title, open)}
                  className="group/collapsible"
                >
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => {
                        const isSubItemActive = location.pathname === subItem.url
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild className={isSubItemActive ? "bg-accent" : ""}>
                              <Link to={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
            )
          }

          // Button mode (no children, or navType === "button")
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild className={isActive ? "bg-accent" : ""}>
                <Link to={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
              {hasActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuAction showOnHover>
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">More</span>
                    </SidebarMenuAction>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-48 rounded-lg"
                    side={isMobile ? "bottom" : "right"}
                    align={isMobile ? "end" : "start"}
                  >
                    {item.actions?.map((action, idx) => (
                      <DropdownMenuItem key={`${action.label}-${idx}`}>
                        {action.icon && <action.icon className="text-muted-foreground" />}
                        <span>{action.label}</span>
                      </DropdownMenuItem>
                    ))}
                    {item.actions && item.actions.length > 1 && <DropdownMenuSeparator />}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
