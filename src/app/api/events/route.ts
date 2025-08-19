import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: events, error } = await supabase
      .from('events')
      .select(`
        id,
        title,
        description,
        imageUrl,
        startTime,
        endTime,
        status,
        createdAt,
        organizerId,
        venueId,
        venues (
          name,
          city,
          province,
          country,
          postalCode
        ),
        ticket_types (
          name,
          price,
          quantity,
          availableQuantity
        ),
        categories_on_events (
          categories (
            id,
            name
          )
        )
      `)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching events:', error);
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }

    return NextResponse.json({ events: events || [] });
  } catch (error) {
    console.error('Error in events API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
