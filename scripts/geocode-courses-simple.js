/**
 * Simple script to geocode all courses and update their coordinates
 * Run with: node scripts/geocode-courses-simple.js
 * 
 * Make sure your .env.local has:
 * - NEXT_PUBLIC_MAPBOX_TOKEN
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

if (!mapboxToken) {
  console.error('❌ Missing MAPBOX_TOKEN for geocoding');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function geocodeAddress(address) {
  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${mapboxToken}&limit=1`;
    
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center; // Mapbox returns [lng, lat]
      return { lng, lat, formatted: data.features[0].place_name };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

async function geocodeAllCourses() {
  console.log('📍 Fetching courses from database...\n');
  
  const { data: courses, error } = await supabase
    .from('courses')
    .select('id, name, address, city, state, country, lat, lng');
  
  if (error) {
    console.error('❌ Error fetching courses:', error);
    process.exit(1);
  }
  
  if (!courses || courses.length === 0) {
    console.log('No courses found');
    return;
  }
  
  console.log(`Found ${courses.length} courses. Starting geocoding...\n`);
  
  let updated = 0;
  let failed = 0;
  
  for (const course of courses) {
    const addressParts = [
      course.address,
      course.city,
      course.state,
      course.country,
    ].filter(Boolean);
    
    const fullAddress = addressParts.join(', ');
    
    if (!fullAddress) {
      console.warn(`⚠️  ${course.name}: No address`);
      failed++;
      continue;
    }
    
    process.stdout.write(`📍 ${course.name}... `);
    
    const result = await geocodeAddress(fullAddress);
    
    if (result) {
      const { error: updateError } = await supabase
        .from('courses')
        .update({ lat: result.lat, lng: result.lng })
        .eq('id', course.id);
      
      if (updateError) {
        console.log(`❌ Update failed: ${updateError.message}`);
        failed++;
      } else {
        console.log(`✅ [${result.lng.toFixed(4)}, ${result.lat.toFixed(4)}]`);
        updated++;
      }
    } else {
      console.log(`❌ Geocoding failed`);
      failed++;
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n✅ Complete! Updated: ${updated}, Failed: ${failed}`);
}

geocodeAllCourses().catch(console.error);

