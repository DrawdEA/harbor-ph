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
        <h1 className="text-4xl sm:text-3xl text-center font-extrabold text-primary mt-1 sm:mt-2 font-raleway">Harbor</h1>
        {/* Logo */}
        <Image
          src="/window.svg"
          alt="Harbor Anchor Logo"
          width={140}
          height={140}
          className="rounded-full bg-card p-4 sm:w-[120px] sm:h-[120px] sm:p-4"
        />
        {/* Account type prompt and choices (no card/box) */}
        <div className="w-full flex flex-col items-center mt-2 sm:mt-4">
          <div className="text-2xl font-raleway sm:text-lg font-extrabold mb-3 sm:mb-4 text-center text-foreground">Don&apos;t miss the next big thing.<br/>Create an account.</div>
          <Button className="w-9/10 mb-2 sm:text-lg" variant="black">Personal</Button>
          <span className="text-muted-foreground mb-2">or</span>
          <Button className="w-9/10 sm:text-lg">Organization</Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex flex-col items-center justify-center px-2">
        {/* Desktop/tablet: show card */}
        <div className="hidden sm:block w-full max-w-md mt-8">
          <Card className="border border-muted shadow-sm bg-card">
            <CardContent className="py-6">{registrationContent}</CardContent>
          </Card>
        </div>
        {/* Mobile: show content without card */}
        <div className="sm:hidden w-full h-full px-2">{registrationContent}</div>
      </div>
      {/* Footer always at the bottom of available space */}
      <RegisterFooter />
    </div>
  );
} 