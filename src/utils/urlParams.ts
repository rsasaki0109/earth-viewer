import type { CameraView } from '../types/geo';
import { validateLat, validateLon } from './coordinates';

/** Decimal digits kept for lat/lon in the share URL. */
const COORD_PRECISION = 6;
/** Decimal digits kept for heading/pitch in the share URL. */
const ANGLE_PRECISION = 1;

const MIN_HEIGHT_METERS = 1;
const MAX_HEIGHT_METERS = 5e8; // generous upper bound; well above whole-earth view
const MIN_HEADING_DEGREES = 0;
const MAX_HEADING_DEGREES = 360;
const MIN_PITCH_DEGREES = -90;
const MAX_PITCH_DEGREES = 90;

function parseFiniteNumber(params: URLSearchParams, key: string): number | null {
  const raw = params.get(key);
  if (raw === null) {
    return null;
  }
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

/**
 * Parses `lat`, `lon`, `height`, `heading`, `pitch` from a query string.
 * Missing or invalid values are simply omitted from the result (never
 * throws) so callers can fall back to defaults field-by-field.
 */
export function parseUrlParams(search: string): Partial<CameraView> {
  const params = new URLSearchParams(search);
  const result: Partial<CameraView> = {};

  const lat = parseFiniteNumber(params, 'lat');
  if (lat !== null && validateLat(lat)) {
    result.lat = lat;
  }

  const lon = parseFiniteNumber(params, 'lon');
  if (lon !== null && validateLon(lon)) {
    result.lon = lon;
  }

  const height = parseFiniteNumber(params, 'height');
  if (height !== null && height >= MIN_HEIGHT_METERS && height <= MAX_HEIGHT_METERS) {
    result.height = height;
  }

  const heading = parseFiniteNumber(params, 'heading');
  if (heading !== null && heading >= MIN_HEADING_DEGREES && heading < MAX_HEADING_DEGREES) {
    result.heading = heading;
  }

  const pitch = parseFiniteNumber(params, 'pitch');
  if (pitch !== null && pitch >= MIN_PITCH_DEGREES && pitch <= MAX_PITCH_DEGREES) {
    result.pitch = pitch;
  }

  return result;
}

/** Serializes a full camera view into query parameters (rounded for shareable URLs). */
export function serializeCameraParams(view: CameraView): URLSearchParams {
  const params = new URLSearchParams();
  params.set('lat', view.lat.toFixed(COORD_PRECISION));
  params.set('lon', view.lon.toFixed(COORD_PRECISION));
  params.set('height', Math.round(view.height).toString());
  params.set('heading', view.heading.toFixed(ANGLE_PRECISION));
  params.set('pitch', view.pitch.toFixed(ANGLE_PRECISION));
  return params;
}

/** Builds a shareable URL by appending the camera view as query parameters to `base`. */
export function buildShareUrl(base: string, view: CameraView): string {
  const params = serializeCameraParams(view);
  const [path] = base.split('?');
  return `${path}?${params.toString()}`;
}
