declare module '@mapbox/mapbox-gl-geocoder' {
  import { IControl, Map } from 'mapbox-gl';

  interface MapboxGeocoderOptions {
    accessToken: string;
    mapboxgl: any;
    placeholder?: string;
    marker?: boolean | object;
    proximity?: {
      longitude: number;
      latitude: number;
    };
    countries?: string;
    types?: string;
    bbox?: [number, number, number, number];
    limit?: number;
    language?: string;
    filter?: (feature: any) => boolean;
    localGeocoder?: (query: string) => any[];
    reverseGeocode?: boolean;
    enableEventLogging?: boolean;
    flyTo?: boolean | object;
    minLength?: number;
  }

  export default class MapboxGeocoder implements IControl {
    constructor(options: MapboxGeocoderOptions);
    onAdd(map: Map): HTMLElement;
    onRemove(map: Map): void;
    getDefaultPosition?: () => string;
    on(event: 'result', callback: (e: { result: any }) => void): void;
    on(event: 'clear', callback: () => void): void;
    on(event: 'loading', callback: (e: { query: string }) => void): void;
    on(event: 'error', callback: (e: { error: any }) => void): void;
    query(searchInput: string): void;
    clear(): void;
    setProximity(coordinates: { longitude: number; latitude: number }): void;
    setRenderFunction(fn: (item: any) => string): void;
    setLanguage(language: string): void;
    setCountries(countries: string): void;
    setTypes(types: string): void;
    setFilter(filter: (feature: any) => boolean): void;
    getBbox(): [number, number, number, number] | null;
    setBbox(bbox: [number, number, number, number]): void;
  }
}

