import { useCallback, useEffect, useState } from 'react';
import type { Marker } from '../types/geo';
import {
  MARKER_NAME_MAX_LENGTH,
  MARKER_NOTE_MAX_LENGTH,
  clampText,
  parseMarkers,
  serializeMarkers,
} from '../utils/markerStorage';

const STORAGE_KEY = 'earth-viewer.markers';

export interface NewMarkerInput {
  name: string;
  note?: string;
  lat: number;
  lon: number;
}

export type MarkerPatch = Partial<Pick<Marker, 'name' | 'note' | 'lat' | 'lon'>>;

export interface UseMarkersResult {
  markers: Marker[];
  addMarker(input: NewMarkerInput): Marker;
  updateMarker(id: string, patch: MarkerPatch): void;
  removeMarker(id: string): void;
  clearMarkers(): void;
}

function readStoredMarkers(): Marker[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    return parseMarkers(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    // Storage may be unavailable (disabled, private mode, etc.).
    return [];
  }
}

function persistMarkers(markers: Marker[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, serializeMarkers(markers));
  } catch {
    // Ignore quota/availability errors; in-memory state still works.
  }
}

function createMarkerId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `marker-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * LocalStorage-backed marker list. Corrupt or missing storage yields an
 * empty list rather than throwing; name/note length limits are enforced via
 * `clampText` on both create and update.
 */
export function useMarkers(): UseMarkersResult {
  const [markers, setMarkers] = useState<Marker[]>(() => readStoredMarkers());

  useEffect(() => {
    persistMarkers(markers);
  }, [markers]);

  const addMarker = useCallback((input: NewMarkerInput): Marker => {
    const marker: Marker = {
      id: createMarkerId(),
      name: clampText(input.name, MARKER_NAME_MAX_LENGTH),
      note: clampText(input.note ?? '', MARKER_NOTE_MAX_LENGTH),
      lat: input.lat,
      lon: input.lon,
      createdAt: Date.now(),
    };
    setMarkers((prev) => [...prev, marker]);
    return marker;
  }, []);

  const updateMarker = useCallback((id: string, patch: MarkerPatch) => {
    setMarkers((prev) =>
      prev.map((marker) => {
        if (marker.id !== id) {
          return marker;
        }
        return {
          ...marker,
          ...patch,
          name: patch.name !== undefined ? clampText(patch.name, MARKER_NAME_MAX_LENGTH) : marker.name,
          note: patch.note !== undefined ? clampText(patch.note, MARKER_NOTE_MAX_LENGTH) : marker.note,
        };
      }),
    );
  }, []);

  const removeMarker = useCallback((id: string) => {
    setMarkers((prev) => prev.filter((marker) => marker.id !== id));
  }, []);

  const clearMarkers = useCallback(() => {
    setMarkers([]);
  }, []);

  return { markers, addMarker, updateMarker, removeMarker, clearMarkers };
}
