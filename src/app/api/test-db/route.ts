import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('events')
      .select('id')
      .limit(1);
    
    if (testError) {
      return NextResponse.json({
        error: 'Events table connection failed',
        details: testError.message
      }, { status: 500 });
    }
    
    // Test if our new table exists
    const { data: transitionsData, error: transitionsError } = await supabase
      .from('event_status_transitions')
      .select('*')
      .limit(1);
    
    if (transitionsError) {
      return NextResponse.json({
        error: 'Status transitions table not found',
        details: transitionsError.message,
        suggestion: 'Run the SQL commands in Supabase to create the table'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database connection working',
      eventsCount: testData?.length || 0,
      transitionsCount: transitionsData?.length || 0
    });
    
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
