import { createClient } from "@/lib/supabase/server";
import { SectionCards } from "@/components/section-cards"
import StatusAutomationWidget from "@/components/StatusAutomationWidget"
import { Event } from "@/lib/event-query"

interface TicketType {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  availableQuantity: number;
  salesStartDate?: string;
  salesEndDate?: string;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch organization profile
  const { data: orgProfile } = await supabase
    .from('organization_profiles')
    .select('*')
    .eq('id', user?.id)
    .single();

  // Fetch real event stats with related data
  const { data: events } = await supabase
    .from('events')
    .select(`
      *,
      ticket_types(*)
    `)
    .eq('organizationId', user?.id);

  // Calculate real statistics
  const totalEvents = events?.length || 0;
  const activeEvents = events?.filter(event => event.status === 'ACTIVE').length || 0;
  
  // Calculate total registrations from ticket sales
  const totalRegistrations = events?.reduce((total: number, event: Event) => {
    if (event.ticket_types) {
      return total + event.ticket_types.reduce((eventTotal: number, ticket: TicketType) => {
        return eventTotal + (ticket.quantity - ticket.availableQuantity);
      }, 0);
    }
    return total;
  }, 0) || 0;

  // Calculate total revenue from ticket sales
  const totalRevenue = events?.reduce((total: number, event: Event) => {
    if (event.ticket_types) {
      return total + event.ticket_types.reduce((eventTotal: number, ticket: TicketType) => {
        const soldQuantity = ticket.quantity - ticket.availableQuantity;
        return eventTotal + (soldQuantity * ticket.price);
      }, 0);
    }
    return total;
  }, 0) || 0;

  // Calculate revenue growth (placeholder for now - could be month-over-month)
  const revenueGrowth = totalRevenue > 0 ? 15.2 : 0;

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
        totalRegistrations={totalRegistrations}
        totalRevenue={totalRevenue}
        revenueGrowth={revenueGrowth}
      />
      <div className="px-4 lg:px-6">
        <StatusAutomationWidget />
      </div>
    </>
  )
}