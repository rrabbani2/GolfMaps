// Quick script to check what courses are in the database
// Run with: node scripts/check-courses.js
// Make sure to set environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCourses() {
  console.log('Checking courses in database...\n');
  
  // Get count
  const { count } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true });
  
  console.log(`Total courses in database: ${count}\n`);
  
  // Get all courses
  const { data: courses, error } = await supabase
    .from('courses')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching courses:', error);
    return;
  }
  
  console.log(`Fetched ${courses.length} courses:\n`);
  
  courses.forEach((course, index) => {
    console.log(`${index + 1}. ${course.name}`);
    console.log(`   Address: ${course.address || 'N/A'}, ${course.city || 'N/A'}, ${course.state || 'N/A'}`);
    console.log(`   Coordinates: lat=${course.lat}, lng=${course.lng}`);
    console.log(`   Has valid coords: ${course.lat != null && course.lng != null && !isNaN(Number(course.lat)) && !isNaN(Number(course.lng))}`);
    console.log('');
  });
  
  // Check for the 3 new courses specifically
  const newCourses = ['Shoreline Golf Links', 'Sunnyvale Golf Course', 'Baylands Golf Links'];
  console.log('Checking for new courses:');
  newCourses.forEach(name => {
    const found = courses.find(c => c.name === name);
    if (found) {
      console.log(`✓ Found: ${name}`);
    } else {
      console.log(`✗ Missing: ${name}`);
    }
  });
}

checkCourses().catch(console.error);

