// This file will export all your shared types.

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

// You can add other types here later, like PortfolioEvent, etc.