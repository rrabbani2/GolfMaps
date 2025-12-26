import { NextResponse } from 'next/server';

/**
 * Health check endpoint for monitoring and debugging
 * Returns status of environment variables and database connectivity
 */
export async function GET() {
  const health: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    environment: {
      supabaseUrl: boolean;
      supabaseKey: boolean;
      mapboxToken: boolean;
      weatherApiKey: boolean;
      googlePlacesKey: boolean;
    };
    database?: {
      connected: boolean;
      error?: string;
    };
  } = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      mapboxToken: !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
      weatherApiKey: !!process.env.WEATHER_API_KEY,
      googlePlacesKey: !!process.env.GOOGLE_PLACES_API_KEY,
    },
  };

  // Check database connectivity
  try {
    const { createServerClient } = await import('@/lib/supabaseServer');
    const supabase = await createServerClient();
    const { error } = await supabase.from('courses').select('id').limit(1);
    
    health.database = {
      connected: !error,
      error: error?.message,
    };

    if (error) {
      health.status = 'degraded';
    }
  } catch (error: any) {
    health.database = {
      connected: false,
      error: error.message,
    };
    health.status = 'unhealthy';
  }

  // Check if any critical env vars are missing
  if (!health.environment.supabaseUrl || !health.environment.supabaseKey) {
    health.status = 'unhealthy';
  } else if (!health.environment.mapboxToken || !health.environment.weatherApiKey) {
    health.status = 'degraded';
  }

  const statusCode = health.status === 'unhealthy' ? 503 : health.status === 'degraded' ? 200 : 200;

  return NextResponse.json(health, { status: statusCode });
}

