import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log('API: Starting to fetch categories...');
    const supabase = await createClient();
    console.log('API: Supabase client created');
    
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    console.log('API: Query result:', { categories, error });
    
    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
    
    console.log('API: Returning categories:', categories);
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }
    
    const supabase = await createClient();
    const { data: category, error } = await supabase
      .from('categories')
      .insert({ name: name.trim() })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating category:', error);
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ error: 'Category already exists' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
    
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
