import { WeatherData } from './types';

export interface WeatherCacheEntry {
  data: WeatherData;
  timestamp: number;
}

// In-memory cache (in production, consider using Redis or database)
const weatherCache = new Map<string, WeatherCacheEntry>();

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

export function getCachedWeather(cacheKey: string): WeatherData | null {
  const entry = weatherCache.get(cacheKey);
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.timestamp > CACHE_DURATION) {
    weatherCache.delete(cacheKey);
    return null;
  }

  return entry.data;
}

export function setCachedWeather(cacheKey: string, data: WeatherData): void {
  weatherCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });
}

export function createCacheKey(lat: number, lng: number): string {
  // Round to 2 decimal places for cache key (about 1km precision)
  return `${lat.toFixed(2)},${lng.toFixed(2)}`;
}

