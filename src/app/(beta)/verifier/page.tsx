import GcashBetaClient from "./GcashBetaClient";
import { Toaster } from "@/components/ui/sonner"; 

export default function Page() {
	return (
		<>
			{/* The main client component where the UI and interactions happen */}
			<GcashBetaClient />
			{/* The Toaster component is required to display shadcn/ui toasts (notifications) */}
			<Toaster />
		</>
	);
}
