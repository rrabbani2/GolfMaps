/**
 * Geocoding utility to convert addresses to coordinates
 * Uses Mapbox Geocoding API (free tier available)
 */

export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress?: string;
}

/**
 * Geocode an address using Mapbox Geocoding API
 * @param address - Full address string (e.g., "1700 17-Mile Drive, Pebble Beach, CA, USA")
 * @returns Coordinates or null if geocoding fails
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  
  if (!mapboxToken) {
    console.error('Mapbox token not found for geocoding');
    return null;
  }

  try {
    // Encode address for URL
    const encodedAddress = encodeURIComponent(address);
    
    // Use Mapbox Geocoding API
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${mapboxToken}&limit=1`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Geocoding failed: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center; // Mapbox returns [lng, lat]
      const formattedAddress = data.features[0].place_name;
      
      return {
        lng,
        lat,
        formattedAddress,
      };
    }
    
    console.warn(`No results found for address: ${address}`);
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Geocode multiple addresses (with rate limiting)
 */
export async function geocodeAddresses(
  addresses: string[],
  delayMs: number = 100
): Promise<Map<string, GeocodeResult>> {
  const results = new Map<string, GeocodeResult>();
  
  for (const address of addresses) {
    const result = await geocodeAddress(address);
    if (result) {
      results.set(address, result);
    }
    
    // Rate limiting - wait between requests
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return results;
}

