import { IconTrendingDown, IconTrendingUp, IconCalendar, IconUsers, IconTicket, IconCurrencyPeso } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface SectionCardsProps {
  totalEvents?: number;
  activeEvents?: number;
  totalRegistrations?: number;
  totalRevenue?: number;
  revenueGrowth?: number;
}

export function SectionCards({ 
  totalEvents = 0, 
  activeEvents = 0, 
  totalRegistrations = 0, 
  totalRevenue = 0,
  revenueGrowth = 0 
}: SectionCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 lg:px-6">
      <Card>
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-primary">{totalEvents}</p>
            </div>
            <IconCalendar className="h-8 w-8 text-primary/60" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              <IconTrendingUp className="h-3 w-3 mr-1" />
              {totalEvents > 0 ? '+100' : '0'}%
            </Badge>
          </div>
          <p className="text-xs text-gray-500 mt-2">Lifetime events created</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Events</p>
              <p className="text-2xl font-bold text-green-600">{activeEvents}</p>
            </div>
            <IconTicket className="h-8 w-8 text-green-600/60" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {activeEvents > 0 ? <IconTrendingUp className="h-3 w-3 mr-1" /> : <IconTrendingDown className="h-3 w-3 mr-1" />}
              {activeEvents > 0 ? '+' : ''}
              {activeEvents > 0 ? Math.round((activeEvents / Math.max(totalEvents, 1)) * 100) : 0}%
            </Badge>
          </div>
          <p className="text-xs text-gray-500 mt-2">Currently accepting registrations</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-purple-600">₱{totalRevenue.toLocaleString()}</p>
            </div>
            <IconCurrencyPeso className="h-8 w-8 text-purple-600/60" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              <IconTrendingUp className="h-3 w-3 mr-1" />
              +{revenueGrowth}%
            </Badge>
          </div>
          <p className="text-xs text-gray-500 mt-2">Revenue from ticket sales</p>
        </CardContent>
      </Card>
    </div>
  )
}