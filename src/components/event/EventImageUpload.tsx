"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image as ImageIcon, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

// Default placeholder image for events without custom images
const DEFAULT_EVENT_IMAGE = "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80";

interface EventImageUploadProps {
  currentImageUrl: string | null;
  eventTitle: string;
  onImageUpdate: (imageUrl: string | null) => void;
}

export default function EventImageUpload({ currentImageUrl, eventTitle, onImageUpdate }: EventImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const supabase = createClient();
      
      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `event-${eventTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${timestamp}.${fileExtension}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update parent component
      onImageUpdate(publicUrl);
      setUploadProgress(100);
      
      // Reset progress after a moment
      setTimeout(() => setUploadProgress(0), 1000);

    } catch (error) {
      console.error('Error uploading image:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    onImageUpdate(null);
  };

  // Determine what image to show
  const displayImageUrl = currentImageUrl || DEFAULT_EVENT_IMAGE;
  const isDefaultImage = !currentImageUrl;

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Event Image</Label>
      
      {/* Image Display */}
      <div className="relative">
        <div className="relative h-48 w-full overflow-hidden rounded-lg border">
          <Image
            src={displayImageUrl}
            alt={isDefaultImage ? "Default event image" : eventTitle}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Overlay for default image */}
          {isDefaultImage && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="text-center text-white">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-80" />
                <p className="text-sm font-medium">Default Event Image</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Remove button - only show when user has uploaded an image */}
        {currentImageUrl && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Upload Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isUploading}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => document.querySelector('input[type="file"]')?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? 'Uploading...' : 'Choose File'}
          </Button>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        {/* Help Text */}
        <p className="text-xs text-muted-foreground">
          Supported formats: JPG, PNG, GIF. Max size: 5MB. 
          {!currentImageUrl && ' Upload an image to make your event more attractive!'}
        </p>
      </div>
    </div>
  );
}
