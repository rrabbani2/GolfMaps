-- Check if RLS policy exists for courses table
-- Run this in Supabase SQL Editor to see if the policy exists

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'courses';

-- If the above query returns no rows, the policy doesn't exist
-- Run the following to create it:

-- Create policy to allow everyone to read courses
-- (Only run this if the policy doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'courses' 
    AND policyname = 'Courses are viewable by everyone'
  ) THEN
    CREATE POLICY "Courses are viewable by everyone" ON courses
      FOR SELECT
      USING (true);
    RAISE NOTICE 'Policy created successfully';
  ELSE
    RAISE NOTICE 'Policy already exists';
  END IF;
END $$;

