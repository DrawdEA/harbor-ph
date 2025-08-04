import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

const Profile = ({ profile }: { profile: any }) => {
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
        <Image
          src={avatarUrl}
          alt={`${fullName || 'User'}'s avatar`}
          width={120}
          height={120}
          className="rounded-full object-cover border-4 mx-auto border-background bg-gray-300"
        />
      ) : (
        <div className="w-[100px] h-[100px] mx-auto rounded-full bg-muted flex items-center justify-center border-4 border-background">
          <span className="text-4xl  font-bold text-muted-foreground">{initials}</span>
        </div>
      )}
      
      <p className="text-lg font-bold mx-auto mt-4">{fullName || "New User"}</p>
      
      <p className="text-sm text-muted-foreground mx-auto">{`@${profile.username}`}</p>

      <Link href={`/${profile.username}`} className="mt-4 block">
        <Button className="w-full" variant="secondary">View Profile</Button>
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

export default function LeftSidebar({ profile }: { profile: any }) {
  console.log('any profiles?')
  console.log(profile);
  return ( 
    <Card className="font-roboto border-muted bg-background flex w-full flex-col overflow-hidden rounded-md border p-0 shadow-sm">
      <CardContent className="p-4 text-center break-all">
        {profile ? <Profile profile={profile} /> : <LoginPrompt />}
      </CardContent>
    </Card>
  );
}