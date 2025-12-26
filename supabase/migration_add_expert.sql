-- Migration to add 'Expert' skill level and make handicap/years_of_experience optional
-- Run this in Supabase SQL Editor if you have an existing database

-- Update skill_level constraint to include 'Expert'
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_skill_level_check;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_skill_level_check 
CHECK (skill_level IS NULL OR skill_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert'));

-- Note: handicap and years_of_experience columns remain in the table for backward compatibility
-- but are no longer required. They can be NULL.

