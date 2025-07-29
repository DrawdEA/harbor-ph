"use client";

import { useState } from "react";

interface UserProfileShellProps {
  header: React.ReactNode;
  homeContent: React.ReactNode;
  portfolioContent: React.ReactNode;
}

export default function UserProfileShell({ header, homeContent, portfolioContent }: UserProfileShellProps) {
  const [activeTab, setActiveTab] = useState("Home");

  const headerWithState = (
    <div onClick={(e) => {
      const target = e.target as HTMLElement;
      const tabName = target.innerText;
      if (['Home', 'Portfolio', 'Attended'].includes(tabName)) {
        console.log(tabName);
        setActiveTab(tabName);
      }
    }}>
      {header}
    </div>
  );

  return (
    <div className="bg-background text-foreground min-h-screen">
      {headerWithState}

      <main>
        {activeTab === 'Home' && homeContent}
        {activeTab === 'Portfolio' && portfolioContent}
        {/* attended component if needed */}
      </main>
    </div>
  );
}