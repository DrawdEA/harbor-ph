import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select(`
        id,
        username,
        email,
        phone,
        firstName,
        lastName,
        profilePictureUrl,
        bio,
        updatedAt,
        createdAt
      `)
      .order('username');

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    return NextResponse.json({ users: users || [] });
  } catch (error) {
    console.error('Error in getAllUsers API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
