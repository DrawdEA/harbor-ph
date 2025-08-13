# Supabase Storage Setup Guide

## Overview

This guide covers the setup required for profile picture uploads in the Harbor PH application.

## Required Setup

### 1. Create Storage Bucket

1. **Navigate to Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Click on "Storage" in the left sidebar

2. **Create New Bucket**
   - Click "Create a new bucket"
   - **Bucket name:** `avatars`
   - **Public bucket:** ✅ Check this option
   - Click "Create bucket"

### 2. Configure Storage Policies

Run the following SQL commands in your Supabase SQL Editor:

```sql
-- Allow authenticated users to upload profile pictures
CREATE POLICY "Users can upload profile pictures" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to profile pictures
CREATE POLICY "Public read access to profile pictures" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Allow users to update their own profile pictures
CREATE POLICY "Users can update their profile pictures" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own profile pictures
CREATE POLICY "Users can delete their profile pictures" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 3. Verify Setup

1. **Test Upload**
   - Go to your application's settings page
   - Try uploading a profile picture
   - Check if the image appears in the header

2. **Check Storage**
   - In Supabase Dashboard > Storage > avars
   - Verify files are being uploaded to the correct folder structure

## Troubleshooting

### Common Issues

#### "Bucket not found" Error
- Ensure the bucket name is exactly `avatars` (lowercase)
- Check that the bucket is created in the correct project

#### "Permission denied" Error
- Verify all storage policies are correctly applied
- Check that the user is authenticated
- Ensure the file path structure matches the policy requirements

#### CORS Errors
- Check browser console for CORS-related errors
- Verify Supabase project settings allow your domain

### Debug Commands

```javascript
// Test bucket access
const { data, error } = await supabase.storage
  .from('avatars')
  .list();

console.log('Bucket contents:', data);
console.log('Error:', error);
```

## File Structure

Profile pictures are stored with the following structure:
```
avatars/
└── profile-pictures/
    └── {userId}-{timestamp}.{extension}
```

Example:
```
avatars/
└── profile-pictures/
    └── 12345678-1703123456789.jpg
```

## Security Notes

- Files are organized by user ID for security
- Users can only access their own files
- Public read access allows profile pictures to be displayed
- File size and type validation is handled client-side

## Next Steps

After completing this setup:
1. Test profile picture upload functionality
2. Verify header refresh works correctly
3. Check mobile responsiveness
4. Monitor storage usage

For more detailed information, see [Profile & Settings Documentation](./profile-settings.md).
