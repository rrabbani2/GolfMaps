[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/tcXJhemk)
# CSE330

Raza Rabbani, rrabbani3, 508936

Test change 2

Approved by Professor Sproull

# Interactive Golf Map — Module 7 Rubric

### **Total: 100 Points**

---

### **5 — Rubric**
- Rubric created, TA-approved, and committed on time.

---

### **5 — Styling**
- **Mapbox GL** for displaying an interactive 2D golf course map.  
- **Tailwind CSS** for responsive, mobile-friendly design.  
- **Custom SCSS Modules + Transitions** for smooth map-card animations and dark/light mode support.

---

### **20 — Languages / Frameworks**
- **10** — Next.js (React framework).  
- **10** — New database system: **Supabase (PostgreSQL + Auth + Realtime)**.

---

### **45 — Functionality**
- Users can easily navigate the 2D map interface - 5
- Users can register, log in, and input their skill level and handicap - 5  
- Golf courses are highlighted and display relevant stats when hovered or clicked - 10 
- Each course card shows localized weather data via a weather API, refreshed every 10 minutes - 5
- A Predicted Busyness Score is generated using peak hours, holidays, and Google Places API - 10
- A Course Fit Rating combines yardage and slope rating, to guide newer golfers toward appropriate courses - 10


---

### **20 — Creative Portion**
- Users are able to create golf groups of up to 4 players and can view other users in the group - 10
- A Course Condition score combines past precipitation, current wind, and current temperature to guide golfers away from undesirable playing conditions - 5
- Users are able to mark their favorite courses which are saved to a separate list for easy reference - 5

Website URL: http://18.223.115.241/

---

## Vercel Deployment

This application is configured for deployment on Vercel (serverless/edge runtime).

### Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. A Supabase project with the database schema set up
3. API keys for:
   - Mapbox (for maps and geocoding)
   - OpenWeatherMap (for weather data)
   - Google Places API (optional, for busyness scores)

### Environment Variables

Configure the following environment variables in your Vercel project settings:

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key
- `NEXT_PUBLIC_MAPBOX_TOKEN` - Your Mapbox access token
- `WEATHER_API_KEY` - Your OpenWeatherMap API key

**Optional:**
- `GOOGLE_PLACES_API_KEY` - Google Places API key (for enhanced busyness scores)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (only if you need admin operations)

### Deployment Steps

1. **Connect your repository to Vercel:**
   - Go to https://vercel.com/new
   - Import your Git repository
   - Vercel will auto-detect Next.js

2. **Configure environment variables:**
   - In the Vercel project settings, go to "Environment Variables"
   - Add all required variables listed above
   - Make sure to set them for Production, Preview, and Development environments

3. **Configure Supabase redirect URLs:**
   - In your Supabase project settings, go to Authentication > URL Configuration
   - Add your Vercel deployment URL to "Redirect URLs"
   - Format: `https://your-project.vercel.app/**`

4. **Deploy:**
   - Vercel will automatically build and deploy on every push to your main branch
   - The build command is: `npm run build`
   - The output directory is: `.next` (auto-detected)

### Build Configuration

- **Build Command:** `npm run build` (default)
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `npm install` (default)
- **Node Version:** 18.x or higher (configured in `package.json`)

### Common Issues and Fixes

**Issue: "Auth session missing" or sign-in not working**
- **Fix:** Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly
- **Fix:** Add your Vercel URL to Supabase redirect URLs (see step 3 above)
- **Fix:** Verify cookies are enabled in browser settings

**Issue: "Weather API key not configured"**
- **Fix:** Add `WEATHER_API_KEY` to Vercel environment variables
- **Fix:** Ensure the variable is set for the correct environment (Production/Preview/Development)

**Issue: Map not loading**
- **Fix:** Verify `NEXT_PUBLIC_MAPBOX_TOKEN` is set correctly
- **Fix:** Check browser console for Mapbox API errors

**Issue: Build fails with "Missing Supabase environment variables"**
- **Fix:** Ensure all `NEXT_PUBLIC_*` variables are set in Vercel
- **Fix:** Redeploy after adding environment variables (they're only available at build time for `NEXT_PUBLIC_*`)

**Issue: Database connection errors**
- **Fix:** Verify Supabase project is active and URL/key are correct
- **Fix:** Check Supabase RLS (Row Level Security) policies allow public access where needed

### Local Development

For local development, create a `.env.local` file with the same environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
WEATHER_API_KEY=your_weather_api_key
GOOGLE_PLACES_API_KEY=your_google_places_key  # optional
```

Then run:
```bash
npm install
npm run dev
```

The app will be available at http://localhost:3000

### Architecture Notes

- **Serverless Functions:** All API routes (`/app/api/**`) run as serverless functions on Vercel
- **Edge Caching:** Weather and busyness endpoints use HTTP cache headers for Vercel edge/CDN caching
- **SSR:** Supabase authentication uses cookie-based SSR via `@supabase/ssr` for proper session handling
- **Client Components:** Map and interactive components are marked with `'use client'` for browser-only execution

### EC2 Deployment (Legacy)

For EC2/self-hosted deployments, see `DEPLOYMENT_EC2.md`. The `ecosystem.config.js` file is for PM2 process management on EC2 only and is not used on Vercel.

