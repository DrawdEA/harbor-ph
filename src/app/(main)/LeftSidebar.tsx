import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Building } from "lucide-react";

interface Profile {
  firstName?: string;
  lastName?: string;
  username?: string;
  profilePictureUrl?: string;
  accountType?: 'personal' | 'organization';
  name?: string;
}

const Profile = ({ profile }: { profile: Profile }) => {
  // Data handling logic
  const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
  const avatarUrl = profile.profilePictureUrl;
  const getInitials = (name: string): string => {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 0) return 'U';
    const firstInitial = parts[0][0];
    const lastInitial = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };
  const initials = getInitials(fullName);

  return (
    <>
      {avatarUrl ? (
        <div className="w-[100px] h-[100px] rounded-full overflow-hidden border-4 mx-auto border-background bg-gray-300 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <Image
            src={avatarUrl}
            alt={`${fullName || 'User'}'s avatar`}
            width={100}
            height={100}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-[100px] h-[100px] mx-auto rounded-full bg-muted flex items-center justify-center border-4 border-background shadow-lg hover:shadow-xl transition-shadow duration-300">
          <span className="text-4xl  font-bold text-muted-foreground">{initials}</span>
        </div>
      )}
      
      <p className="text-lg font-bold mx-auto mt-4">{fullName || "New User"}</p>
      
      <p className="text-sm text-muted-foreground mx-auto">{`@${profile.username}`}</p>

      <Link href={`/${profile.username}`} className="mt-4 block">
        <Button className="w-full shadow-md hover:shadow-lg transition-shadow duration-300" variant="secondary">View Profile</Button>
      </Link>
      
      {/* Navigation Links for Regular Users - REMOVED (redundant) */}
    </>
  )
}

const OrganizationProfile = ({ profile }: { profile: Profile }) => {
  // Data handling logic for organizations
  const organizationName = profile.name || 'Organization';
  const avatarUrl = profile.profilePictureUrl;
  
  return (
    <>
      {avatarUrl ? (
        <div className="w-[100px] h-[100px] rounded-full overflow-hidden border-4 mx-auto border-background bg-gray-300 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <Image
            src={avatarUrl}
            alt={`${organizationName}'s logo`}
            width={100}
            height={100}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-[100px] h-[100px] mx-auto rounded-full bg-muted flex items-center justify-center border-4 border-background shadow-lg hover:shadow-xl transition-shadow duration-300">
          <Building className="w-8 h-8 text-muted-foreground" />
        </div>
      )}
      
      <p className="text-lg font-bold mx-auto mt-4">{organizationName}</p>

      <Link href={`/organization/${profile.name}`} className="mt-4 block">
        <Button className="w-full shadow-md hover:shadow-lg transition-shadow duration-300" variant="secondary">View Organization</Button>
      </Link>
    </>
  )
}

const LoginPrompt = () => {
  return (
    <>
      <Image
          src="/images/logo.png"  
          alt="Harbor Anchor Logo"
          width={140}
          height={140}
          className="bg-card shadow-lg rounded-full p-4 mx-auto h-[100px] w-[100px] sm:h-[100px] sm:w-[100px]"
      />
      
      <p className="text-sm pt-4 text-muted-foreground font-roboto">Join an Event Now.</p>
      <p className="text-sm text-muted-foreground">Join Harbor.</p>

      <Link href="/auth/register" className="mt-4 block">
        <Button className="w-full" variant="default">Create Account</Button>
      </Link>
    </>
  )
}

export default function LeftSidebar({ profile }: { profile: Profile | null }) {
  console.log('LeftSidebar profile data:', profile);
  console.log('Profile keys:', profile ? Object.keys(profile) : 'No profile');
  console.log('Account type:', profile?.accountType);
  
  // Check if profile is an organization or user
  // Fallback logic: if no accountType, check for organization-specific fields
  const isOrganization = profile && (
    profile.accountType === 'organization' || 
    (profile.name && !profile.firstName && !profile.lastName)
  );
  const isUser = profile && (
    profile.accountType === 'personal' || 
    (profile.firstName && profile.username)
  );
  
  console.log('Is organization:', isOrganization);
  console.log('Is user:', isUser);
  
  return ( 
    <Card className="font-roboto border-muted bg-background flex w-full flex-col overflow-hidden rounded-md border p-0 pt-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-4 text-center break-all">
        {isOrganization ? (
          <OrganizationProfile profile={profile} />
        ) : isUser ? (
          <Profile profile={profile} />
        ) : (
          <LoginPrompt />
        )}
      </CardContent>
    </Card>
  );
}