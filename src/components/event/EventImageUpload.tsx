"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface EventImageUploadProps {
  currentImageUrl: string | null;
  eventTitle: string;
  onImageUpdate: (newUrl: string | null) => void;
}

export default function EventImageUpload({ 
  currentImageUrl, 
  eventTitle, 
  onImageUpdate 
}: EventImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ensure component only runs on client side
  useEffect(() => {
    setIsClient(true);
    setPreviewUrl(currentImageUrl);
  }, [currentImageUrl]);

  // Don't render until client side to avoid hydration mismatch
  if (!isClient) {
    return (
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Event Image</label>
          <p className="text-sm text-muted-foreground mb-3">
            Choose a JPG, PNG, or GIF file under 10MB
          </p>
          <div className="w-full h-48 rounded-lg bg-muted flex items-center justify-center border-2 border-muted">
            <ImageIcon className="w-16 h-16 text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 10MB for event images)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    setError(null);
    
    // Create preview URL immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Automatically upload the file
    await handleUpload(file);
  };

  const handleUpload = async (file?: File) => {
    const fileToUpload = file || fileInputRef.current?.files?.[0];
    if (!fileToUpload) return;

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
      const fileExt = fileToUpload.name.split('.').pop();
      const fileName = `event-${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `event-images/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars') // Using the same bucket as profile pictures
        .upload(filePath, fileToUpload, {
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

      // Delete old event image if it exists
      if (currentImageUrl && currentImageUrl !== publicUrl) {
        const oldFilePath = currentImageUrl.split('/').pop();
        if (oldFilePath) {
          await supabase.storage
            .from('avatars')
            .remove([`event-images/${oldFilePath}`]);
        }
      }

      setSuccess(true);
      onImageUpdate(publicUrl);
      
      // Reset form
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    setIsUploading(true);
    setError(null);

    try {
      // Delete from storage if exists
      if (currentImageUrl) {
        const supabase = createClient();
        const filePath = currentImageUrl.split('/').pop();
        if (filePath) {
          await supabase.storage
            .from('avatars')
            .remove([`event-images/${filePath}`]);
        }
      }

      setPreviewUrl(null);
      onImageUpdate(null);
      setSuccess(true);
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove image';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };



  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Event Image</label>
        <p className="text-sm text-muted-foreground mb-3">
          Choose a JPG, PNG, or GIF file under 10MB
        </p>
        
        {/* Image Preview */}
        <div className="mb-4">
          {previewUrl ? (
            <div className="w-full h-48 rounded-lg overflow-hidden border-2 border-muted">
              <Image
                src={previewUrl}
                alt={`${eventTitle} event image`}
                width={400}
                height={200}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-48 rounded-lg bg-muted flex items-center justify-center border-2 border-muted">
              <ImageIcon className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
        </div>
        
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
            disabled={isUploading}
          >
            <Upload className="w-4 h-4" />
            {isUploading ? 'Uploading...' : 'Choose Image'}
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



      {/* Messages */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md">
          <p className="text-sm text-green-600">Event image uploaded successfully!</p>
        </div>
      )}
    </div>
  );
}
