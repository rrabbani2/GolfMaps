/**
 * Script to geocode all courses in the database
 * Run with: npx tsx scripts/geocode-courses.ts
 * 
 * This will update the lat/lng coordinates for all courses based on their addresses
 */

import { createClient } from '@supabase/supabase-js';
import { geocodeAddress } from '../lib/geocoding';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function geocodeAllCourses() {
  console.log('Fetching all courses from database...');
  
  const { data: courses, error } = await supabase
    .from('courses')
    .select('id, name, address, city, state, country, lat, lng');
  
  if (error) {
    console.error('Error fetching courses:', error);
    process.exit(1);
  }
  
  if (!courses || courses.length === 0) {
    console.log('No courses found in database');
    return;
  }
  
  console.log(`Found ${courses.length} courses. Starting geocoding...\n`);
  
  let updated = 0;
  let failed = 0;
  
  for (const course of courses) {
    // Build full address
    const addressParts = [
      course.address,
      course.city,
      course.state,
      course.country,
    ].filter(Boolean);
    
    const fullAddress = addressParts.join(', ');
    
    if (!fullAddress) {
      console.warn(`⚠️  Skipping ${course.name} - no address`);
      failed++;
      continue;
    }
    
    console.log(`📍 Geocoding: ${course.name}`);
    console.log(`   Address: ${fullAddress}`);
    
    const result = await geocodeAddress(fullAddress);
    
    if (result) {
      console.log(`   ✅ Found: [${result.lng}, ${result.lat}]`);
      console.log(`   Location: ${result.formattedAddress}`);
      
      // Update course in database
      const { error: updateError } = await supabase
        .from('courses')
        .update({
          lat: result.lat,
          lng: result.lng,
        })
        .eq('id', course.id);
      
      if (updateError) {
        console.error(`   ❌ Failed to update: ${updateError.message}`);
        failed++;
      } else {
        console.log(`   ✅ Updated in database\n`);
        updated++;
      }
    } else {
      console.log(`   ❌ Geocoding failed\n`);
      failed++;
    }
    
    // Rate limiting - wait 100ms between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Geocoding complete!`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Total: ${courses.length}`);
}

geocodeAllCourses().catch(console.error);

