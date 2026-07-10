/** Returns true when `n` is a finite number within the valid latitude range. */
export function validateLat(n: number): boolean {
  return Number.isFinite(n) && n >= -90 && n <= 90;
}

/** Returns true when `n` is a finite number within the valid longitude range. */
export function validateLon(n: number): boolean {
  return Number.isFinite(n) && n >= -180 && n <= 180;
}

/**
 * Parses a free-form string into a finite number, or `null` if the input is
 * empty, non-numeric, or not finite (NaN/Infinity). Never throws.
 */
export function parseCoordinate(input: string): number | null {
  const trimmed = input.trim();
  if (trimmed === '') {
    return null;
  }
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

export type CoordinateValidation =
  | { ok: true; lat: number; lon: number }
  | { ok: false; error: string };

/** Validates a lat/lon pair, returning a discriminated result instead of throwing. */
export function validateCoordinates(lat: number, lon: number): CoordinateValidation {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return { ok: false, error: 'Latitude and longitude must be finite numbers.' };
  }
  if (!validateLat(lat)) {
    return { ok: false, error: 'Latitude must be between -90 and 90.' };
  }
  if (!validateLon(lon)) {
    return { ok: false, error: 'Longitude must be between -180 and 180.' };
  }
  return { ok: true, lat, lon };
}
