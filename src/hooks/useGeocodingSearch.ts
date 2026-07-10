import { useCallback, useEffect, useRef, useState } from 'react';
import type { GeocodeResult, GeocodingProvider } from '../types/geocoding';

export type GeocodingSearchStatus = 'idle' | 'searching' | 'empty' | 'error';

export interface UseGeocodingSearchResult {
  query: string;
  setQuery(query: string): void;
  results: GeocodeResult[];
  status: GeocodingSearchStatus;
  error: string | null;
  /** Runs the search immediately, bypassing the debounce timer. */
  search(): void;
}

const DEBOUNCE_MS = 400;

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError';
}

/**
 * Debounced (~400ms) and explicitly-triggerable search against a
 * `GeocodingProvider`. Aborts any in-flight request when a new one starts
 * or the component unmounts, so stale responses never overwrite fresher
 * results and the provider's rate limit isn't hammered by rapid typing.
 */
export function useGeocodingSearch(provider: GeocodingProvider): UseGeocodingSearchResult {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [status, setStatus] = useState<GeocodingSearchStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  const runSearch = useCallback(
    (rawQuery: string) => {
      const trimmed = rawQuery.trim();

      abortRef.current?.abort();

      if (trimmed === '') {
        setResults([]);
        setStatus('idle');
        setError(null);
        return;
      }

      const controller = new AbortController();
      abortRef.current = controller;
      setStatus('searching');
      setError(null);

      provider
        .search(trimmed, controller.signal)
        .then((found) => {
          if (!isMountedRef.current || controller.signal.aborted) {
            return;
          }
          setResults(found);
          setStatus(found.length === 0 ? 'empty' : 'idle');
        })
        .catch((err: unknown) => {
          if (!isMountedRef.current || controller.signal.aborted || isAbortError(err)) {
            return;
          }
          setResults([]);
          setStatus('error');
          setError(err instanceof Error ? err.message : 'Search failed.');
        });
    },
    [provider],
  );

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      runSearch(query);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, runSearch]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortRef.current?.abort();
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const search = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    runSearch(query);
  }, [query, runSearch]);

  return { query, setQuery, results, status, error, search };
}
