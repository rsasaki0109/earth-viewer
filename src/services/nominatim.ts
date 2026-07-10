import type { GeocodeResult, GeocodingProvider, NominatimPlace } from '../types/geocoding';

/** Thrown for any Nominatim failure (network, non-OK status, or bad payload). */
export class GeocodingError extends Error {}

const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search';
const RESULT_LIMIT = 5;

/**
 * Client for the public Nominatim search API.
 *
 * Nominatim usage policy (https://operations.osmfoundation.org/policies/nominatim/)
 * caps anonymous usage at roughly 1 request/second and forbids bulk/automated
 * querying. This class only ever issues a single request per call; callers
 * are responsible for staying within policy by debouncing interactive input
 * and/or requiring an explicit search action (see `useGeocodingSearch`) and
 * by caching results (see `geocoding.ts`) instead of re-querying.
 */
export class NominatimProvider implements GeocodingProvider {
  async search(query: string, signal?: AbortSignal): Promise<GeocodeResult[]> {
    const trimmed = query.trim();
    if (trimmed === '') {
      return [];
    }

    const url = new URL(NOMINATIM_SEARCH_URL);
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('q', trimmed);
    url.searchParams.set('limit', String(RESULT_LIMIT));
    url.searchParams.set('addressdetails', '0');

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        signal,
        headers: {
          'Accept-Language': typeof navigator !== 'undefined' ? navigator.language : 'en',
        },
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw err;
      }
      throw new GeocodingError('Network error while contacting the geocoding service.');
    }

    if (!response.ok) {
      throw new GeocodingError(`Geocoding service responded with status ${response.status}.`);
    }

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new GeocodingError('Geocoding service returned an invalid response.');
    }

    if (!Array.isArray(data)) {
      throw new GeocodingError('Geocoding service returned an unexpected response shape.');
    }

    return (data as NominatimPlace[])
      .map(toGeocodeResult)
      .filter((result): result is GeocodeResult => result !== null);
  }
}

function toGeocodeResult(place: NominatimPlace): GeocodeResult | null {
  const lat = Number(place.lat);
  const lon = Number(place.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }
  return {
    id: String(place.place_id),
    label: place.display_name,
    lat,
    lon,
  };
}
