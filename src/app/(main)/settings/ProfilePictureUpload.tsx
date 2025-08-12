"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Upload, X, User } from "lucide-react";
import Image from "next/image";

interface ProfilePictureUploadProps {
  currentProfilePictureUrl: string | null;
  fullName: string;
  onUpdate: (newUrl: string | null) => void;
}

export default function ProfilePictureUpload({ 
  currentProfilePictureUrl, 
  fullName, 
  onUpdate 
}: ProfilePictureUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentProfilePictureUrl);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string): string => {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 0) return 'U';
    const firstInitial = parts[0][0];
    const lastInitial = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setError(null);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { profilePictureUrl: publicUrl }
      });

      if (metadataError) {
        throw metadataError;
      }

      // Update user_profiles table
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ 
          profilePictureUrl: publicUrl,
          updatedAt: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) {
        throw profileError;
      }

      // Delete old profile picture if it exists
      if (currentProfilePictureUrl && currentProfilePictureUrl !== publicUrl) {
        const oldFilePath = currentProfilePictureUrl.split('/').pop();
        if (oldFilePath) {
          await supabase.storage
            .from('avatars')
            .remove([`profile-pictures/${oldFilePath}`]);
        }
      }

      setSuccess(true);
      onUpdate(publicUrl);
      
      // Reset form
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);

    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    setIsUploading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { profilePictureUrl: null }
      });

      if (metadataError) {
        throw metadataError;
      }

      // Update user_profiles table
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ 
          profilePictureUrl: null,
          updatedAt: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) {
        throw profileError;
      }

      // Delete from storage if exists
      if (currentProfilePictureUrl) {
        const filePath = currentProfilePictureUrl.split('/').pop();
        if (filePath) {
          await supabase.storage
            .from('avatars')
            .remove([`profile-pictures/${filePath}`]);
        }
      }

      setPreviewUrl(null);
      onUpdate(null);
      setSuccess(true);
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);

    } catch (err: any) {
      setError(err.message || 'Failed to remove image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setPreviewUrl(currentProfilePictureUrl);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const hasChanges = previewUrl !== currentProfilePictureUrl;

  return (
    <Card className="font-roboto border-muted bg-background flex w-full flex-col overflow-hidden rounded-md border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Profile Picture
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Profile Picture Display */}
        <div className="flex items-center gap-6">
          <div className="relative">
            {previewUrl ? (
              <div className="w-[100px] h-[100px] rounded-full overflow-hidden border-2 border-muted">
                <Image
                  src={previewUrl}
                  alt={`${fullName}'s profile picture`}
                  width={100}
                  height={100}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-[100px] h-[100px] rounded-full bg-muted flex items-center justify-center border-2 border-muted">
                <User className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="font-medium mb-2">Current Picture</h3>
            <p className="text-sm text-muted-foreground">
              {previewUrl ? 'You have a profile picture set' : 'No profile picture set'}
            </p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Upload New Picture</label>
            <p className="text-sm text-muted-foreground mb-3">
              Choose a JPG, PNG, or GIF file under 5MB
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Choose File
              </Button>
              
              {previewUrl && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleRemove}
                  disabled={isUploading}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Remove
                </Button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {hasChanges && (
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {isUploading ? 'Uploading...' : 'Save Changes'}
              </Button>
              
              <Button
                variant="secondary"
                onClick={handleCancel}
                disabled={isUploading}
              >
                Cancel
              </Button>
            </div>
          )}

          {/* Messages */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md">
              <p className="text-sm text-green-600">Profile picture updated successfully!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
