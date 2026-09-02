import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, BookOpen, History, ShieldCheck, Users } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { API_BASE_URL } from "@/lib/nivox-api";

const items = [
  { title: "Live Analysis", url: "/", icon: Activity },
  { title: "Enrolled Speakers", url: "/speakers", icon: Users },
  { title: "Analysis History", url: "/history", icon: History },
  { title: "About / How It Works", url: "/about", icon: BookOpen },
] as const;

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-1 py-2">
          <span className="shrink-0 rounded-lg bg-primary/10 p-2 text-primary">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight">NIVOX</p>
              <p className="truncate text-xs text-muted-foreground">Voice Defense</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Console</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="size-4" aria-hidden="true" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {!collapsed && (
        <SidebarFooter className="border-t border-sidebar-border">
          <p className="px-2 py-1 font-mono text-[11px] break-all text-muted-foreground">
            API: {API_BASE_URL}
          </p>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
