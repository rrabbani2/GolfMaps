# GolfMaps Setup Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.local.example` to `.env.local`
   - Fill in all required API keys

3. **Set up Supabase:**
   - Create a new Supabase project at https://supabase.com
   - Go to SQL Editor and run `supabase/schema.sql`
   - Optionally run `supabase/seed.sql` to add sample courses

4. **Run development server:**
   ```bash
   npm run dev
   ```

## Detailed Setup

### 1. Supabase Setup

1. Create account at https://supabase.com
2. Create a new project
3. Go to Settings > API to get:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`
4. In SQL Editor, run the contents of `supabase/schema.sql`
5. Optionally run `supabase/seed.sql` for sample data

### 2. Mapbox Setup

1. Create account at https://mapbox.com
2. Go to Account > Access tokens
3. Copy your default public token → `NEXT_PUBLIC_MAPBOX_TOKEN`

### 3. Weather API Setup

1. Sign up at https://openweathermap.org/api
2. Get your API key → `WEATHER_API_KEY`

### 4. Google Places API Setup

1. Go to https://console.cloud.google.com
2. Enable Places API
3. Create API key → `GOOGLE_PLACES_API_KEY`
4. (Optional) Restrict the key to Places API only

## Database Schema

The application uses three main tables:

- **profiles**: User profiles with skill level and handicap
- **courses**: Golf course information
- **course_stats**: Course busyness and popularity data

See `supabase/schema.sql` for full schema with RLS policies.

## Troubleshooting

### Map not showing
- Check that `NEXT_PUBLIC_MAPBOX_TOKEN` is set correctly
- Verify Mapbox token has correct permissions

### Authentication not working
- Verify Supabase URL and keys are correct
- Check that RLS policies are set up correctly
- Ensure `profiles` table exists

### Weather data not loading
- Verify `WEATHER_API_KEY` is set
- Check OpenWeatherMap API quota
- Check browser console for errors

### Courses not appearing
- Verify courses are in the database
- Check API route `/api/courses` returns data
- Verify Supabase connection

