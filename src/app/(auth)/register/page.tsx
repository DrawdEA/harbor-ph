import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Register() {
	return (
		<>
			<div className="mt-2 flex flex-col items-center sm:mt-4 w-9/10">
				<div className="font-raleway text-foreground mb-3 pb-6 text-center text-2xl font-extrabold sm:mb-4 sm:text-lg">
					Don&apos;t miss the next big thing.
					<br />
					Create an account.
				</div>
				<Link href="/register/personal" className="w-9/10">
					<Button className="mb-2 w-full" variant="black">
						Personal
					</Button>
				</Link>
				<span className="text-muted-foreground mb-2">or</span>
				<Link href="/register/organization" className="w-9/10">
					<Button className="w-full">
						Organization
					</Button>
				</Link>
				
			</div>
		</>
	);
}
