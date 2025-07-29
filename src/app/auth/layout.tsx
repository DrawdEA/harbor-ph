import RegisterFooter from "./RegisterFooter";
import Image from "next/image";

// Renamed to AuthLayout for clarity
export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-muted/40 flex min-h-screen flex-col">
            <main className="flex flex-1 flex-col items-center justify-center p-4">
                
                {/* --- SINGLE RESPONSIVE CONTAINER --- */}
                {/* 
                  This is the key: We use one container that changes its style based on screen size.
                  - On mobile (default): It's a transparent container with no border or shadow.
                  - On small screens and up (`sm:`): It becomes a Card with a border, background, and shadow.
                */}
                <div className="w-full max-w-md 
                               sm:border sm:border-muted sm:bg-card sm:shadow-sm sm:rounded-lg">
                    
                    {/* The content inside is always the same for both mobile and desktop */}
                    <div className="flex flex-col content-center items-center gap-4 py-6 px-4">
                        
                        {/* Title */}
                        <h1 className="text-primary font-raleway text-center text-4xl font-extrabold sm:text-3xl">
                            Harbor
                        </h1>
                        
                        {/* Logo */}
                        <Image
                            src="/images/logo.png"
                            alt="Harbor Anchor Logo"
                            width={140}
                            height={140}
                            className="bg-card shadow-lg rounded-full p-4 h-[140px] w-[140px] sm:h-[120px] sm:w-[120px]"
                        />

                        {/* This is where the page content (e.g., login form or 404 page) will be rendered */}
                        <div className="mt-2 w-full flex items-center content-center flex-col">
                            {children}
                        </div>

                    </div>
                </div>
            </main>
            <RegisterFooter />
        </div>
    )
}