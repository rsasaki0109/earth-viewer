import type { Marker } from '../types/geo';
import { validateLat, validateLon } from './coordinates';

/** Maximum length kept for a marker name; longer input is truncated (never rejected). */
export const MARKER_NAME_MAX_LENGTH = 80;
/** Maximum length kept for a marker note; longer input is truncated (never rejected). */
export const MARKER_NOTE_MAX_LENGTH = 500;

/**
 * Truncates `s` to at most `max` characters. Used (rather than rejecting) so
 * that persisting a marker never fails just because the user typed too much.
 */
export function clampText(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) : s;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function hasValidMarkerShape(value: unknown): value is Marker {
  if (!isRecord(value)) {
    return false;
  }
  const { id, name, note, lat, lon, createdAt } = value;
  return (
    typeof id === 'string' &&
    id.length > 0 &&
    typeof name === 'string' &&
    typeof note === 'string' &&
    typeof lat === 'number' &&
    typeof lon === 'number' &&
    validateLat(lat) &&
    validateLon(lon) &&
    typeof createdAt === 'number' &&
    Number.isFinite(createdAt)
  );
}

/**
 * Safely parses a LocalStorage-backed marker list. Returns `[]` for `null`,
 * corrupt JSON, a non-array payload, or any entry with the wrong shape —
 * never throws. Valid entries have their `name`/`note` clamped to the
 * documented length limits.
 */
export function parseMarkers(raw: string | null): Marker[] {
  if (raw === null) {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  const markers: Marker[] = [];
  for (const item of parsed) {
    if (hasValidMarkerShape(item)) {
      markers.push({
        id: item.id,
        name: clampText(item.name, MARKER_NAME_MAX_LENGTH),
        note: clampText(item.note, MARKER_NOTE_MAX_LENGTH),
        lat: item.lat,
        lon: item.lon,
        createdAt: item.createdAt,
      });
    }
  }
  return markers;
}

/** Serializes markers for storage; pairs with {@link parseMarkers}. */
export function serializeMarkers(markers: Marker[]): string {
  return JSON.stringify(markers);
}
