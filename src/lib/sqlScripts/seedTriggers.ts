/**
 * Automates the creation of user or organization profiles in the public schema.
 *
 * This script sets up a PostgreSQL trigger and function to synchronize new user
 * sign-ups from Supabase's `auth.users` table to the appropriate profile table:
 * - Personal accounts (accountType = "personal" or missing) → user_profiles
 * - Organization accounts (accountType = "organization") → organization_profiles
 * 
 * This ensures that every authenticated user has a corresponding profile record
 * in the correct table from the moment they are created.
 * 
 * https://supabase.com/docs/guides/auth/managing-user-data
 */

import postgres from "postgres";
import "dotenv/config";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
	throw new Error("Couldn't find db url. Please check your .env file.");
}
const sql = postgres(dbUrl);

async function main() {
	console.log("Setting up database functions and triggers for user profile handling...");

	await sql`
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $$
    DECLARE
      account_type TEXT;
    BEGIN
      -- Extract account type from metadata, default to 'personal'
      account_type := COALESCE(NEW.raw_user_meta_data ->> 'accountType', 'personal');
      
      IF account_type = 'organization' THEN
        -- Create organization profile
        INSERT INTO public.organization_profiles (
          id,
          name,
          description,
          "contactEmail",
          "contactNumber",
          "websiteUrl",
          "createdAt", 
          "updatedAt" 
        )
        VALUES (
          NEW.id,
          NEW.raw_user_meta_data ->> 'organizationName',
          NEW.raw_user_meta_data ->> 'organizationDescription',
          NEW.raw_user_meta_data ->> 'contactEmail',
          NEW.raw_user_meta_data ->> 'contactNumber',
          NEW.raw_user_meta_data ->> 'websiteUrl',
          NOW(), 
          NOW() 
        );
      ELSE
        -- Create user profile (personal account)
        INSERT INTO public.user_profiles (
          id,
          email,
          phone,
          username,
          "firstName",
          "lastName",
          "createdAt", 
          "updatedAt" 
        )
        VALUES (
          NEW.id,
          NEW.email,
          NEW.phone,
          COALESCE(NEW.raw_user_meta_data ->> 'username', NEW.email, NEW.phone),
          NEW.raw_user_meta_data ->> 'firstName',
          NEW.raw_user_meta_data ->> 'lastName',
          NOW(), 
          NOW() 
        );
      END IF;
      
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;
	console.log("-> Function `handle_new_user` created/updated.");

	await sql`
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  `;
	console.log("-> Dropped existing trigger if it existed.");

	await sql`
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  `;
	console.log("-> Trigger `on_auth_user_created` created.");

	console.log("✅ Finished setting up database functions and triggers.");
	process.exit();
}

main().catch((err) => {
	console.error("❌ An error occurred during script execution:", err);
	process.exit(1);
});
