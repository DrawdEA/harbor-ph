import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
                                           const { data: organizations, error } = await supabase
              .from('organization_profiles')
              .select(`
                id,
                name,
                description,
                websiteUrl,
                contactEmail,
                contactNumber,
                profilePictureUrl,
                isVerified,
                updatedAt,
                createdAt
              `)
              .order('name');

    if (error) {
      console.error('Error fetching organizations:', error);
      return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 });
    }

    return NextResponse.json({ organizations: organizations || [] });
  } catch (error) {
    console.error('Error in organizations API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
