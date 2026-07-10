/**
 * A single place result as returned by the Nominatim `/search` endpoint
 * (format=jsonv2). Only the fields this app consumes are declared here.
 */
export interface NominatimPlace {
  place_id: number;
  licence?: string;
  osm_type?: string;
  osm_id?: number;
  boundingbox?: [string, string, string, string];
  lat: string;
  lon: string;
  display_name: string;
  class?: string;
  type?: string;
  importance?: number;
}

/** A normalized geocoding result, independent of the underlying provider. */
export interface GeocodeResult {
  id: string;
  label: string;
  lat: number;
  lon: number;
}

/**
 * Abstraction over a geocoding backend so the provider (Nominatim today) can
 * be swapped without touching consuming hooks/components.
 */
export interface GeocodingProvider {
  search(query: string, signal?: AbortSignal): Promise<GeocodeResult[]>;
}
