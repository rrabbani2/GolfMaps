import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { computeBusynessScore } from '@/lib/busyness';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get('courseId');
    const datetime = searchParams.get('datetime');

    console.log(`[API /busyness] Request - courseId: ${courseId}, datetime: ${datetime}`);

    if (!courseId) {
      return NextResponse.json(
        { error: 'courseId required' },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();
    console.log('[API /busyness] Supabase client created');

    // Fetch course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      console.error('[API /busyness] Course lookup error:', courseError);
      return NextResponse.json(
        { error: 'Course not found', details: courseError?.message },
        { status: 404 }
      );
    }

    console.log(`[API /busyness] Found course: ${course.name}`);

    // Fetch course stats
    const { data: stats, error: statsError } = await supabase
      .from('course_stats')
      .select('*')
      .eq('course_id', courseId)
      .single();

    if (statsError && statsError.code !== 'PGRST116') {
      // PGRST116 is "not found" which is okay
      console.warn('[API /busyness] Stats lookup warning:', statsError);
    }

    // Parse datetime or use current time
    const date = datetime ? new Date(datetime) : new Date();
    console.log(`[API /busyness] Computing busyness for date: ${date.toISOString()}`);

    // Optionally fetch Google Places data
    let googleData;
    if (course.google_place_id) {
      const googleApiKey = process.env.GOOGLE_PLACES_API_KEY;
      if (googleApiKey) {
        try {
          console.log(`[API /busyness] Fetching Google Places data for: ${course.google_place_id}`);
          // Using Places API Details endpoint
          const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${course.google_place_id}&fields=rating,user_ratings_total&key=${googleApiKey}`;
          const response = await fetch(url);
          
          if (!response.ok) {
            console.warn(`[API /busyness] Google Places API error: ${response.status}`);
          } else {
            const data = await response.json();
            
            if (data.result) {
              googleData = {
                rating: data.result.rating || 0,
                userRatingsTotal: data.result.user_ratings_total || 0,
              };
              console.log(`[API /busyness] Google Places data: rating=${googleData.rating}, reviews=${googleData.userRatingsTotal}`);
            } else if (data.error_message) {
              console.warn(`[API /busyness] Google Places API error: ${data.error_message}`);
            }
          }
        } catch (error: any) {
          console.error('[API /busyness] Google Places API exception:', error.message);
          // Continue without Google data
        }
      } else {
        console.log('[API /busyness] GOOGLE_PLACES_API_KEY not configured, skipping Google data');
      }
    } else {
      console.log('[API /busyness] No google_place_id for course, skipping Google data');
    }

    const busyness = computeBusynessScore(course, stats, date, googleData);
    console.log(`[API /busyness] Computed busyness: ${busyness.label} (${busyness.score})`);

    return NextResponse.json(busyness);
  } catch (error: any) {
    console.error('[API /busyness] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Failed to compute busyness score', details: error.message },
      { status: 500 }
    );
  }
}

