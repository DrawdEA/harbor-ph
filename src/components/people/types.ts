export interface UserProfile {
  id: string;
  username: string;
  email: string | null;
  phone: string | null;
  firstName: string;
  lastName: string;
  profilePictureUrl: string | null;
  bio: string | null;
  updatedAt: string;
  createdAt: string;
}

export interface OrganizationProfile {
  id: string;
  name: string;
  description: string | null;
  websiteUrl: string | null;
  contactEmail: string | null;
  contactNumber: string | null;
  profilePictureUrl: string | null;
  isVerified: boolean;
  updatedAt: string;
  createdAt: string;
}
