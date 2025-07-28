"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { UserProfile } from "@/types"; // Import your type definition

// Define the props this component expects to receive.
// It gets the `profile` data from the server page and the
// tab logic from the parent shell component.
interface UserProfileHeaderProps {
  profile: UserProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function UserProfileHeader({ profile, activeTab, setActiveTab }: UserProfileHeaderProps) {
  const tabs = ["Home", "Portfolio", "Attended"];

  // --- Handle Data Safely ---
  // Combine first and last names. The `.trim()` removes extra spaces if one is missing.
  const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();

  // Provide a default image if the user hasn't uploaded a profile picture.
  // Make sure you have a default image at this path in your `public` folder.
  const avatarUrl = profile.profilePictureUrl || '/images/default-avatar.png';

  // Format the ISO date string from the database into a more readable format.
  const joinedDate = new Date(profile.createdAt).toLocaleString('default', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-center md:items-start w-full gap-4 md:gap-8">
        
        {/* --- Avatar --- */}
        <div className="relative flex-shrink-0">
          <Image
            src={avatarUrl}
            alt={`${fullName || 'User'}'s avatar`}
            width={120}
            height={120}
            className="rounded-full object-cover border-4 border-background bg-gray-300" // bg-gray-300 provides a nice fallback
          />
          <div className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full border-4 border-background flex items-center justify-center">
            <Plus className="w-6 h-6 text-primary-foreground" />
          </div>
        </div>

        {/* --- User Info --- */}
        <div className="flex flex-col items-center md:items-start flex-grow gap-2">
          {/* Display the user's full name, or "New User" if they have none. */}
          <h1 className="text-3xl font-extrabold">{fullName || "New User"}</h1>
          
          {/* Only display the username if it exists. */}
          {profile.username && (
            <p className="text-muted-foreground">@{profile.username}</p>
          )}

          <div className="text-sm text-muted-foreground">
            📅 Joined {joinedDate}
          </div>

          {/* Only display the bio if it exists. */}
          {profile.bio && (
            <p className="mt-2 text-center md:text-left text-sm">{profile.bio}</p>
          )}

          {/* 
            NOTE: Your schema doesn't include stats like Anchors or Followers.
            This section is a placeholder for when you fetch that data later.
          */}
          <div className="flex items-center gap-4 mt-2">
             <div className="text-center md:text-left">
                <span className="font-bold text-lg">25</span>
                <span className="ml-1 text-sm text-muted-foreground">Anchors</span>
            </div>
             <div className="text-center md:text-left">
                <span className="font-bold text-lg">0</span>
                <span className="ml-1 text-sm text-muted-foreground">Followers</span>
            </div>
          </div>

        </div>
      </div>

      {/* --- TABS NAVIGATION --- */}
      {/* This section's logic is driven by props from the parent shell component. */}
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
                    : "border-transparent text-muted-foreground hover:text-primary"
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