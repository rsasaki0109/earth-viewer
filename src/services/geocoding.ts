import type { GeocodeResult, GeocodingProvider } from '../types/geocoding';
import { NominatimProvider } from './nominatim';

export type { GeocodingProvider };

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

/**
 * Wraps a `GeocodingProvider` with an in-memory cache keyed by normalized
 * query text, so repeated searches (e.g. re-typing, debounce retriggers)
 * don't issue redundant requests against Nominatim's rate-limited API.
 */
class CachedGeocodingProvider implements GeocodingProvider {
  private readonly cache = new Map<string, GeocodeResult[]>();

  constructor(private readonly delegate: GeocodingProvider) {}

  async search(query: string, signal?: AbortSignal): Promise<GeocodeResult[]> {
    const key = normalizeQuery(query);
    if (key === '') {
      return [];
    }

    const cached = this.cache.get(key);
    if (cached) {
      return cached;
    }

    const results = await this.delegate.search(query, signal);
    this.cache.set(key, results);
    return results;
  }
}

/**
 * Default geocoding provider used by the app. Swap the wrapped delegate to
 * change backends without touching any consuming hook or component.
 */
const geocodingProvider: GeocodingProvider = new CachedGeocodingProvider(new NominatimProvider());

export default geocodingProvider;
