"use client";

import Image from "next/image";
import { Plus, Edit } from "lucide-react";
import { UserProfile } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface UserProfileHeaderProps {
  profile: UserProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function UserProfileHeader({ profile, activeTab, setActiveTab }: UserProfileHeaderProps) {
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const router = useRouter();
  const tabs = ["Home", "Portfolio", "Attended"];

  // Get current user on component mount
  useEffect(() => {
    const getCurrentUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      // Check if this is the user's own profile
      if (user && profile.id === user.id) {
        setIsOwnProfile(true);
      }
    };

    getCurrentUser();
  }, [profile.id]);

  // Data handling logic
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

  const handleEditProfile = () => {
    router.push("/settings");
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-center md:items-start w-full gap-4 md:gap-8">
        
        {/* --- Avatar Section --- */}
        <div className="relative flex-shrink-0">
          {avatarUrl ? (
            <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-4 border-background bg-gray-300">
              <Image
                src={avatarUrl}
                alt={`${fullName || 'User'}'s avatar`}
                width={120}
                height={120}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-[120px] h-[120px] rounded-full bg-muted flex items-center justify-center border-4 border-background">
              <span className="text-4xl font-bold text-muted-foreground">{initials}</span>
            </div>
          )}

          {/* Only show plus button if it's not the user's own profile */}
          {!isOwnProfile && (
            <div className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full border-4 border-background flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
              <Plus className="w-6 h-6 text-primary-foreground" />
            </div>
          )}
        </div>

        {/* --- User Info --- */}
        <div className="flex flex-col items-center md:items-start flex-grow gap-2">
            <div className="flex flex-col items-center md:items-start">
              <div className="flex flex-col md:flex-row items-center md:items-center gap-4">
                <h1 className="text-3xl font-extrabold">{fullName || "New User"}</h1>
                
                {/* Edit Profile Button - only show if it's the user's own profile */}
                {isOwnProfile && (
                  <Button 
                    onClick={handleEditProfile}
                    variant="secondary" 
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </Button>
                )}
              </div>
              
              {profile.username && <p className="text-muted-foreground">@{profile.username}</p>}
            </div>
            
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
              className={`px-4 py-3 font-semibold transition-colors duration-200
                ${
                  activeTab === tab
                    ? "border-b-2 border-primary text-primary"
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