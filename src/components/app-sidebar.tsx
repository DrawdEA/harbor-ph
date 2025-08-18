"use client"

import * as React from "react"
import {
  IconChartBar,
  IconDashboard,
  IconCalendar,
  IconSettings,
  IconHelp,
  IconBuilding,
  IconUsers,
  IconFileDescription,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/client"

const data = {
  navMain: [
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
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: IconChartBar,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "/coming-soon",
      icon: IconHelp,
    },
  ],
  documents: [
    {
      name: "Event Reports",
      url: "/dashboard/reports",
      icon: IconFileDescription,
    },
    {
      name: "Attendee Management",
      url: "/dashboard/attendees",
      icon: IconUsers,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [orgData, setOrgData] = React.useState<{
    name: string;
    email: string;
    avatar: string;
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
          avatar: orgProfile?.profilePictureUrl || "",
        });
      }
    }
    
    fetchOrgData();
  }, []);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <IconBuilding className="!size-5" />
                <span className="text-base font-semibold">
                  {orgData?.name || "Harbor Dashboard"}
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {orgData && <NavUser user={orgData} />}
      </SidebarFooter>
    </Sidebar>
  )
}
