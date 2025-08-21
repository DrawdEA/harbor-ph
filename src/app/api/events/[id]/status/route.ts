import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return Response.json({ error: 'User not authenticated' }, { status: 401 });
    }
    
    // Get the request body
    const { newStatus } = await request.json();
    
    if (!newStatus) {
      return Response.json({ error: 'New status is required' }, { status: 400 });
    }
    
    // Get current event to check status and permissions
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('status, organizerId')
      .eq('id', params.id)
      .single();
      
    if (eventError || !event) {
      return Response.json({ error: 'Event not found' }, { status: 404 });
    }
    
    // Check if user is the organizer
    if (event.organizerId !== user.id) {
      return Response.json({ error: 'Not authorized to modify this event' }, { status: 403 });
    }
    
    // Validate status transition
    const validTransitions = {
      'DRAFT': ['PUBLISHED', 'CANCELED'],
      'PUBLISHED': ['ACTIVE', 'DRAFT', 'CANCELED'],
      'ACTIVE': ['LIVE', 'COMPLETED', 'CANCELED'],
      'LIVE': ['COMPLETED', 'CANCELED'],
      'COMPLETED': [],
      'CANCELED': ['DRAFT']
    };
    
    const currentStatus = event.status;
    const allowedTransitions = validTransitions[currentStatus as keyof typeof validTransitions] || [];
    
    if (!allowedTransitions.includes(newStatus)) {
      return Response.json({ 
        error: `Invalid status transition from ${currentStatus} to ${newStatus}` 
      }, { status: 400 });
    }
    
    // Update the event status
    const { data: updatedEvent, error: updateError } = await supabase
      .from('events')
      .update({ 
        status: newStatus,
        updatedAt: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();
      
    if (updateError) {
      console.error('Error updating event status:', updateError);
      return Response.json({ error: 'Failed to update event status' }, { status: 500 });
    }
    
    return Response.json(updatedEvent);
    
  } catch (error) {
    console.error('Error in status update API:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
