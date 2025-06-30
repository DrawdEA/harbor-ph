import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import RegisterFooter from "./RegisterFooter";

export default function Register() {
	// Registration content (shared between desktop and mobile)
	const registrationContent = (
		<>
			<div className="flex flex-col items-center gap-3 sm:gap-4">
				{/* Title */}
				<h1 className="text-primary font-raleway mt-1 text-center text-4xl font-extrabold sm:mt-2 sm:text-3xl">
					Harbor
				</h1>
				{/* Logo */}
				<Image
					src="/window.svg"
					alt="Harbor Anchor Logo"
					width={140}
					height={140}
					className="bg-card rounded-full p-4 sm:h-[120px] sm:w-[120px] sm:p-4"
				/>
				{/* Account type prompt and choices (no card/box) */}
				<div className="mt-2 flex w-full flex-col items-center sm:mt-4">
					<div className="font-raleway text-foreground mb-3 text-center text-2xl font-extrabold sm:mb-4 sm:text-lg">
						Don&apos;t miss the next big thing.
						<br />
						Create an account.
					</div>
					<Button className="mb-2 w-9/10 sm:text-lg" variant="black">
						Personal
					</Button>
					<span className="text-muted-foreground mb-2">or</span>
					<Button className="w-9/10 sm:text-lg">Organization</Button>
				</div>
			</div>
		</>
	);

	return (
		<div className="bg-background flex min-h-screen flex-col">
			<div className="flex flex-1 flex-col items-center justify-center px-2">
				{/* Desktop/tablet: show card */}
				<div className="mt-8 hidden w-full max-w-md sm:block">
					<Card className="border-muted bg-card border shadow-sm">
						<CardContent className="py-6">{registrationContent}</CardContent>
					</Card>
				</div>
				{/* Mobile: show content without card */}
				<div className="h-full w-full px-2 sm:hidden">{registrationContent}</div>
			</div>
			{/* Footer always at the bottom of available space */}
			<RegisterFooter />
		</div>
	);
}
