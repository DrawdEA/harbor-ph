import { createClient } from '@/lib/supabase/server';

export interface StatusUpdateResult {
  eventId: string;
  oldStatus: string;
  newStatus: string;
  reason: string;
  success: boolean;
  error?: string;
}

export class EventStatusAutomation {
  /**
   * Automatically update event statuses based on time and conditions
   */
  static async runStatusUpdates(): Promise<StatusUpdateResult[]> {
    const supabase = await createClient();
    const results: StatusUpdateResult[] = [];
    
    try {
      // Get only events that can be automatically updated (time-based changes)
      const { data: events, error } = await supabase
        .from('events')
        .select(`
          id,
          title,
          status,
          startTime,
          endTime,
          venues (
            name,
            address,
            city
          ),
          categories_on_events (
            categories (
              id,
              name
            )
          ),
          ticket_types (
            id,
            name,
            price,
            quantity
          )
        `)
        .in('status', ['ACTIVE', 'LIVE'])
        .order('startTime', { ascending: true });
      
      if (error) {
        console.error('Failed to fetch events for status updates:', error);
        return results;
      }
      
      if (!events || events.length === 0) {
        return results;
      }
      
      const now = new Date();
      
      for (const event of events) {
        try {
          const updateResult = await this.updateEventStatusIfNeeded(event, now, supabase);
          results.push(updateResult);
        } catch (error) {
          results.push({
            eventId: event.id,
            oldStatus: event.status,
            newStatus: event.status,
            reason: 'Error during update',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
      
    } catch (error) {
      console.error('Status automation failed:', error);
    }
    
    return results;
  }
  
  /**
   * Check if an event needs a status update and perform it
   */
  private static async updateEventStatusIfNeeded(
    event: any, 
    now: Date, 
    supabase: any
  ): Promise<StatusUpdateResult> {
    const currentStatus = event.status;
    let newStatus = currentStatus;
    let reason = '';
    
    // Only automate time-based status changes
    // DRAFT → PUBLISHED → ACTIVE remain manual (business decisions)
    
    // Check ACTIVE → LIVE (when event actually starts)
    if (currentStatus === 'ACTIVE') {
      if (this.hasStarted(event.startTime, now) && !this.hasEnded(event.endTime, now)) {
        newStatus = 'LIVE';
        reason = 'Event has started';
      }
    }
    
    // Check LIVE → COMPLETED (after end time)
    else if (currentStatus === 'LIVE') {
      if (this.hasEnded(event.endTime, now)) {
        newStatus = 'COMPLETED';
        reason = 'Event has ended';
      }
    }
    
    // If status needs to change, update it
    if (newStatus !== currentStatus) {
      const { error: updateError } = await supabase
        .from('events')
        .update({ 
          status: newStatus,
          updatedAt: now.toISOString()
        })
        .eq('id', event.id);
      
      if (updateError) {
        return {
          eventId: event.id,
          oldStatus: currentStatus,
          newStatus: currentStatus,
          reason: 'Failed to update status',
          success: false,
          error: updateError.message
        };
      }
      
      return {
        eventId: event.id,
        oldStatus: currentStatus,
        newStatus,
        reason,
        success: true
      };
    }
    
    // No status change needed
    return {
      eventId: event.id,
      oldStatus: currentStatus,
      newStatus: currentStatus,
      reason: 'No status change needed',
      success: true
    };
  }
  

  
  /**
   * Check if event has started
   */
  private static hasStarted(startTime: string, now: Date): boolean {
    const eventStart = new Date(startTime);
    return eventStart <= now;
  }
  
  /**
   * Check if event has ended
   */
  private static hasEnded(endTime: string, now: Date): boolean {
    return new Date(endTime) <= now;
  }
}
