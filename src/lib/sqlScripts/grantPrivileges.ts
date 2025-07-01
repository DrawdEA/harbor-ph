/**
 * This script connects to a Supabase/PostgreSQL database and sets the necessary
 * privileges for standard Supabase roles on the 'public' schema. 
 * It uses transactions to ensure that permission changes are applied atomically.
 * 
 * This is needed because prisma migrate dev and prisma migrate reset clears these GRANTS
 * https://stackoverflow.com/questions/67551593/supabase-client-permission-denied-for-schema-public
 */

import postgres from "postgres";
import "dotenv/config";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
	throw new Error("Couldn't find DATABASE_URL. Please check your .env file.");
}

// Initialize the postgres client
const sql = postgres(dbUrl);

async function main() {
	console.log("🚀 Granting privileges for 'public' schema...");

	await sql.begin(async (sql) => {
		// Grant privileges on all *existing* objects in the public schema.
		await sql`grant all privileges on all tables in schema public to postgres, anon, authenticated, service_role;`;
		await sql`grant all privileges on all functions in schema public to postgres, anon, authenticated, service_role;`;
		await sql`grant all privileges on all sequences in schema public to postgres, anon, authenticated, service_role;`;
		console.log("-> Granted privileges on existing tables, functions, and sequences in 'public'.");

		// Set default privileges for *future* objects created in the public schema.
		await sql`alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;`;
		await sql`alter default privileges in schema public grant all on functions to postgres, anon, authenticated, service_role;`;
		await sql`alter default privileges in schema public grant all on sequences to postgres, anon, authenticated, service_role;`;
		console.log(
			"-> Set default privileges for future tables, functions, and sequences in 'public'.",
		);

		// Grant USAGE on the schema itself, allowing roles to "see" it.
		await sql`grant usage on schema "public" to anon;`;
		await sql`grant usage on schema "public" to authenticated;`;
		console.log("-> Granted usage on schema 'public' to anon and authenticated roles.");
	});

	console.log("✅ Finished granting privileges for the 'public' schema.");
	console.log("\n✨ All privileges granted successfully! ✨");
	process.exit(0); // Exit successfully
}

main().catch((err) => {
	console.error("❌ An error occurred while granting privileges:", err);
	process.exit(1); // Exit with an error code
});
