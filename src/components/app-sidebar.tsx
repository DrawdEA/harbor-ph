"use client"

import * as React from "react"
import {
  IconDashboard,
  IconCalendar,
  IconSettings,
  IconBuilding,
  IconCirclePlusFilled,
} from "@tabler/icons-react"
import { usePathname } from "next/navigation"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useCreateEventModal } from "@/components/event/CreateEventModalContext"

const navMainItems = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: IconDashboard,
  },
  {
    title: "Events",
    url: "/dashboard/events",
    icon: IconCalendar,
  },
]

const navSecondaryItems = [
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: IconSettings,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { openModal } = useCreateEventModal();
  const [orgData, setOrgData] = React.useState<{
    name: string;
    email: string;
    avatar: string | null;
  } | null>(null);

  React.useEffect(() => {
    async function fetchOrgData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: orgProfile } = await supabase
          .from('organization_profiles')
          .select('name, profilePictureUrl')
          .eq('id', user.id)
          .single();

        setOrgData({
          name: orgProfile?.name || "Organization",
          email: user.email || "",
          avatar: orgProfile?.profilePictureUrl || null,
        });
      }
    }
    
    fetchOrgData();
  }, []);

  // Helper function to check if a navigation item is active
  const isActive = (url: string) => {
    if (url === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(url);
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                <IconBuilding className="!size-5" />
                <span className="text-base font-semibold">
                  {orgData?.name || "Harbor Dashboard"}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              <SidebarMenuItem className="flex items-center gap-2">
                <SidebarMenuButton
                  onClick={openModal}
                  tooltip="Create Event"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
                >
                  <IconCirclePlusFilled />
                  <span>Create Event</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <SidebarMenu>
              {navMainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    tooltip={item.title}
                    className={isActive(item.url) ? "bg-accent text-accent-foreground" : ""}
                  >
                    <Link href={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Secondary Navigation (Settings at bottom) */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {navSecondaryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    tooltip={item.title}
                    className={isActive(item.url) ? "bg-accent text-accent-foreground" : ""}
                  >
                    <Link href={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {orgData && <NavUser user={orgData} />}
      </SidebarFooter>
    </Sidebar>
  )
}
