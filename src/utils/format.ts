/** Formats a lat/lon pair as e.g. `35.681236°N, 139.767125°E`. */
export function formatLatLon(lat: number, lon: number, digits = 6): string {
  const latHemisphere = lat >= 0 ? 'N' : 'S';
  const lonHemisphere = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(digits)}°${latHemisphere}, ${Math.abs(lon).toFixed(digits)}°${lonHemisphere}`;
}

const METERS_PER_KM = 1000;

/** Formats a height in meters, switching to km above 1000m. */
export function formatHeight(meters: number): string {
  if (!Number.isFinite(meters)) {
    return '—';
  }
  if (Math.abs(meters) >= METERS_PER_KM) {
    return `${(meters / METERS_PER_KM).toFixed(2)} km`;
  }
  return `${Math.round(meters)} m`;
}

/** Approximate camera height (meters) representing a whole-earth view, used as the zoom-level reference. */
const ZOOM_REFERENCE_HEIGHT_METERS = 4e7;
const MAX_ZOOM_LEVEL = 20;

/**
 * Approximates a "zoom level" readout (0 = whole earth, higher = closer)
 * from a camera height, similar in spirit to standard web-map zoom levels.
 */
export function heightToZoomLevel(height: number): number {
  if (!Number.isFinite(height) || height <= 0) {
    return 0;
  }
  const level = Math.log2(ZOOM_REFERENCE_HEIGHT_METERS / height);
  return Math.min(MAX_ZOOM_LEVEL, Math.max(0, Math.round(level)));
}
