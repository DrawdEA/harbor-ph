export default function RegisterFooter() {
	const currentYear = new Date().getFullYear();

	return (
		<div className="mt-4 mb-4 flex w-full flex-col items-center text-center text-sm">
			<div>Get Updated  ·  List Events  ·  Attend Events</div>
			<div className="text-muted-foreground mt-1 text-xs">
				harbor.sesasi@gmail.com
				<br />
				@harbor.ph
			</div>

			<div className="text-muted-foreground mt-4 text-xs">
				© {currentYear} Harbor. All rights reserved.
			</div>
		</div>
	);
}