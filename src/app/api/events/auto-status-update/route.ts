import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { EventStatusAutomation } from '@/lib/event-status-automation';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    
    // Check if user is an organization (only orgs can trigger status updates)
    const { data: orgProfile } = await supabase
      .from('organization_profiles')
      .select('id')
      .eq('id', user.id)
      .single();
    
    if (!orgProfile) {
      return NextResponse.json({ error: 'Only organizations can trigger status updates' }, { status: 403 });
    }
    
    // Run automatic status updates
    const results = await EventStatusAutomation.runStatusUpdates();
    
    // Count successful and failed updates
    const successfulUpdates = results.filter(r => r.success && r.oldStatus !== r.newStatus);
    const failedUpdates = results.filter(r => !r.success);
    const noChangeUpdates = results.filter(r => r.success && r.oldStatus === r.newStatus);
    
    return NextResponse.json({
      success: true,
      message: 'Status automation completed',
      summary: {
        totalEvents: results.length,
        statusChanges: successfulUpdates.length,
        failedUpdates: failedUpdates.length,
        noChanges: noChangeUpdates.length
      },
      results: results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Auto status update error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get current event status distribution
    const { data: statusCounts, error } = await supabase
      .from('events')
      .select('status')
      .not('status', 'is', null);
    
    if (error) {
      return NextResponse.json({ error: 'Failed to fetch status counts' }, { status: 500 });
    }
    
    // Count events by status
    const statusDistribution = statusCounts.reduce((acc: any, event: any) => {
      acc[event.status] = (acc[event.status] || 0) + 1;
      return acc;
    }, {});
    
    return NextResponse.json({
      success: true,
      message: 'Current event status distribution',
      statusDistribution,
      totalEvents: statusCounts.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Status distribution error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
