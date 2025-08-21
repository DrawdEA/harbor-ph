import { createClient } from '@/lib/supabase/server';

export interface StatusTransitionValidation {
  allowed: boolean;
  requirements?: string[];
  errors?: string[];
  message?: string;
}

export interface EventData {
  id: string;
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  status: string;
  venues?: Array<{
    name?: string;
    address?: string;
    city?: string;
  }> | {
    name?: string;
    address?: string;
    city?: string;
  } | null;
  categories_on_events?: Array<{
    categories: {
      id: string;
      name: string;
    };
  }> | null;
  ticket_types?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }> | null;
}

export class EventStatusValidator {
  static async canTransitionTo(
    event: EventData, 
    newStatus: string
  ): Promise<StatusTransitionValidation> {
    
    const currentStatus = event.status;
    
    // Get transition rules from database
    const supabase = await createClient();
    const { data: transition, error } = await supabase
      .from('event_status_transitions')
      .select('requirements')
      .eq('from_status', currentStatus)
      .eq('to_status', newStatus)
      .single();
    
    if (error || !transition) {
      return { 
        allowed: false, 
        errors: [`Cannot transition from ${currentStatus} to ${newStatus}`],
        message: `Invalid status transition: ${currentStatus} → ${newStatus}`
      };
    }
    
    // Check each requirement
    const requirements = transition.requirements;
    const errors: string[] = [];
    
    // Basic event requirements
    if (requirements.title && (!event.title || event.title.trim().length < 3)) {
      errors.push('Event title must be at least 3 characters long');
    }
    
    if (requirements.description && (!event.description || event.description.trim().length < 10)) {
      errors.push('Event description must be at least 10 characters long');
    }
    
    if (requirements.startTime && !event.startTime) {
      errors.push('Event start time is required');
    }
    
    if (requirements.endTime && !event.endTime) {
      errors.push('Event end time is required');
    }
    
    // Venue requirements
    if (requirements.venue) {
      // Handle both array and single object formats
      const venues = Array.isArray(event.venues) ? event.venues : [event.venues];
      
      if (!venues || venues.length === 0 || !venues[0]) {
        errors.push('Venue information is required');
      } else {
        const venue = venues[0];
        if (!venue.name || !venue.address || !venue.city) {
          errors.push('Venue name, address, and city are required');
        }
      }
    }
    
    // Categories requirements
    if (requirements.categories) {
      if (!event.categories_on_events || event.categories_on_events.length === 0) {
        errors.push('At least one category must be selected');
      }
    }
    
    // Ticket requirements
    if (requirements.ticketsConfigured) {
      if (!event.ticket_types || event.ticket_types.length === 0) {
        errors.push('Ticket types must be configured before activating the event');
      } else {
        // Check if tickets have required fields
        const hasValidTickets = event.ticket_types.every(ticket => 
          ticket.name && ticket.price >= 0 && ticket.quantity > 0
        );
        if (!hasValidTickets) {
          errors.push('All tickets must have name, price, and quantity');
        }
      }
    }
    
    // Date requirements
    if (requirements.futureDate && event.startTime) {
      const eventStart = new Date(event.startTime);
      const now = new Date();
      if (eventStart <= now) {
        errors.push('Event must be in the future to be activated');
      }
    }
    
    if (requirements.withinOneHour && event.startTime) {
      const eventStart = new Date(event.startTime);
      const now = new Date();
      const hoursUntilEvent = (eventStart.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursUntilEvent > 1 || hoursUntilEvent < 0) {
        errors.push('Event can only go live within 1 hour of start time');
      }
    }
    
    if (requirements.notEnded && event.endTime) {
      const eventEnd = new Date(event.endTime);
      const now = new Date();
      if (eventEnd <= now) {
        errors.push('Event has already ended and cannot go live');
      }
    }
    
    if (requirements.eventEnded && event.endTime) {
      const eventEnd = new Date(event.endTime);
      const now = new Date();
      if (eventEnd > now) {
        errors.push('Event has not ended yet and cannot be marked as completed');
      }
    }
    
    // Build user-friendly message
    let message = '';
    if (errors.length === 0) {
      message = `Status change to ${newStatus} is allowed`;
    } else {
      message = `Cannot change status to ${newStatus}. Please fix the following issues:`;
    }
    
    return {
      allowed: errors.length === 0,
      requirements: Object.keys(requirements),
      errors,
      message
    };
  }
  
  // Get all available status transitions for an event
  static async getAvailableTransitions(event: EventData): Promise<string[]> {
    const supabase = await createClient();
    const { data: transitions } = await supabase
      .from('event_status_transitions')
      .select('to_status')
      .eq('from_status', event.status);
    
    if (!transitions) return [];
    
    const availableStatuses: string[] = [];
    
    // Check each potential transition
    for (const transition of transitions) {
      const validation = await this.canTransitionTo(event, transition.to_status);
      if (validation.allowed) {
        availableStatuses.push(transition.to_status);
      }
    }
    
    return availableStatuses;
  }
  
  // Get transition requirements for a specific status change
  static async getTransitionRequirements(
    event: EventData, 
    newStatus: string
  ): Promise<string[]> {
    const supabase = await createClient();
    const { data: transition } = await supabase
      .from('event_status_transitions')
      .select('requirements')
      .eq('from_status', event.status)
      .eq('to_status', newStatus)
      .single();
    
    if (!transition) return [];
    
    return Object.keys(transition.requirements);
  }
}
