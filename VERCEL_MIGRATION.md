# Vercel Migration Summary

This document summarizes the changes made to migrate GolfMaps from EC2 to Vercel deployment.

## Changes Made

### 1. Supabase SSR Integration
- **Added:** `@supabase/ssr` package dependency
- **Created:** `lib/supabase/client.ts` - Browser client using `@supabase/ssr`
- **Created:** `lib/supabase/server.ts` - Server client with cookie-based auth using Next.js `cookies()`
- **Updated:** All route handlers now use `createClient()` from `@/lib/supabase/server`
- **Updated:** All client components now use `createClient()` from `@/lib/supabase/client`
- **Maintained:** Backward compatibility via deprecated wrapper files (`lib/supabaseClient.ts`, `lib/supabaseServer.ts`)

### 2. Environment Variables
- **Verified:** All client-safe variables use `NEXT_PUBLIC_` prefix:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_MAPBOX_TOKEN`
- **Verified:** Server-only variables are never exposed:
  - `WEATHER_API_KEY`
  - `GOOGLE_PLACES_API_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

### 3. Route Handlers
- **Verified:** All API routes use proper `NextResponse.json()` with error handling
- **Verified:** Weather and busyness routes include HTTP cache headers for Vercel edge/CDN caching
- **Verified:** All routes use Node.js runtime (default, no edge runtime specified)
- **Removed:** Unused import (`createCacheKey`) from weather route

### 4. Caching Strategy
- **Implemented:** HTTP cache headers instead of in-memory caching:
  - Weather: `Cache-Control: public, s-maxage=600, stale-while-revalidate=600`
  - Busyness: `Cache-Control: public, s-maxage=300, stale-while-revalidate=300`
- **Deprecated:** In-memory cache in `lib/weather.ts` (kept for backward compatibility but not used)

### 5. Package Configuration
- **Updated:** `package.json`:
  - Added `@supabase/ssr` dependency
  - Added `engines.node: ">=18.0.0"`
  - Verified scripts: `dev`, `build`, `start` are correct

### 6. Build Configuration
- **Verified:** `next.config.mjs` is Vercel-compatible
- **Verified:** No custom server entrypoint exists
- **Verified:** No PM2 or custom port configuration in code

### 7. Client Components
- **Verified:** `components/Map.tsx` has `'use client'` directive
- **Verified:** Mapbox token accessed only in client components
- **Verified:** No server-side imports of `mapbox-gl`

### 8. Documentation
- **Updated:** `README.md` with comprehensive Vercel deployment instructions
- **Updated:** `ecosystem.config.js` with note that it's EC2-only

## Files Changed

### New Files
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `VERCEL_MIGRATION.md` (this file)

### Modified Files
- `package.json` - Added dependency and engines
- `app/api/weather/route.ts` - Removed unused import
- `components/AuthForm.tsx` - Updated to use new client
- `components/ProfileForm.tsx` - Updated to use new client
- `app/page.tsx` - Updated to use new client
- `README.md` - Added Vercel deployment section
- `ecosystem.config.js` - Added EC2-only note

### Unchanged (Backward Compatible)
- `lib/supabaseClient.ts` - Deprecated wrapper (still works)
- `lib/supabaseServer.ts` - Deprecated wrapper (still works)
- All route handlers were already using the correct imports

## Testing Checklist

Before deploying to Vercel, verify:

- [ ] `npm run build` succeeds locally
- [ ] `npm run start` works locally
- [ ] Sign in/sign up works
- [ ] Profile page loads and updates correctly
- [ ] Courses load from API
- [ ] Weather data displays on course cards
- [ ] Busyness scores display correctly
- [ ] Map loads with markers
- [ ] Groups functionality works

## Deployment Notes

1. **Install dependencies:** Run `npm install` to install `@supabase/ssr`
2. **Set environment variables:** Configure all required vars in Vercel dashboard
3. **Configure Supabase:** Add Vercel URL to Supabase redirect URLs
4. **Deploy:** Push to main branch or use Vercel CLI

## Architecture Decisions

- **No middleware:** Auth is handled via Supabase client-side and server-side clients, no Next.js middleware needed
- **Node.js runtime:** All API routes use default Node.js runtime (not edge) for compatibility with external APIs
- **HTTP caching:** Using Vercel edge/CDN caching via headers instead of in-memory cache for serverless compatibility
- **Cookie-based auth:** Using `@supabase/ssr` with Next.js `cookies()` for proper SSR session handling

