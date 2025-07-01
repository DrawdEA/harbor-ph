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
    BEGIN
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
        new.id,
        new.email,
        new.phone,
        COALESCE(new.raw_user_meta_data ->> 'username', new.email, new.phone),
        new.raw_user_meta_data ->> 'firstName',
        new.raw_user_meta_data ->> 'lastName',
        NOW(), 
        NOW() 
      );
      RETURN new;
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
