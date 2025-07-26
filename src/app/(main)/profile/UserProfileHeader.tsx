"use client";

import { useState } from "react";
import { Plus, Instagram } from "lucide-react";

// A small, reusable component for each stat item to reduce repetition
const StatItemPlaceholder = () => (
  <div className="flex flex-col md:flex-row items-center md:items-start gap-1">
    <div className="w-8 h-6 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
    <div className="w-20 h-5 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
  </div>
);

export default function UserProfileHeader() {
  const [activeTab, setActiveTab] = useState("Home");
  const tabs = ["Home", "Portfolio", "Attended"];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-center md:items-start w-full gap-4 md:gap-8">
        
        <div className="relative flex-shrink-0">
          <div className="w-[120px] h-[120px] bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full border-4 border-background flex items-center justify-center">
            <Plus className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* User Info & Stats Placeholders */}
        <div className="flex flex-col items-center md:items-start flex-grow gap-2">
          <div className="w-48 h-9 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
          <div className="w-32 h-6 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
          <div className="w-40 h-5 mt-1 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>

          {/* Stats Placeholders */}
          <div className="flex flex-col md:flex-row items-center gap-4 mt-2">
            <StatItemPlaceholder />
            <StatItemPlaceholder />
            <StatItemPlaceholder />
          </div>

          {/* Social Links Placeholder */}
          <div className="flex items-center gap-2 mt-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
            <Instagram className="w-4 h-4 text-gray-400" />
            <div className="w-24 h-5 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* --- TABS NAVIGATION --- */}
      <div className="w-full mt-6 md:mt-8 border-b border-border">
        <div className="flex items-center justify-center md:justify-start -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-semibold border-b-2 transition-colors duration-200
                ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-foreground hover:text-primary"
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}