-- Add three new golf courses to the database
-- Run this in Supabase SQL Editor

INSERT INTO courses (name, address, city, state, country, lat, lng, yardage, slope_rating, course_rating, condition_score, google_place_id) VALUES
  ('Shoreline Golf Links', '1150 N Shoreline Blvd', 'Mountain View', 'CA', 'USA', 37.4220, -122.0841, 6800, 125, 72.0, 8.5, null),
  ('Sunnyvale Golf Course', '605 Macara Ave', 'Sunnyvale', 'CA', 'USA', 37.3689, -122.0361, 6400, 120, 70.5, 8.0, null),
  ('Baylands Golf Links', '1875 Embarcadero Rd', 'Palo Alto', 'CA', 'USA', 37.4572, -122.1094, 7000, 130, 73.5, 9.0, null)
ON CONFLICT DO NOTHING;

-- Add course stats for the new courses
INSERT INTO course_stats (course_id, peak_hours, holiday_factor, base_popularity) 
SELECT 
  id,
  jsonb_build_object(
    'weekday', array['07-10', '15-18'],
    'weekend', array['07-12', '13-17']
  ),
  0.8,
  65 -- Default base popularity
FROM courses
WHERE name IN ('Shoreline Golf Links', 'Sunnyvale Golf Course', 'Baylands Golf Links')
ON CONFLICT (course_id) DO NOTHING;

