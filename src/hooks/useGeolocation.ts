import { useCallback, useEffect, useRef, useState } from 'react';
import type { LatLon } from '../types/geo';

export type GeolocationStatus = 'idle' | 'prompting' | 'success' | 'error';

interface GeolocationState {
  status: GeolocationStatus;
  position: LatLon | null;
  error: string | null;
}

export interface UseGeolocationResult extends GeolocationState {
  /** Triggers a one-shot location request. Never called automatically. */
  request(): void;
}

const GEOLOCATION_TIMEOUT_MS = 10000;

function geolocationErrorMessage(err: GeolocationPositionError): string {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return 'Location permission was denied.';
    case err.POSITION_UNAVAILABLE:
      return 'Location information is unavailable.';
    case err.TIMEOUT:
      return 'Location request timed out.';
    default:
      return 'An unknown error occurred while retrieving your location.';
  }
}

/**
 * Wraps `navigator.geolocation.getCurrentPosition` as a one-shot,
 * user-triggered request (never auto-requests on mount, respecting the
 * permission prompt being an explicit user action).
 */
export function useGeolocation(): UseGeolocationResult {
  const [state, setState] = useState<GeolocationState>({
    status: 'idle',
    position: null,
    error: null,
  });

  // Incremented on every request and on unmount, so late-arriving callbacks
  // from a stale or post-unmount request are ignored.
  const requestIdRef = useRef(0);

  useEffect(() => {
    return () => {
      requestIdRef.current += 1;
    };
  }, []);

  const request = useCallback(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setState({
        status: 'error',
        position: null,
        error: 'Geolocation is not supported by this browser.',
      });
      return;
    }

    const requestId = ++requestIdRef.current;
    setState({ status: 'prompting', position: null, error: null });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (requestIdRef.current !== requestId) {
          return;
        }
        setState({
          status: 'success',
          position: { lat: pos.coords.latitude, lon: pos.coords.longitude },
          error: null,
        });
      },
      (err) => {
        if (requestIdRef.current !== requestId) {
          return;
        }
        setState({ status: 'error', position: null, error: geolocationErrorMessage(err) });
      },
      { enableHighAccuracy: true, timeout: GEOLOCATION_TIMEOUT_MS, maximumAge: 0 },
    );
  }, []);

  return { ...state, request };
}
