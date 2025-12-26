-- Migration script to add username and years_of_experience to existing profiles table
-- Run this in your Supabase SQL Editor if you already have a profiles table

-- Add username column (if it doesn't exist)
alter table profiles 
add column if not exists username text;

-- Add years_of_experience column (if it doesn't exist)
alter table profiles 
add column if not exists years_of_experience integer check (years_of_experience >= 0);

-- Make username unique and not null (after setting values for existing rows)
-- First, set a default username for existing rows based on display_name or id
update profiles 
set username = coalesce(
  lower(regexp_replace(display_name, '[^a-zA-Z0-9_]', '_', 'g')),
  'user_' || substr(id::text, 1, 8)
)
where username is null or username = '';

-- Now add the constraints
alter table profiles 
alter column username set not null;

create unique index if not exists profiles_username_idx on profiles (username);

-- Note: If you have existing users, you may need to update their usernames manually
-- or create a script to generate unique usernames for them

