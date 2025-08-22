import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const supabase = await createClient();

		const { data: event, error } = await supabase
			.from('events')
			.select(`
				*,
				venues(*),
				categories_on_events(
					categories(*)
				)
			`)
			.eq('id', id)
			.single();

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		if (!event) {
			return NextResponse.json({ error: 'Event not found' }, { status: 404 });
		}

		return NextResponse.json(event);
	} catch (error) {
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const supabase = await createClient();

		// Check if user is authenticated
		const { data: { user }, error: authError } = await supabase.auth.getUser();
		if (authError || !user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Check if event exists and user owns it
		const { data: event, error: eventError } = await supabase
			.from('events')
			.select('organizerId')
			.eq('id', id)
			.single();

		if (eventError || !event) {
			return NextResponse.json({ error: 'Event not found' }, { status: 404 });
		}

		if (event.organizerId !== user.id) {
			return NextResponse.json({ error: 'Forbidden: You can only delete your own events' }, { status: 403 });
		}

		// Delete the event (this will cascade to related records if foreign key constraints are set up)
		const { error: deleteError } = await supabase
			.from('events')
			.delete()
			.eq('id', id);

		if (deleteError) {
			console.error('Error deleting event:', deleteError);
			return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
		}

		return NextResponse.json({ message: 'Event deleted successfully' });
	} catch (error) {
		console.error('Error in DELETE /api/events/[id]:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
