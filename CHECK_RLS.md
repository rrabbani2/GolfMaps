# Check and Fix RLS Policy for Courses

## Step 1: Check if Policy Exists

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **"New query"**
3. Copy and paste this query:

```sql
-- Check if RLS policy exists
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'courses';
```

4. Click **"Run"**

### What to look for:

- **If you see a row** with `policyname = 'Courses are viewable by everyone'` → Policy exists! Skip to Step 3.
- **If you see no rows** → Policy doesn't exist. Go to Step 2.

## Step 2: Create the Policy

If the policy doesn't exist, run this SQL:

```sql
-- Create policy to allow everyone to read courses
CREATE POLICY "Courses are viewable by everyone" ON courses
  FOR SELECT
  USING (true);
```

Click **"Run"**. You should see "Success" message.

## Step 3: Verify RLS is Enabled

Make sure RLS is enabled on the courses table:

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'courses';

-- If rowsecurity is false, enable it:
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
```

## Step 4: Test Your App

After creating/verifying the policy:

1. **Restart your dev server:**
   - Stop it (Ctrl+C)
   - Run `npm run dev` again

2. **Test the API:**
   ```bash
   curl http://localhost:3000/api/courses
   ```
   You should see JSON with 8 courses, not `[]`

3. **Refresh your browser:**
   - Go to `http://localhost:3000`
   - You should now see blue pin markers on the map!

## Quick All-in-One Fix

If you want to just fix it quickly, run this entire script:

```sql
-- Enable RLS (if not already enabled)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists (to recreate it)
DROP POLICY IF EXISTS "Courses are viewable by everyone" ON courses;

-- Create the policy
CREATE POLICY "Courses are viewable by everyone" ON courses
  FOR SELECT
  USING (true);

-- Verify it was created
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'courses';
```

This will:
- Enable RLS on the courses table
- Remove any existing policy with that name
- Create a fresh policy that allows everyone to read courses
- Show you the policy to confirm it exists

## Troubleshooting

### Still seeing empty array?

1. **Check the policy was created:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'courses';
   ```

2. **Check RLS is enabled:**
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'courses';
   ```
   `rowsecurity` should be `true`

3. **Test directly in Supabase:**
   ```sql
   SELECT COUNT(*) FROM courses;
   ```
   Should return `8`

4. **Check your environment variables:**
   Make sure `.env.local` has:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

### Policy exists but still not working?

Try using the service role key instead (see `RLS_FIX.md` for instructions).

