import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { EventStatusValidator } from '@/lib/event-status-validator';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    
    // Get the request body
    const { newStatus } = await request.json();
    
    if (!newStatus) {
      return NextResponse.json({ error: 'New status is required' }, { status: 400 });
    }
    
    // Get current event to check status and permissions
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('status, organizerId')
      .eq('id', eventId)
      .single();
      
    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    // Check if user is the organizer
    if (event.organizerId !== user.id) {
      return NextResponse.json({ error: 'Not authorized to modify this event' }, { status: 403 });
    }
    
    // Get full event data for smart validation
    const { data: fullEvent, error: fullEventError } = await supabase
      .from('events')
      .select(`
        id,
        title,
        description,
        startTime,
        endTime,
        status,
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
      .eq('id', eventId)
      .single();
      
    if (fullEventError || !fullEvent) {
      return NextResponse.json({ error: 'Failed to get event data for validation' }, { status: 500 });
    }
    
    // Use smart validation service
    const validation = await EventStatusValidator.canTransitionTo(fullEvent, newStatus);
    
    if (!validation.allowed) {
      return NextResponse.json({ 
        error: `Cannot change status to ${newStatus}`,
        details: validation.errors || [],
        message: validation.message
      }, { status: 400 });
    }
    
    // Update the event status
    const { data: updatedEvent, error: updateError } = await supabase
      .from('events')
      .update({ 
        status: newStatus,
        updatedAt: new Date().toISOString()
      })
      .eq('id', eventId)
      .select()
      .single();
      
    if (updateError) {
      console.error('Error updating event status:', updateError);
      return NextResponse.json({ error: 'Failed to update event status' }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: `Event status updated to ${newStatus}`,
      event: updatedEvent
    });
    
  } catch (error) {
    console.error('Error in status update API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
