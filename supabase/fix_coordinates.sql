-- Fix coordinates if they appear to be swapped
-- This script checks and corrects coordinates that might be in the wrong order

-- First, check current coordinates
SELECT 
  name,
  lat,
  lng,
  CASE 
    WHEN lat < 0 AND lng > 0 THEN 'SWAPPED - needs fixing'
    WHEN lat > 90 OR lng > 180 THEN 'INVALID - out of range'
    WHEN lat BETWEEN 36 AND 38 AND lng BETWEEN -123 AND -121 THEN 'CORRECT - Bay Area'
    ELSE 'CHECK - might be wrong location'
  END as status
FROM courses
ORDER BY name;

-- If you see "SWAPPED" or "INVALID" in the status column, run this to fix them:
-- (Uncomment the UPDATE statement below if needed)

/*
-- Fix swapped coordinates (where lat is negative and lng is positive)
UPDATE courses
SET 
  lat = lng,
  lng = lat
WHERE lat < 0 AND lng > 0;

-- Verify the fix
SELECT name, lat, lng 
FROM courses 
ORDER BY name;
*/

-- Expected coordinates for Bay Area courses:
-- lat should be between 36-38 (positive)
-- lng should be between -123 and -121 (negative)

