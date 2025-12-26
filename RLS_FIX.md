# Fix: Courses Not Showing - RLS Policy Issue

## Problem
Courses exist in the database but the API returns an empty array. This is likely an RLS (Row Level Security) policy issue.

## Solution 1: Verify RLS Policy Exists (Recommended)

Go to your Supabase Dashboard and verify the RLS policy exists:

1. Go to **Authentication** → **Policies** (or **Table Editor** → **courses** → **Policies**)
2. Check if there's a policy named **"Courses are viewable by everyone"**
3. If it doesn't exist, run this SQL in Supabase SQL Editor:

```sql
-- Create policy if it doesn't exist
create policy "Courses are viewable by everyone" on courses
  for select using (true);
```

## Solution 2: Use Service Role Key (Already Applied)

I've updated the server client to use the service role key, which bypasses RLS. Make sure your `.env.local` has:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Solution 3: Temporarily Disable RLS (For Testing Only)

If you want to test without RLS:

```sql
-- WARNING: Only for development/testing
alter table courses disable row level security;
```

Then re-enable it later:

```sql
alter table courses enable row level security;
```

## Verify the Fix

After applying the fix:

1. Restart your dev server (stop with Ctrl+C, then `npm run dev`)
2. Test the API: `curl http://localhost:3000/api/courses`
3. You should see JSON data with 8 courses
4. Refresh your browser - markers should appear!

## Why This Happened

RLS is enabled on the `courses` table, but:
- The policy might not have been created
- Or the anon key doesn't have permission
- Using the service role key bypasses RLS for server-side operations

