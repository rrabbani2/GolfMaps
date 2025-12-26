import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { calculateCourseFit } from '@/lib/calculateCourseFit';

export async function GET() {
  try {
    console.log('[API /courses] Starting request...');
    
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('[API /courses] Missing Supabase environment variables');
      return NextResponse.json(
        { error: 'Server configuration error: Missing Supabase credentials' },
        { status: 500 }
      );
    }

    const supabase = await createServerClient();
    console.log('[API /courses] Supabase client created');
    
    // Disable caching for this route to ensure fresh data
    const headers = {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    };

    // First, let's check the total count
    const { count } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true });
    
    console.log(`[API /courses] Total courses in database: ${count}`);

    const { data: courses, error } = await supabase
      .from('courses')
      .select('*')
      .order('name');

    if (error) {
      console.error('[API /courses] Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch courses', details: error.message },
        { status: 500 }
      );
    }

    // Log all course names for debugging
    if (courses && courses.length > 0) {
      console.log(`[API /courses] Fetched ${courses.length} courses:`, courses.map(c => c.name).join(', '));
    } else {
      console.warn('[API /courses] No courses returned from query');
    }

    // Filter out courses with invalid coordinates (but log them for debugging)
    const validCourses = (courses || []).filter(course => {
      const hasValidCoords = course.lat != null && course.lng != null && 
                            !isNaN(Number(course.lat)) && !isNaN(Number(course.lng));
      if (!hasValidCoords) {
        console.warn(`[API /courses] Skipping course "${course.name}" - missing or invalid coordinates (lat: ${course.lat}, lng: ${course.lng})`);
      }
      return hasValidCoords;
    });

    console.log(`[API /courses] Returning ${validCourses.length} courses with valid coordinates`);
    
    // Calculate fit score for each course and add it to the response
    const coursesWithFitScore = validCourses.map(course => {
      let fitScore = 0;
      
      // Only calculate if both slope and yardage are available
      if (course.slope_rating != null && course.yardage != null) {
        fitScore = calculateCourseFit(
          course.slope_rating,
          course.yardage
        );
      }
      
      return {
        ...course,
        fitScore,
      };
    });
    
    // Log the specific courses we're looking for
    const targetCourses = ['Shoreline Golf Links', 'Sunnyvale Golf Course', 'Baylands Golf Links'];
    targetCourses.forEach(name => {
      const found = coursesWithFitScore.find(c => c.name === name);
      if (found) {
        console.log(`[API /courses] ✓ Found: ${name} (Fit Score: ${found.fitScore})`);
      } else {
        console.warn(`[API /courses] ✗ Missing: ${name}`);
      }
    });
    
    return NextResponse.json(coursesWithFitScore, { headers });
  } catch (error: any) {
    console.error('[API /courses] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

