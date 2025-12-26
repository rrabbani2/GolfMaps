import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getCachedWeather, setCachedWeather, createCacheKey } from '@/lib/weather';
import { WeatherData } from '@/lib/types';
import { calculateCourseCondition } from '@/lib/calculateCourseCondition';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get('courseId');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    console.log(`[API /weather] Request - courseId: ${courseId}, lat: ${lat}, lng: ${lng}`);

    let finalLat: number;
    let finalLng: number;

    // If courseId provided, look up course
    if (courseId) {
      const supabase = await createServerClient();
      const { data: course, error } = await supabase
        .from('courses')
        .select('lat, lng')
        .eq('id', courseId)
        .single();

      if (error || !course) {
        console.error('[API /weather] Course lookup error:', error);
        return NextResponse.json(
          { error: 'Course not found', details: error?.message },
          { status: 404 }
        );
      }

      finalLat = course.lat;
      finalLng = course.lng;
      console.log(`[API /weather] Found course coordinates: ${finalLat}, ${finalLng}`);
    } else if (lat && lng) {
      finalLat = parseFloat(lat);
      finalLng = parseFloat(lng);
      if (isNaN(finalLat) || isNaN(finalLng)) {
        return NextResponse.json(
          { error: 'Invalid lat/lng parameters' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Either courseId or lat/lng required' },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = createCacheKey(finalLat, finalLng);
    const cached = getCachedWeather(cacheKey);
    if (cached) {
      console.log('[API /weather] Returning cached data');
      return NextResponse.json(cached);
    }

    // Fetch from weather API
    const weatherApiKey = process.env.WEATHER_API_KEY;
    if (!weatherApiKey) {
      console.error('[API /weather] WEATHER_API_KEY not configured');
      return NextResponse.json(
        { error: 'Weather API key not configured' },
        { status: 500 }
      );
    }

    // Using OpenWeatherMap API
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${finalLat}&lon=${finalLng}&appid=${weatherApiKey}&units=imperial`;
    console.log(`[API /weather] Fetching from OpenWeatherMap API...`);
    
    const response = await fetch(url, {
      next: { revalidate: 600 } // Cache for 10 minutes at Next.js level
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API /weather] Weather API error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: 'Weather API request failed', status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[API /weather] Weather data received successfully');
    
    // Extract weather values
    const temperature = Math.round(data.main.temp);
    const windSpeed = Math.round(data.wind?.speed || 0);
    
    // Extract precipitation - OpenWeatherMap provides rain in mm for 1h or 3h periods
    // If available, convert to mm/hr. If not available, use 0.
    let precipitation = 0;
    if (data.rain) {
      // OpenWeatherMap can provide '1h' or '3h' keys
      if (data.rain['1h'] !== undefined) {
        precipitation = data.rain['1h']; // Already in mm/hr
      } else if (data.rain['3h'] !== undefined) {
        precipitation = data.rain['3h'] / 3; // Convert 3h total to mm/hr
      } else if (typeof data.rain === 'number') {
        precipitation = data.rain; // Fallback if it's just a number
      }
    }
    
    // Calculate course condition score
    const conditionScore = calculateCourseCondition({
      precipitation,
      windSpeed,
      temperature,
    });
    
    const weatherData: WeatherData = {
      temperature,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      windSpeed,
      conditionScore,
    };

    // Cache the result
    setCachedWeather(cacheKey, weatherData);
    console.log('[API /weather] Weather data cached with condition score:', conditionScore);

    return NextResponse.json(weatherData);
  } catch (error: any) {
    console.error('[API /weather] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data', details: error.message },
      { status: 500 }
    );
  }
}

