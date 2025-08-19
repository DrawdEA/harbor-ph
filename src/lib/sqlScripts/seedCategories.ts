import { createClient } from "@/lib/supabase/client";

const defaultCategories = [
  "Music & Concerts",
  "Sports & Fitness",
  "Food & Drink",
  "Arts & Culture",
  "Technology",
  "Business & Professional",
  "Education & Workshops",
  "Health & Wellness",
  "Entertainment",
  "Community & Social",
  "Outdoor & Adventure",
  "Fashion & Beauty",
  "Science & Innovation",
  "Charity & Fundraising",
  "Family & Kids"
];

export async function seedCategories() {
  const supabase = createClient();
  
  console.log("Seeding categories...");
  
  for (const categoryName of defaultCategories) {
    try {
      const { error } = await supabase
        .from('categories')
        .insert({ name: categoryName })
        .select();
      
      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          console.log(`Category "${categoryName}" already exists, skipping...`);
        } else {
          console.error(`Error inserting category "${categoryName}":`, error);
        }
      } else {
        console.log(`Category "${categoryName}" created successfully`);
      }
    } catch (error) {
      console.error(`Unexpected error for category "${categoryName}":`, error);
    }
  }
  
  console.log("Category seeding completed!");
}

// Run this function if you want to seed categories
// seedCategories().catch(console.error);
