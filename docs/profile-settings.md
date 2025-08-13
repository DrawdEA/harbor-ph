# Profile & Settings Documentation

## Overview

The profile and settings system allows users to manage their account information, profile pictures, and preferences. The system includes real-time header updates and comprehensive form validation.

## Features Implemented

### 1. Profile Management
- **Edit Profile Form**: Modal form with Zod validation
- **Profile Picture Upload**: Image upload with preview and validation
- **Real-time Updates**: Header refreshes automatically when changes are made
- **Form Validation**: Client-side validation using Zod schema

### 2. Settings Page
- **Card-based Layout**: Consistent design with other pages
- **Profile Settings**: Display and edit user information
- **Account Security**: Placeholder for future features
- **Notifications**: Placeholder for future features
- **Privacy Settings**: Placeholder for future features

### 3. Header Integration
- **Dynamic Refresh**: Header updates when profile changes are made
- **Profile Picture Display**: Shows user's uploaded profile picture
- **Global Refresh Function**: Accessible from any component

## Technical Implementation

### File Structure
```
src/app/(main)/settings/
├── page.tsx                 # Main settings page
├── EditProfileForm.tsx      # Profile editing modal
└── ProfilePictureUpload.tsx # Image upload component

src/components/layout/
└── HeaderLayout.tsx         # Header with refresh functionality
```

### Key Components

#### Settings Page (`page.tsx`)
- Client component with state management
- Fetches user profile data from Supabase
- Integrates profile picture upload
- Handles header refresh on updates

#### Edit Profile Form (`EditProfileForm.tsx`)
- Modal form with Zod validation
- Updates both `user_metadata` and `user_profiles` table
- Real-time character counter for bio
- Success/error feedback

#### Profile Picture Upload (`ProfilePictureUpload.tsx`)
- File validation (type and size)
- Image preview before upload
- Supabase storage integration
- Automatic cleanup of old images

#### Header Layout (`HeaderLayout.tsx`)
- State management for user data
- Global refresh function via `window.refreshHeader`
- Profile picture display in avatar
- Real-time updates when profile changes

### Database Schema

#### User Profile Table
```sql
-- user_profiles table structure
id: string (primary key)
username: string
email: string
phone: string
firstName: string
lastName: string
profilePictureUrl: string | null
bio: string | null
updatedAt: string
createdAt: string
```

#### User Metadata
```typescript
// Supabase auth user_metadata structure
{
  firstName: string
  lastName: string
  username: string
  profilePictureUrl: string | null
}
```

## Setup Requirements

### 1. Supabase Storage Bucket

**Required Bucket**: `avatars`

#### Create the bucket:
```sql
-- In Supabase Dashboard > Storage
-- Create new bucket named "avatars"
-- Set to public
```

#### Storage Policies:
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

### 2. Database Triggers

The system uses existing triggers from `src/lib/sqlScripts/seedTriggers.ts` to sync user metadata with the `user_profiles` table.

## Usage

### Profile Picture Upload
1. User navigates to Settings page
2. Clicks "Choose File" in Profile Picture section
3. Selects image (JPG, PNG, GIF under 5MB)
4. Previews image before upload
5. Clicks "Save Changes" to upload
6. Header automatically refreshes to show new picture

### Edit Profile
1. User clicks "Edit Profile" button
2. Modal form opens with current data
3. User makes changes with real-time validation
4. Clicks "Save Changes" to update
5. Success message appears
6. Header refreshes with new information

## Validation Rules

### Profile Form Validation
- **First Name**: Required, 1-50 characters, letters and spaces only
- **Last Name**: Required, 1-50 characters, letters and spaces only
- **Username**: Required, 3-30 characters, alphanumeric and underscores only
- **Bio**: Optional, max 500 characters

### Profile Picture Validation
- **File Type**: Images only (JPG, PNG, GIF)
- **File Size**: Maximum 5MB
- **Dimensions**: No restrictions (handled by CSS)

## Error Handling

### Common Errors
- **File too large**: "Image size must be less than 5MB"
- **Invalid file type**: "Please select a valid image file"
- **Network errors**: "Failed to upload image"
- **Authentication errors**: "User not authenticated"

### Error Display
- Errors shown in red bordered containers
- Success messages shown in green bordered containers
- Loading states during operations

## To-Do Items

### High Priority
- [ ] **Implement Supabase Storage Bucket**: Create `avatars` bucket with proper policies
- [ ] **Test Profile Picture Upload**: Verify upload functionality works end-to-end
- [ ] **Add Image Optimization**: Implement image resizing/compression
- [ ] **Add Loading States**: Improve UX during upload operations

### Medium Priority
- [ ] **Implement Change Password**: Add password change functionality
- [ ] **Add Two-Factor Authentication**: Implement 2FA setup
- [ ] **Email Notifications**: Add email preference management
- [ ] **Push Notifications**: Add push notification settings

### Low Priority
- [ ] **Profile Picture Cropping**: Add image cropping functionality
- [ ] **Bulk Profile Updates**: Allow updating multiple fields at once
- [ ] **Profile Export**: Allow users to export their data
- [ ] **Account Deletion**: Add account deletion functionality

## Future Enhancements

### Profile Features
- Profile picture cropping and editing
- Multiple profile pictures
- Profile verification badges
- Custom profile themes

### Security Features
- Two-factor authentication
- Login history
- Device management
- Account recovery options

### Privacy Features
- Profile visibility controls
- Data usage preferences
- Privacy policy acceptance
- GDPR compliance tools

## Troubleshooting

### Common Issues

#### Profile Picture Not Showing
1. Check if `avatars` bucket exists in Supabase
2. Verify storage policies are correctly set
3. Check browser console for CORS errors
4. Verify image URL is accessible

#### Header Not Refreshing
1. Check if `window.refreshHeader` function exists
2. Verify component is mounted
3. Check for JavaScript errors in console
4. Ensure Supabase client is properly configured

#### Form Validation Errors
1. Check Zod schema configuration
2. Verify form field names match schema
3. Check for TypeScript compilation errors
4. Ensure all required fields are present

### Debug Commands
```javascript
// Check if refresh function exists
console.log(window.refreshHeader);

// Check current user data
const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();
console.log(user);

// Check profile data
const { data: profile } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('id', user.id)
  .single();
console.log(profile);
```

## Performance Considerations

### Optimizations
- Image compression before upload
- Lazy loading of profile pictures
- Debounced form validation
- Cached user data

### Monitoring
- Track upload success/failure rates
- Monitor storage usage
- Track form completion rates
- Monitor header refresh performance

## Security Considerations

### Data Protection
- Validate all user inputs
- Sanitize file uploads
- Implement proper CORS policies
- Use secure file storage

### Access Control
- Verify user ownership before updates
- Implement rate limiting
- Log security events
- Regular security audits

## Testing

### Manual Testing Checklist
- [ ] Profile picture upload with valid image
- [ ] Profile picture upload with invalid file type
- [ ] Profile picture upload with oversized file
- [ ] Profile picture removal
- [ ] Profile information editing
- [ ] Form validation errors
- [ ] Header refresh after updates
- [ ] Mobile responsiveness
- [ ] Error handling scenarios

### Automated Testing
- Unit tests for validation logic
- Integration tests for Supabase operations
- E2E tests for complete user flows
- Performance tests for upload functionality
