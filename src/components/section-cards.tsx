import { IconTrendingDown, IconTrendingUp, IconCalendar, IconUsers, IconTicket, IconCurrencyPeso } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface SectionCardsProps {
  totalEvents?: number;
  activeEvents?: number;
  totalAttendees?: number;
  revenueGrowth?: number;
}

export function SectionCards({ 
  totalEvents = 0, 
  activeEvents = 0, 
  totalAttendees = 1250, 
  revenueGrowth = 12.5 
}: SectionCardsProps) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Events</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalEvents}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +{totalEvents > 0 ? '100' : '0'}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Events organized <IconCalendar className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Lifetime events created by your organization
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Live Events</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {activeEvents}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {activeEvents > 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {activeEvents > 0 ? '+' : ''}
              {activeEvents > 0 ? Math.round((activeEvents / Math.max(totalEvents, 1)) * 100) : 0}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Currently accepting registrations <IconTicket className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Published events open for attendees
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Registrations</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalAttendees.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +15.3%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Strong community engagement <IconUsers className="size-4" />
          </div>
          <div className="text-muted-foreground">Attendees across all events</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Event Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ₱45,320
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +{revenueGrowth}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Ticket sales this month <IconCurrencyPeso className="size-4" />
          </div>
          <div className="text-muted-foreground">Total revenue from event tickets</div>
        </CardFooter>
      </Card>
    </div>
  )
}