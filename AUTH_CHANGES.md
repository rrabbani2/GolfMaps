# Authentication System Changes

## Summary

The authentication system has been updated to use **username-based login** instead of email. Users now sign in with a username and password, and are redirected to a profile creation page where they must complete their profile with handicap, years of experience, and playing level.

## Changes Made

### 1. Database Schema Updates

**File: `supabase/schema.sql`**

- Added `username` field (unique, required) to `profiles` table
- Added `years_of_experience` field (integer, >= 0) to `profiles` table
- Added index on `username` for faster lookups

**Migration Script: `supabase/migration_add_username.sql`**
- Use this if you need to update an existing database

### 2. TypeScript Types

**File: `lib/types.ts`**

- Updated `Profile` interface to include:
  - `username: string` (required)
  - `years_of_experience?: number` (optional in interface, required in form)

### 3. Authentication Form

**File: `components/AuthForm.tsx`**

**Changes:**
- Replaced email input with username input
- Username validation: 3-20 characters, letters, numbers, and underscores only
- Username uniqueness check before sign-up
- Internal email conversion: `username@golfmaps.local` (Supabase requires email)
- After sign-in: Always redirects to `/profile` for profile completion
- After sign-up: Redirects to `/profile` to create profile

**How it works:**
- User enters username (e.g., "johndoe")
- System converts to internal email: "johndoe@golfmaps.local"
- Supabase auth uses this internal email
- Username is stored in profiles table for display

### 4. Profile Form

**File: `components/ProfileForm.tsx`**

**Changes:**
- Added "Years of Experience" field (required)
- Updated validation to require:
  - Playing Level (Beginner/Intermediate/Advanced)
  - Handicap (0-36)
  - Years of Experience (0-100)
- Updated title to "Complete Your Profile"
- Added helpful descriptions for each field
- Ensures username is preserved when saving profile

**Required Fields:**
1. **Playing Level** - Dropdown: Beginner, Intermediate, Advanced
2. **Handicap** - Number input: 0-36
3. **Years of Experience** - Number input: 0-100

**Optional Fields:**
- Display Name (defaults to username if not provided)

### 5. Authentication Flow

**New User Sign-Up:**
1. User enters username and password
2. System checks if username is available
3. Creates Supabase auth user with internal email
4. Creates profile with username
5. Redirects to `/profile` to complete profile

**Existing User Sign-In:**
1. User enters username and password
2. System looks up username in profiles table
3. Converts username to internal email format
4. Authenticates with Supabase
5. **Always redirects to `/profile`** (user can update profile if needed)

## Database Migration

If you have an existing database, run the migration script:

```sql
-- In Supabase SQL Editor, run:
-- supabase/migration_add_username.sql
```

Or manually:

```sql
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS username text;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS years_of_experience integer 
CHECK (years_of_experience >= 0);

-- Set default usernames for existing users
UPDATE profiles 
SET username = COALESCE(
  LOWER(REGEXP_REPLACE(display_name, '[^a-zA-Z0-9_]', '_', 'g')),
  'user_' || SUBSTR(id::text, 1, 8)
)
WHERE username IS NULL OR username = '';

-- Add constraints
ALTER TABLE profiles 
ALTER COLUMN username SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_idx 
ON profiles (username);
```

## Testing Checklist

- [ ] Sign up with new username
- [ ] Try to sign up with duplicate username (should fail)
- [ ] Sign in with existing username
- [ ] Complete profile with all required fields
- [ ] Verify profile saves correctly
- [ ] Sign in again and verify redirect to profile page
- [ ] Update profile information
- [ ] Verify username validation (special characters, length)

## Important Notes

1. **Username Format**: Only letters, numbers, and underscores. 3-20 characters.
2. **Internal Email**: Supabase still uses email internally (`username@golfmaps.local`), but users never see this.
3. **Profile Completion**: Users must complete their profile (playing level, handicap, years of experience) before using the app.
4. **Username Uniqueness**: Usernames are case-insensitive and must be unique.
5. **Migration**: Existing users will need to have usernames assigned (see migration script).

## Breaking Changes

- **Email-based login removed**: Users can no longer sign in with email
- **Username required**: All profiles must have a username
- **Profile completion required**: Users must complete profile after sign-in

## Future Enhancements

Potential improvements:
- Username availability check in real-time during sign-up
- Password strength indicator
- "Forgot password" functionality (would need email recovery)
- Username change functionality
- Profile picture upload

