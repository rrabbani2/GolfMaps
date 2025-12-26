/**
 * API endpoint to geocode a single address
 * POST /api/geocode
 * Body: { "address": "1700 17-Mile Drive, Pebble Beach, CA, USA" }
 */
import { NextRequest, NextResponse } from 'next/server';
import { geocodeAddress } from '@/lib/geocoding';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address } = body;

    if (!address || typeof address !== 'string') {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    const result = await geocodeAddress(address);

    if (!result) {
      return NextResponse.json(
        { error: 'Geocoding failed - address not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API /geocode] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

