# 🔧 Production Fixes Applied

This document summarizes all the fixes and improvements made to resolve the production API issues.

## ✅ Changes Made

### 1. Enhanced API Route Logging

All API routes now include comprehensive logging to help debug production issues:

- **`/api/courses`** - Added detailed logging for Supabase queries
- **`/api/weather`** - Added logging for cache hits/misses and API calls
- **`/api/busyness`** - Added logging for course lookup, stats, and Google Places API calls

**Benefits:**
- Easy to identify where requests are failing
- Can see exact error messages in PM2 logs
- Tracks API call success/failure rates

### 2. Improved Error Handling

All API routes now:
- Return detailed error messages (in development mode)
- Include error details in response for debugging
- Validate environment variables before use
- Handle edge cases (missing data, invalid parameters)

### 3. Health Check Endpoint

New endpoint: **`/api/health`**

Returns:
- Environment variable status (which keys are configured)
- Database connectivity status
- Overall system health

**Usage:**
```bash
curl http://localhost:3000/api/health
# or
curl http://your-ec2-ip/api/health
```

### 4. Client-Side Error Handling

Improved error handling in `app/page.tsx`:
- Better error logging for failed API calls
- Warns when no courses are found
- More informative console messages

### 5. Production Configuration Files

#### PM2 Ecosystem Config (`ecosystem.config.js`)
- Pre-configured PM2 settings
- Automatic log rotation
- Memory limits
- Auto-restart on crashes

#### Nginx Configuration (`nginx.conf.example`)
- Production-ready reverse proxy setup
- Proper headers for Next.js
- Gzip compression
- Security headers
- Health check endpoint routing

#### Debug Script (`debug-api.sh`)
- Automated API endpoint testing
- Color-coded output
- Tests all endpoints in sequence
- Identifies specific failures

### 6. Comprehensive Deployment Guide

Created `DEPLOYMENT_EC2.md` with:
- Step-by-step deployment instructions
- Troubleshooting section
- Monitoring setup
- Update procedures

## 🚀 Next Steps on EC2

### 1. Pull Latest Changes

```bash
cd ~/golfmaps
git pull
# or if you need to upload files manually, use the new files
```

### 2. Rebuild the Application

```bash
npm run build
```

### 3. Restart PM2

```bash
pm2 restart golfmaps
# or if using ecosystem file:
pm2 delete golfmaps
pm2 start ecosystem.config.js
pm2 save
```

### 4. Test the Health Endpoint

```bash
curl http://localhost:3000/api/health
```

This will show you:
- Which environment variables are missing
- If database connection is working
- Overall system status

### 5. Run Debug Script

```bash
chmod +x debug-api.sh
./debug-api.sh
```

This will test all API endpoints and show you exactly what's working and what's not.

### 6. Check Logs

```bash
# PM2 logs (will show all the new logging)
pm2 logs golfmaps --lines 100

# Nginx logs
sudo tail -f /var/log/nginx/golfmaps-error.log
```

## 🔍 Debugging Production Issues

### Issue: No Course Markers

**Check:**
1. Health endpoint: `curl http://localhost:3000/api/health`
2. Courses endpoint: `curl http://localhost:3000/api/courses`
3. PM2 logs: `pm2 logs golfmaps`
4. Browser console (F12) for client-side errors

**Common Causes:**
- Supabase credentials not set in `.env.local`
- Database has no courses (run seed script)
- RLS policies blocking access

### Issue: Weather Not Loading

**Check:**
1. Health endpoint shows `weatherApiKey: true`
2. Test weather endpoint directly:
   ```bash
   # Get a course ID first
   COURSE_ID=$(curl -s http://localhost:3000/api/courses | jq -r '.[0].id')
   curl "http://localhost:3000/api/weather?courseId=$COURSE_ID"
   ```
3. Check PM2 logs for weather API errors
4. Verify `WEATHER_API_KEY` in `.env.local`

**Common Causes:**
- Missing or invalid `WEATHER_API_KEY`
- EC2 security group blocking outbound HTTPS
- OpenWeatherMap API rate limits

### Issue: Busyness Not Loading

**Check:**
1. Health endpoint shows `googlePlacesKey: true`
2. Test busyness endpoint:
   ```bash
   COURSE_ID=$(curl -s http://localhost:3000/api/courses | jq -r '.[0].id')
   curl "http://localhost:3000/api/busyness?courseId=$COURSE_ID"
   ```
3. Check PM2 logs for Google Places API errors
4. Verify `GOOGLE_PLACES_API_KEY` in `.env.local`

**Common Causes:**
- Missing or invalid `GOOGLE_PLACES_API_KEY`
- Courses missing `google_place_id` field
- Google Places API quota exceeded

## 📋 Environment Variables Checklist

Ensure `.env.local` contains all of these:

```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key
NEXT_PUBLIC_MAPBOX_TOKEN=your_token
WEATHER_API_KEY=your_key
GOOGLE_PLACES_API_KEY=your_key
```

**Important:** After changing `.env.local`, you must:
1. Rebuild: `npm run build`
2. Restart PM2: `pm2 restart golfmaps`

## 🎯 Expected Behavior After Fixes

1. **Health endpoint** returns status of all environment variables
2. **PM2 logs** show detailed information about each API request
3. **Error messages** are more descriptive and helpful
4. **Debug script** can quickly identify issues
5. **All API routes** have proper error handling

## 📝 Files Modified

- `app/api/courses/route.ts` - Added logging and error handling
- `app/api/weather/route.ts` - Added logging and error handling
- `app/api/busyness/route.ts` - Added logging and error handling
- `app/api/health/route.ts` - **NEW** - Health check endpoint
- `app/page.tsx` - Improved client-side error handling
- `ecosystem.config.js` - **NEW** - PM2 configuration
- `nginx.conf.example` - **NEW** - Nginx configuration template
- `debug-api.sh` - **NEW** - Debug script
- `DEPLOYMENT_EC2.md` - **NEW** - Comprehensive deployment guide

## 🔗 Quick Links

- Health Check: `http://your-ec2-ip/api/health`
- Courses API: `http://your-ec2-ip/api/courses`
- Weather API: `http://your-ec2-ip/api/weather?courseId=COURSE_ID`
- Busyness API: `http://your-ec2-ip/api/busyness?courseId=COURSE_ID`

## 💡 Tips

1. **Always check the health endpoint first** - it will tell you what's misconfigured
2. **Use the debug script** - it tests everything automatically
3. **Check PM2 logs regularly** - they now contain detailed information
4. **Monitor Nginx logs** - can reveal proxy issues
5. **Test endpoints directly** - use `curl` to isolate client vs server issues

