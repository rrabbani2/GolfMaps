# Geocode Courses Using Addresses

Instead of manually entering coordinates, you can now geocode courses using their addresses!

## Quick Method: Run the Geocoding Script

### Step 1: Make sure you have the required environment variables

Your `.env.local` should have:
```env
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 2: Run the geocoding script

```bash
node scripts/geocode-courses-simple.js
```

This will:
- Fetch all courses from your database
- Geocode each address using Mapbox Geocoding API
- Update the lat/lng coordinates in the database
- Show you the results

### Step 3: Refresh your app

After the script completes:
1. Refresh your browser at `http://localhost:3000`
2. The markers should now be in the correct locations!

## What the Script Does

1. **Reads all courses** from your Supabase database
2. **Builds full addresses** from address, city, state, country fields
3. **Geocodes each address** using Mapbox Geocoding API
4. **Updates coordinates** in the database automatically
5. **Shows progress** and results for each course

## Example Output

```
📍 Fetching courses from database...

Found 8 courses. Starting geocoding...

📍 Pebble Beach Golf Links... ✅ [-121.9497, 36.5681]
📍 TPC Harding Park... ✅ [-122.4944, 37.7206]
📍 Presidio Golf Course... ✅ [-122.4567, 37.7894]
...

✅ Complete! Updated: 8, Failed: 0
```

## Manual Geocoding (Alternative)

If you prefer to geocode individual addresses, you can use the API endpoint:

```bash
curl -X POST http://localhost:3000/api/geocode \
  -H "Content-Type: application/json" \
  -d '{"address": "1700 17-Mile Drive, Pebble Beach, CA, USA"}'
```

Returns:
```json
{
  "lng": -121.9497,
  "lat": 36.5681,
  "formattedAddress": "1700 17-Mile Drive, Pebble Beach, CA 93953, United States"
}
```

## Benefits

✅ **More accurate** - Uses real geocoding services  
✅ **Easier to maintain** - Just update addresses, coordinates update automatically  
✅ **Less error-prone** - No manual coordinate entry  
✅ **Future-proof** - Easy to add new courses

## Troubleshooting

### "Geocoding failed" for some courses
- Check that the address is complete (street, city, state, country)
- Some addresses might need to be more specific
- Try adding "USA" or "United States" to the end

### Rate limiting
- The script includes a 100ms delay between requests
- Mapbox free tier allows 100,000 requests/month
- If you hit limits, wait a bit and try again

### Coordinates still wrong
- Check the browser console for coordinate logs
- Verify the geocoded address matches the actual location
- You can manually update coordinates in Supabase if needed

