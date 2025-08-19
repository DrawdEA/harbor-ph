"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import UserProfileHeader from "./UserProfileHeader";
import { UserProfile } from "@/types";

interface UserProfileShellProps {
  header: React.ReactNode;
  homeContent: React.ReactNode;
  portfolioContent: React.ReactNode;
}

export default function UserProfileShell({ header, homeContent, portfolioContent }: UserProfileShellProps) {
  const [activeTab, setActiveTab] = useState("Home");

  // Extract the profile from the header prop
  const headerElement = header as React.ReactElement<{ profile: UserProfile }>;
  const profile = headerElement.props.profile;

  return (
    <div className="bg-muted/40 text-foreground min-h-screen p-2 sm:p-4 md:p-6 lg:p-8">
      <Card className="w-full max-w-6xl mx-auto">
        <CardContent className="p-0">
          <UserProfileHeader 
            profile={profile} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
          />

          <main className="px-2 sm:px-4 md:px-6 lg:px-8 pb-4 sm:pb-6 md:pb-8">
            {activeTab === 'Home' && homeContent}
            {activeTab === 'Portfolio' && portfolioContent}
            {/* attended component if needed */}
          </main>
        </CardContent>
      </Card>
    </div>
  );
}