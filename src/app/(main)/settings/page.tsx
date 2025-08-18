"use client";

import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, User, Shield, Bell, Key } from "lucide-react";
import { useState, useEffect } from "react";
import { UserProfile } from "@/types";
import EditProfileForm from "./EditProfileForm";
import ProfilePictureUpload from "./ProfilePictureUpload";
import Link from "next/link";

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);

  const fetchProfile = async () => {
    const supabase = createClient();
    
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.log('No user found in settings page');
      return;
    }

    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    setProfile(profileData);
    setIsLoading(false);
  };

  // Function to refresh the header
  const refreshHeader = () => {
    if (typeof window !== 'undefined') {
      const win = window as Window & { refreshHeader?: () => void };
      if (win.refreshHeader) {
        win.refreshHeader();
      }
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleEditClose = () => {
    setShowEditForm(false);
    // Refresh the profile data when the edit form is closed
    fetchProfile();
    // Refresh the header to show updated user data
    refreshHeader();
  };

  const handleProfilePictureUpdate = (newUrl: string | null) => {
    if (profile) {
      setProfile({
        ...profile,
        profilePictureUrl: newUrl
      });
    }
    // Refresh the header to show updated profile picture
    refreshHeader();
  };

  if (isLoading) {
    return (
      <div className="bg-muted/40 min-h-screen">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences.</p>
          </div>
          <div className="animate-pulse">
            <div className="h-64 bg-muted rounded-md mb-6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-muted/40 min-h-screen">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences.</p>
          </div>
          <p>Profile not found.</p>
        </div>
      </div>
    );
  }

  const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();

  return (
    <div className="bg-muted/40 min-h-screen">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences.</p>
        </div>

        <div className="grid gap-6">
          {/* Profile Settings Card */}
          <Card className="font-roboto border-muted bg-background flex w-full flex-col overflow-hidden rounded-md border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <p className="text-foreground font-medium">
                    {profile?.firstName} {profile?.lastName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Username</label>
                  <p className="text-foreground font-medium">@{profile?.username}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-foreground font-medium">{profile?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                  <p className="text-foreground font-medium">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Bio</label>
                <p className="text-foreground mt-1">
                  {profile?.bio || "No bio added yet"}
                </p>
              </div>
              
              <div className="pt-4">
                <Button 
                  variant="secondary" 
                  className="flex items-center gap-2"
                  onClick={() => setShowEditForm(true)}
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Profile Picture Upload Card */}
          <ProfilePictureUpload
            currentProfilePictureUrl={profile.profilePictureUrl}
            fullName={fullName}
            onUpdate={handleProfilePictureUpdate}
          />

          {/* Account Security Card */}
          <Card className="font-roboto border-muted bg-background flex w-full flex-col overflow-hidden rounded-md border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Account Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Password</h3>
                  <p className="text-sm text-muted-foreground">Last changed recently</p>
                </div>
                <Link href="/coming-soon">
                  <Button variant="secondary" size="sm" className="flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Change Password
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Two-Factor Authentication</h3>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Link href="/coming-soon">
                  <Button variant="secondary" size="sm">
                    Enable 2FA
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Card */}
          <Card className="font-roboto border-muted bg-background flex w-full flex-col overflow-hidden rounded-md border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Email Notifications</h3>
                  <p className="text-sm text-muted-foreground">Receive updates about events and activities</p>
                </div>
                <Link href="/coming-soon">
                  <Button variant="secondary" size="sm">
                    Configure
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Push Notifications</h3>
                  <p className="text-sm text-muted-foreground">Get notified about new events and messages</p>
                </div>
                <Link href="/coming-soon">
                  <Button variant="secondary" size="sm">
                    Configure
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Card */}
          <Card className="font-roboto border-muted bg-background flex w-full flex-col overflow-hidden rounded-md border shadow-sm">
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Profile Visibility</h3>
                  <p className="text-sm text-muted-foreground">Control who can see your profile</p>
                </div>
                <Link href="/coming-soon">
                  <Button variant="secondary" size="sm">
                    Manage Privacy
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Data Usage</h3>
                  <p className="text-sm text-muted-foreground">Manage how your data is used</p>
                </div>
                <Link href="/coming-soon">
                  <Button variant="secondary" size="sm">
                    View Settings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Profile Form Modal */}
      {showEditForm && profile && (
        <EditProfileForm 
          profile={profile} 
          onClose={handleEditClose} 
        />
      )}
    </div>
  );
}

