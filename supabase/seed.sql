-- Sample golf courses (Bay Area)
-- You can add more courses or modify these as needed

insert into courses (name, address, city, state, country, lat, lng, yardage, slope_rating, course_rating, condition_score, google_place_id) values
  ('Pebble Beach Golf Links', '1700 17-Mile Drive', 'Pebble Beach', 'CA', 'USA', 36.5681, -121.9497, 6828, 142, 75.5, 9.5, null),
  ('TPC Harding Park', '99 Harding Rd', 'San Francisco', 'CA', 'USA', 37.7206, -122.4944, 7200, 134, 73.1, 8.5, null),
  ('Presidio Golf Course', '300 Finley Rd', 'San Francisco', 'CA', 'USA', 37.7894, -122.4567, 6400, 125, 71.2, 8.0, null),
  ('Sharp Park Golf Course', 'Hwy 1 & Sharp Park Rd', 'Pacifica', 'CA', 'USA', 37.6167, -122.4833, 6100, 118, 69.5, 7.0, null),
  ('Crystal Springs Golf Course', '6650 Golf Course Dr', 'Burlingame', 'CA', 'USA', 37.5500, -122.3500, 6500, 128, 72.0, 8.2, null),
  ('Poplar Creek Golf Course', '1700 Coyote Point Dr', 'San Mateo', 'CA', 'USA', 37.5833, -122.3167, 6200, 120, 70.5, 7.5, null),
  ('Half Moon Bay Golf Links', '2 Miramontes Point Rd', 'Half Moon Bay', 'CA', 'USA', 37.4500, -122.4333, 6800, 135, 73.8, 9.0, null),
  ('Stanford Golf Course', '91 Links Rd', 'Stanford', 'CA', 'USA', 37.4167, -122.1667, 6600, 130, 72.5, 8.8, null)
on conflict do nothing;

-- Sample course stats
insert into course_stats (course_id, peak_hours, holiday_factor, base_popularity) 
select 
  id,
  jsonb_build_object(
    'weekday', array['07-10', '15-18'],
    'weekend', array['07-12', '13-17']
  ),
  0.8,
  case 
    when name like '%Pebble Beach%' then 95
    when name like '%TPC%' then 85
    when name like '%Presidio%' then 75
    else 60
  end
from courses
on conflict (course_id) do nothing;

