-- Create profiles table
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  username text unique not null,
  display_name text,
  skill_level text check (skill_level in ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
  handicap numeric check (handicap >= 0 and handicap <= 36),
  years_of_experience integer check (years_of_experience >= 0)
);

create index if not exists profiles_id_idx on profiles (id);
create index if not exists profiles_username_idx on profiles (username);

-- Create courses table
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  name text not null,
  address text,
  city text,
  state text,
  country text,
  lat double precision not null,
  lng double precision not null,
  yardage integer,
  slope_rating numeric,
  course_rating numeric,
  condition_score numeric check (condition_score >= 0 and condition_score <= 10),
  google_place_id text,
  image_url text
);

create index if not exists courses_location_idx on courses using gist (point(lng, lat));

-- Create course_stats table
create table if not exists course_stats (
  course_id uuid primary key references courses (id) on delete cascade,
  peak_hours jsonb,
  holiday_factor numeric check (holiday_factor >= 0 and holiday_factor <= 1),
  base_popularity numeric check (base_popularity >= 0 and base_popularity <= 100)
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table courses enable row level security;
alter table course_stats enable row level security;

-- Profiles policies: users can read their own profile and update their own profile
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

-- Courses policies: everyone can read courses
create policy "Courses are viewable by everyone" on courses
  for select using (true);

-- Course stats policies: everyone can read course stats
create policy "Course stats are viewable by everyone" on course_stats
  for select using (true);

