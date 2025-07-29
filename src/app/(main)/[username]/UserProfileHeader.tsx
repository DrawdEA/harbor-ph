"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { UserProfile } from "@/types";

interface UserProfileHeaderProps {
  profile: UserProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function UserProfileHeader({ profile, activeTab, setActiveTab }: UserProfileHeaderProps) {
  const tabs = ["Home", "Portfolio", "Attended"];

  // --- Data handling logic (no changes) ---
  const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
  const avatarUrl = profile.profilePictureUrl;
  const joinedDate = new Date(profile.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' });
  const getInitials = (name: string): string => {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 0) return 'U';
    const firstInitial = parts[0][0];
    const lastInitial = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };
  const initials = getInitials(fullName);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center p-4 md:p-6">
      {/* I've cleaned up some minor typos in the class names here for you */}
      <div className="flex flex-col md:flex-row items-center md:items-start w-full gap-4 md:gap-8">
        
        {/* --- Avatar Section (no changes) --- */}
        <div className="relative flex-shrink-0">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={`${fullName || 'User'}'s avatar`}
              width={120}
              height={120}
              className="rounded-full object-cover border-4 border-background bg-gray-300"
            />
          ) : (
            <div className="w-[120px] h-[120px] rounded-full bg-muted flex items-center justify-center border-4 border-background">
              <span className="text-4xl font-bold text-muted-foreground">{initials}</span>
            </div>
          )}
          <div className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full border-4 border-background flex items-center justify-center">
            <Plus className="w-6 h-6 text-primary-foreground" />
          </div>
        </div>

        {/* --- User Info (no changes) --- */}
        <div className="flex flex-col items-center md:items-start flex-grow gap-2">
            <h1 className="text-3xl font-extrabold">{fullName || "New User"}</h1>
            {profile.username && <p className="text-muted-foreground">@{profile.username}</p>}
            <div className="text-sm text-muted-foreground">📅 Joined {joinedDate}</div>
            {profile.bio && <p className="mt-2 text-center md:text-left text-sm">{profile.bio}</p>}
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
      <div className="w-full mt-6 md:mt-8 border-b border-border">
        <div className="flex items-center justify-center md:justify-start -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-semibold border-b-2 transition-colors duration-200
                ${
                  activeTab === tab
                    ? "border-red-600 text-red-600" // ✨ THE FIX IS HERE ✨
                    : "border-transparent text-muted-foreground hover:text-red-600" // Also updated the hover color
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