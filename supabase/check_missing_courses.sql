-- Check which courses are in the database and verify the 3 new ones
-- Run this in Supabase SQL Editor

-- Count total courses
SELECT COUNT(*) as total_courses FROM courses;

-- List all courses with their coordinates
SELECT 
  name,
  address,
  city,
  lat,
  lng,
  CASE 
    WHEN lat IS NULL OR lng IS NULL THEN 'Missing coordinates'
    WHEN lat = 0 AND lng = 0 THEN 'Zero coordinates'
    ELSE 'Has coordinates'
  END as coordinate_status
FROM courses
ORDER BY name;

-- Check specifically for the 3 new courses
SELECT 
  name,
  address,
  city,
  lat,
  lng
FROM courses
WHERE name IN ('Shoreline Golf Links', 'Sunnyvale Golf Course', 'Baylands Golf Links')
ORDER BY name;

-- If the courses are missing, you can insert them with this:
-- (Uncomment and run if needed)
/*
INSERT INTO courses (name, address, city, state, country, lat, lng, yardage, slope_rating, course_rating, condition_score) VALUES
  ('Shoreline Golf Links', '1150 N Shoreline Blvd', 'Mountain View', 'CA', 'USA', 37.4220, -122.0841, 6800, 125, 72.0, 8.5),
  ('Sunnyvale Golf Course', '605 Macara Ave', 'Sunnyvale', 'CA', 'USA', 37.3689, -122.0361, 6400, 120, 70.5, 8.0),
  ('Baylands Golf Links', '1875 Embarcadero Rd', 'Palo Alto', 'CA', 'USA', 37.4572, -122.1094, 7000, 130, 73.5, 9.0)
ON CONFLICT DO NOTHING;
*/

