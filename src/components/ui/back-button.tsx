"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
	className?: string;
}

export function BackButton({ className = "" }: BackButtonProps) {
	const router = useRouter();

	return (
		<Button 
			variant="ghost" 
			size="sm"
			onClick={() => router.back()}
			className={`absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm ${className}`}
		>
			<ArrowLeft className="h-4 w-4" />
		</Button>
	);
}
