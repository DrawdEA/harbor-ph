import postgres from "postgres";
import "dotenv/config";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
	throw new Error("Couldn't find db url. Please check your .env file.");
}
const sql = postgres(dbUrl);

async function main() {
	console.log("Setting up database functions and triggers for user profile handling...");

	// This function is triggered when a new user signs up via Supabase Auth.
	await sql`
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      -- Create a new row in public.user_profiles, populating it with data
      -- available in the new auth.users record.
      INSERT INTO public.user_profiles (
        id,
        email,
        phone,
        username,
        "firstName",
        "lastName"
      )
      VALUES (
        new.id,
        new.email, -- Directly copy the email from the auth record
        new.phone, -- Directly copy the phone from the auth record

        -- For the username, create a robust fallback system:
        -- 1. Use the 'username' from sign-up metadata if provided.
        -- 2. If not, use the user's email.
        -- 3. If email is also not present (e.g., phone-only sign-up), use the phone number.
        -- This ensures the username is always unique and non-null.
        COALESCE(new.raw_user_meta_data ->> 'username', new.email, new.phone),

        -- Get first/last names from metadata if they exist.
        new.raw_user_meta_data ->> 'firstName',
        new.raw_user_meta_data ->> 'lastName'
      );
      RETURN new;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;
	console.log("-> Function `handle_new_user` created/updated.");

	// This trigger executes the function after a new user is created.
	// Dropping it first makes the script safe to re-run.
	await sql`
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
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
