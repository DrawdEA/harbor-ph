"use client";

import ProfilePictureUpload from "@/components/shared/ProfilePictureUpload";

interface ProfilePictureUploadProps {
  currentProfilePictureUrl: string | null;
  fullName: string;
  onUpdate: (newUrl: string | null) => void;
}

export default function UserProfilePictureUpload({ 
  currentProfilePictureUrl, 
  fullName, 
  onUpdate 
}: ProfilePictureUploadProps) {
  return (
    <ProfilePictureUpload
      currentProfilePictureUrl={currentProfilePictureUrl}
      fullName={fullName}
      onUpdate={onUpdate}
      type="user"
      storageBucket="avatars"
      tableName="user_profiles"
    />
  );
}
