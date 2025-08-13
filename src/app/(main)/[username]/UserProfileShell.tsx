"use client";

import { useState } from "react";
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
    <div className="bg-background text-foreground min-h-screen">
      <UserProfileHeader 
        profile={profile} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      <main>
        {activeTab === 'Home' && homeContent}
        {activeTab === 'Portfolio' && portfolioContent}
        {/* attended component if needed */}
      </main>
    </div>
  );
}