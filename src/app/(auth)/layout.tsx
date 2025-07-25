import { Card, CardContent } from "@/components/ui/card";
import RegisterFooter from "./RegisterFooter";
import Image from "next/image";

export default function DashboardLayout({ children, }: { children: React.ReactNode }) {
    return (
        <div className="bg-background flex min-h-screen flex-col">
            <div className="flex flex-1 flex-col items-center justify-center px-2">
                {/* Desktop/tablet: show card */}
                <div className="mt-8 hidden w-full max-w-md sm:block">
                    <Card className="border-muted bg-card border shadow-sm">
                        <CardContent className="py-6">
                            <div className="flex flex-col items-center gap-3 sm:gap-4">
                                <h1 className="text-primary font-raleway mt-1 text-center text-4xl font-extrabold sm:mt-2 sm:text-3xl">
                                    Harbor
                                </h1>
                                <Image
                                    src="/images/logo.png"
                                    alt="Harbor Anchor Logo"
                                    width={140}
                                    height={140}
                                    className="bg-card shadow-lg rounded-full p-4 sm:h-[120px] sm:w-[120px] sm:p-4"
                                />
                                <div className="mt-2 flex w-full flex-col items-center sm:mt-4">
                                    {children}
                                </div>
                            </div>
                            
                        </CardContent>
                    </Card>
                </div>
                {/* Mobile: show content without card */}
                <div className="flex flex-col items-center gap-3 sm:gap-4 sm:hidden">
                    <h1 className="text-primary font-raleway mt-10 text-center text-4xl font-extrabold sm:mt-2 sm:text-3xl">
                        Harbor
                    </h1>
                    <Image
                        src="/images/logo.png"
                        alt="Harbor Anchor Logo"
                        width={140}
                        height={140}
                        className="bg-card shadow-lg rounded-full p-4 sm:h-[120px] sm:w-[120px] sm:p-4"
                    />
                    <div className="mt-2 flex w-full flex-col items-center sm:mt-4">
                        {children}
                    </div>
                </div>
            </div>
            <RegisterFooter />
        </div>
    )
  }