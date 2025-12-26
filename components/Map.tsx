'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { Course } from '@/lib/types';
import styles from '@/styles/map.module.scss';

// Helper to geocode an address
async function geocodeAddress(address: string): Promise<[number, number] | null> {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!mapboxToken) return null;

  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${mapboxToken}&limit=1`;
    
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center; // Mapbox returns [lng, lat]
      return [lng, lat];
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

interface MapProps {
  courses: Course[];
  selectedCourseId?: string;
  onSelectCourse: (courseId: string) => void;
}

// Haversine formula to calculate distance between two coordinates (in miles)
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function Map({ courses, selectedCourseId, onSelectCourse }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const searchMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const redwoodCityMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const geocoderRef = useRef<MapboxGeocoder | null>(null);
  const coursesRef = useRef<Course[]>(courses);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [markersReady, setMarkersReady] = useState(false);
  const [nearbyCourses, setNearbyCourses] = useState<Set<string>>(new Set());


  // Keep coursesRef in sync with courses prop
  useEffect(() => {
    coursesRef.current = courses;
  }, [courses]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!mapboxToken) {
      console.error('Mapbox token not found');
      return;
    }

    mapboxgl.accessToken = mapboxToken;

    // Initialize map centered on Redwood City
    const redwoodCityCenter: [number, number] = [-122.2364, 37.4852]; // Redwood City coordinates

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: redwoodCityCenter,
      zoom: 11,
    });

    map.current.on('load', () => {
      setMapLoaded(true);
      
      // Add blue marker at Redwood City center
      const redwoodCityEl = document.createElement('div');
      redwoodCityEl.style.width = '20px';
      redwoodCityEl.style.height = '20px';
      redwoodCityEl.style.borderRadius = '50%';
      redwoodCityEl.style.backgroundColor = '#3b82f6'; // Blue color
      redwoodCityEl.style.border = '3px solid white';
      redwoodCityEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
      redwoodCityEl.style.cursor = 'pointer';
      redwoodCityEl.title = 'Redwood City';

      redwoodCityMarkerRef.current = new mapboxgl.Marker(redwoodCityEl)
        .setLngLat(redwoodCityCenter)
        .addTo(map.current!);
    });

    // Add geocoder control (only once when map is created)
    if (mapboxToken) {
      const geocoder = new MapboxGeocoder({
        accessToken: mapboxToken,
        mapboxgl: mapboxgl,
        placeholder: 'Search for an address or place',
        marker: false, // We'll manage the marker ourselves
        proximity: {
          longitude: redwoodCityCenter[0],
          latitude: redwoodCityCenter[1],
        },
      });

      geocoderRef.current = geocoder;
      map.current.addControl(geocoder as any, 'top-left');

      // Handle geocoder results
      geocoder.on('result', (e: any) => {
        const feature = e.result;
        const [lng, lat] = feature.center as [number, number];

        // Pan/zoom to the selected location
        map.current?.flyTo({
          center: [lng, lat],
          zoom: 13,
          duration: 1500,
        });

        // Add or update search marker
        if (searchMarkerRef.current) {
          searchMarkerRef.current.setLngLat([lng, lat]);
        } else {
          const el = document.createElement('div');
          el.style.width = '20px';
          el.style.height = '20px';
          el.style.borderRadius = '50%';
          el.style.backgroundColor = '#3b82f6';
          el.style.border = '3px solid white';
          el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
          el.style.cursor = 'pointer';

          searchMarkerRef.current = new mapboxgl.Marker(el)
            .setLngLat([lng, lat])
            .addTo(map.current!);
        }

        // Calculate distances to nearby courses using ref to get current courses
        const currentCourses = coursesRef.current;
        const courseDistances = currentCourses
          .map((course) => {
            // Get course coordinates
            let courseLat: number;
            let courseLng: number;

            if (course.lat && course.lng) {
              courseLng = course.lng;
              courseLat = course.lat;
              // Fix swapped coordinates if needed
              if (courseLat < 0 && courseLng > 0) {
                [courseLng, courseLat] = [courseLat, courseLng];
              }
            } else {
              return null;
            }

            const distance = calculateDistance(lat, lng, courseLat, courseLng);
            return { courseId: course.id, distance, courseName: course.name };
          })
          .filter((item): item is { courseId: string; distance: number; courseName: string } => item !== null)
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 5); // Get top 5 nearest courses

        // Highlight nearby courses (within 10 miles)
        const nearby = new Set<string>();
        courseDistances.forEach(({ courseId, distance }) => {
          if (distance <= 10) {
            nearby.add(courseId);
          }
        });
        setNearbyCourses(nearby);

        console.log('📍 Geocoded location:', feature.place_name);
        console.log('🏌️ Nearby courses:', courseDistances.map(c => `${c.courseName} (${c.distance.toFixed(1)} mi)`));
      });

      // Clear search marker and nearby courses when geocoder is cleared
      geocoder.on('clear', () => {
        if (searchMarkerRef.current) {
          searchMarkerRef.current.remove();
          searchMarkerRef.current = null;
        }
        setNearbyCourses(new Set());
      });
    }

    // Cleanup
    return () => {
      if (searchMarkerRef.current) {
        searchMarkerRef.current.remove();
      }
      if (redwoodCityMarkerRef.current) {
        redwoodCityMarkerRef.current.remove();
      }
      if (geocoderRef.current && map.current) {
        map.current.removeControl(geocoderRef.current as any);
      }
    };
  }, []);

  // Don't auto-center on markers - keep Redwood City as the center
  // The map is already centered on Redwood City, so we'll keep it there

  // Add/update markers when courses change
  useEffect(() => {
    if (!map.current || !mapLoaded) {
      console.log('Map not ready:', { map: !!map.current, mapLoaded, coursesCount: courses.length });
      return;
    }

    if (courses.length === 0) {
      console.warn('No courses to display on map');
      return;
    }

    console.log(`Adding ${courses.length} markers to map`);

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    setMarkersReady(false);

    // Add markers for each course
    const addMarkers = async () => {
      for (const course of courses) {
        let lng: number;
        let lat: number;
        let useGeocoding = false;

        // Build full address
        const addressParts = [
          course.address,
          course.city,
          course.state,
          course.country,
        ].filter(Boolean);
        const fullAddress = addressParts.join(', ');

        // Check if we should use geocoding
        // Use geocoding if: coordinates are missing, invalid, or seem wrong
        const hasInvalidCoords = !course.lat || !course.lng || 
                                  Math.abs(course.lat) > 90 || 
                                  Math.abs(course.lng) > 180 ||
                                  (course.lat < 0 && course.lng > 0); // Likely swapped

        if (hasInvalidCoords && fullAddress) {
          // Geocode from address
          console.log(`📍 Geocoding ${course.name} from address: ${fullAddress}`);
          const coords = await geocodeAddress(fullAddress);
          if (coords) {
            [lng, lat] = coords;
            useGeocoding = true;
            console.log(`✅ Geocoded ${course.name} to [${lng}, ${lat}]`);
          } else {
            console.warn(`❌ Failed to geocode ${course.name}, skipping`);
            continue;
          }
        } else if (course.lat && course.lng) {
          // Use existing coordinates
          lng = course.lng;
          lat = course.lat;
          
          // Fix swapped coordinates
          if (lat < 0 && lng > 0) {
            console.warn(`Fixing swapped coordinates for ${course.name}`);
            [lng, lat] = [lat, lng];
          }
        } else {
          console.warn(`⚠️  ${course.name}: No coordinates or address, skipping`);
          continue;
        }

      const el = document.createElement('div');
      el.className = styles.marker;
      if (course.id === selectedCourseId) {
        el.classList.add(styles.markerSelected);
      }
        // Highlight nearby courses
        if (nearbyCourses.has(course.id)) {
          el.classList.add(styles.markerNearby);
      }

      const marker = new mapboxgl.Marker(el)
          .setLngLat([lng, lat])
        .addTo(map.current!);

        console.log(`✅ Added marker for ${course.name} at [${lng}, ${lat}]${useGeocoding ? ' (geocoded)' : ''}`);

      marker.getElement().addEventListener('click', () => {
        onSelectCourse(course.id);
      });

      marker.getElement().addEventListener('mouseenter', () => {
        el.classList.add(styles.markerHover);
      });
      marker.getElement().addEventListener('mouseleave', () => {
        el.classList.remove(styles.markerHover);
      });

      markersRef.current.push(marker);

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      console.log(`✅ Successfully added ${markersRef.current.length} markers`);
      setMarkersReady(true);
    };

    addMarkers();
  }, [courses, mapLoaded, selectedCourseId, onSelectCourse, nearbyCourses]);

  // Update selected marker style and nearby course highlighting
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    markersRef.current.forEach((marker, index) => {
      const el = marker.getElement();
      const course = courses[index];
      if (!course) return;

      // Reset classes
      el.classList.remove(styles.markerSelected, styles.markerNearby);

      // Apply selected style
      if (course.id === selectedCourseId) {
        el.classList.add(styles.markerSelected);
      }
      
      // Apply nearby style (but not if it's selected)
      if (course.id !== selectedCourseId && nearbyCourses.has(course.id)) {
        el.classList.add(styles.markerNearby);
      }
    });
  }, [selectedCourseId, courses, mapLoaded, nearbyCourses]);

  return (
    <div className={styles.mapContainer}>
      <div ref={mapContainer} className={styles.map} />
    </div>
  );
}

