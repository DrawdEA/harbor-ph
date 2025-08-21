import { createClient } from "@/lib/supabase/server";
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SectionCards } from "@/components/section-cards"
import StatusAutomationWidget from "@/components/StatusAutomationWidget"

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch organization profile
  const { data: orgProfile } = await supabase
    .from('organization_profiles')
    .select('*')
    .eq('id', user?.id)
    .single();

  // Fetch real event stats
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('organizationId', user?.id);

  const totalEvents = events?.length || 0;
  const activeEvents = events?.filter(event => event.status === 'PUBLISHED').length || 0;
  
  // Mock data for demonstration - replace with real data later
  const totalAttendees = 1250;
  const revenueGrowth = 12.5;

  return (
    <>
      {/* Page Header */}
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {orgProfile?.name || 'Organization'}!
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your organization&apos;s performance and events.
          </p>
        </div>
      </div>

      <SectionCards 
        totalEvents={totalEvents}
        activeEvents={activeEvents}
        totalAttendees={totalAttendees}
        revenueGrowth={revenueGrowth}
      />
      <div className="px-4 lg:px-6">
        <StatusAutomationWidget />
        <ChartAreaInteractive />
      </div>
    </>
  )
}