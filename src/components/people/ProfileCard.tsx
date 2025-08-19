import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { IconUser, IconBuilding } from "@tabler/icons-react";
import Link from "next/link";
import { UserProfile, OrganizationProfile } from "./types";

interface ProfileCardProps {
  profile: UserProfile | OrganizationProfile;
}



export default function ProfileCard({ profile }: ProfileCardProps) {
  const isUser = 'username' in profile;
  
  if (isUser) {
    const user = profile as UserProfile;
    return (
      <Link href={`/${user.username}`} className="block">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 flex-shrink-0">
                <AvatarImage 
                  src={user.profilePictureUrl || undefined} 
                  alt={user.username}
                  className="object-cover w-full h-full"
                />
                <AvatarFallback className="bg-muted">
                  {user.profilePictureUrl ? (
                    user.firstName && user.lastName 
                      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
                      : user.username[0].toUpperCase()
                  ) : (
                    <IconUser className="h-6 w-6" />
                  )}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user.username
                    }
                  </h3>
                  <Badge variant="outline" className="text-xs">User</Badge>
                  <Badge variant="secondary" className="text-xs">
                    @{user.username}
                  </Badge>
                </div>
                
                {user.bio && (
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{user.bio}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
           } else {
        const organization = profile as OrganizationProfile;
        return (
          <Link href={`/organization/${organization.name}`} className="block">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 flex-shrink-0">
                <AvatarImage 
                  src={organization.profilePictureUrl || undefined} 
                  alt={organization.name}
                  className="object-cover w-full h-full"
                />
                <AvatarFallback className="bg-muted">
                  {organization.profilePictureUrl ? (
                    organization.name.split(' ').map(word => word[0]).join('').toUpperCase()
                  ) : (
                    <IconBuilding className="h-6 w-6" />
                  )}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{organization.name}</h3>
                  <Badge variant="outline" className="text-xs">Organization</Badge>
                  <Badge variant="secondary" className="text-xs">
                    @{organization.name.toLowerCase().replace(/\s+/g, '')}
                  </Badge>
                  {organization.isVerified && (
                    <Badge variant="default" className="text-xs bg-green-600">
                      Verified
                    </Badge>
                  )}
                </div>
                
                {organization.description && (
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{organization.description}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }
}
