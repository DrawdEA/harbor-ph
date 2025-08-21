"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Play, BarChart3 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StatusDistribution {
  [key: string]: number;
}

interface StatusUpdateResult {
  eventId: string;
  oldStatus: string;
  newStatus: string;
  reason: string;
  success: boolean;
  error?: string;
}

interface AutomationSummary {
  totalEvents: number;
  statusChanges: number;
  failedUpdates: number;
  noChanges: number;
}

export default function StatusAutomationWidget() {
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isRunningAutomation, setIsRunningAutomation] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [automationResults, setAutomationResults] = useState<StatusUpdateResult[]>([]);
  const [automationSummary, setAutomationSummary] = useState<AutomationSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch current status distribution
  const fetchStatusDistribution = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/events/auto-status-update');
      if (response.ok) {
        const data = await response.json();
        setStatusDistribution(data.statusDistribution);
        setLastUpdate(new Date());
      } else {
        throw new Error('Failed to fetch status distribution');
      }
    } catch (error) {
      setError('Failed to load status distribution');
      console.error('Error fetching status distribution:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Run automatic status updates
  const runStatusAutomation = async () => {
    setIsRunningAutomation(true);
    setError(null);
    
    try {
      const response = await fetch('/api/events/auto-status-update', {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        setAutomationResults(data.results);
        setAutomationSummary(data.summary);
        setLastUpdate(new Date());
        
        // Refresh status distribution after automation
        await fetchStatusDistribution();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Automation failed');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Automation failed');
      console.error('Error running status automation:', error);
    } finally {
      setIsRunningAutomation(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchStatusDistribution();
  }, []);

  // Get status color for badges
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'PUBLISHED': return 'bg-blue-100 text-blue-800';
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'LIVE': return 'bg-orange-100 text-orange-800';
      case 'COMPLETED': return 'bg-purple-100 text-purple-800';
      case 'CANCELED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status display name
  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Draft';
      case 'PUBLISHED': return 'Published';
      case 'ACTIVE': return 'Active';
      case 'LIVE': return 'Live';
      case 'COMPLETED': return 'Completed';
      case 'CANCELED': return 'Canceled';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Distribution Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-sm font-medium">Event Status Overview</CardTitle>
            <CardDescription>
              Current distribution of your events by status
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStatusDistribution}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(statusDistribution).map(([status, count]) => (
                <div key={status} className="text-center">
                  <Badge className={`${getStatusColor(status)} mb-2`}>
                    {getStatusDisplayName(status)}
                  </Badge>
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-xs text-muted-foreground">events</div>
                </div>
              ))}
            </div>
          )}
          
          {lastUpdate && (
            <div className="text-xs text-muted-foreground mt-4 text-center">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Automation Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Status Automation
          </CardTitle>
          <CardDescription>
            Automatically update time-based event statuses (ACTIVE → LIVE when event starts, LIVE → COMPLETED when event ends)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={runStatusAutomation}
            disabled={isRunningAutomation}
            className="w-full"
          >
            {isRunningAutomation ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Running Automation...
              </>
            ) : (
                          <>
              <Play className="h-4 w-4 mr-2" />
              Run Time-Based Updates
            </>
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {automationSummary && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-sm">Automation Results</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Events:</span>
                  <span className="ml-2 font-medium">{automationSummary.totalEvents}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status Changes:</span>
                  <span className="ml-2 font-medium text-green-600">{automationSummary.statusChanges}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Failed Updates:</span>
                  <span className="ml-2 font-medium text-red-600">{automationSummary.failedUpdates}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">No Changes:</span>
                  <span className="ml-2 font-medium text-muted-foreground">{automationSummary.noChanges}</span>
                </div>
              </div>
            </div>
          )}

          {automationResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Recent Updates</h4>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {automationResults
                  .filter(result => result.oldStatus !== result.newStatus)
                  .slice(0, 5)
                  .map((result, index) => (
                    <div key={index} className="text-xs bg-muted/30 rounded p-2">
                      <div className="font-medium">{result.reason}</div>
                      <div className="text-muted-foreground">
                        {result.oldStatus} → {result.newStatus}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
