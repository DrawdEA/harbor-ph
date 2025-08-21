import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { EventStatusValidator } from '@/lib/event-status-validator';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { newStatus } = await request.json();
    const { id: eventId } = await params;
    
    if (!newStatus) {
      return NextResponse.json(
        { error: 'New status is required' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // Get the event data
    const { data: event, error: eventError } = await supabase
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
    
    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Validate the status transition
    const validation = await EventStatusValidator.canTransitionTo(event, newStatus);
    
    return NextResponse.json({
      eventId,
      currentStatus: event.status,
      newStatus,
      validation
    });
    
  } catch (error) {
    console.error('Status validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const supabase = await createClient();
    
    // Get the event data
    const { data: event, error: eventError } = await supabase
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
    
    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Debug: Log the event structure
    console.log('Event data structure:', JSON.stringify(event, null, 2));
    
    // Get available transitions
    const availableTransitions = await EventStatusValidator.getAvailableTransitions(event);
    
    return NextResponse.json({
      eventId,
      currentStatus: event.status,
      availableTransitions
    });
    
  } catch (error) {
    console.error('Get transitions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
