import { Header } from "@/components/layout/Header";
import { Providers } from "./Providers";

export default function MainLayout({ children }: { children: React.ReactNode }) {
	return (
		<Providers>
			<Header />
			{children}
		</Providers>
	);
}
