"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { User } from "@supabase/supabase-js";

interface ProfileClientPageProps {
	user: User;
}

export default function ProfileClientPage({ user }: ProfileClientPageProps) {
	const router = useRouter();
	const supabase = createClient();

	const [profileName, setProfileName] = useState(user.user_metadata?.full_name || "");

	const handleLogout = async () => {
		await supabase.auth.signOut();
		router.push("/login");
		router.refresh();
	};

	return (
		<div>
			<h1>PROFILES PAGE (Client Component)</h1>
			<p>Welcome, {user.email}</p>

			<div style={{ margin: "20px 0" }}>
				<label>Profile Name: </label>
				<input
					type="text"
					value={profileName}
					onChange={(e) => setProfileName(e.target.value)}
					style={{ border: "1px solid grey", padding: "4px" }}
				/>
			</div>

			<Button onClick={handleLogout}>Logout</Button>
		</div>
	);
}
