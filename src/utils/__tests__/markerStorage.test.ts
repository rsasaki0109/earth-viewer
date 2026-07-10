import { describe, expect, it } from 'vitest';
import {
  MARKER_NAME_MAX_LENGTH,
  MARKER_NOTE_MAX_LENGTH,
  clampText,
  parseMarkers,
  serializeMarkers,
} from '../markerStorage';
import type { Marker } from '../../types/geo';

const validMarker: Marker = {
  id: 'm1',
  name: 'Tokyo Tower',
  note: 'Great view at night',
  lat: 35.6586,
  lon: 139.7454,
  createdAt: 1700000000000,
};

describe('parseMarkers', () => {
  it('returns [] for null input', () => {
    expect(parseMarkers(null)).toEqual([]);
  });

  it('returns [] for corrupt JSON', () => {
    expect(parseMarkers('{not valid json')).toEqual([]);
  });

  it('returns [] for a non-array payload', () => {
    expect(parseMarkers(JSON.stringify({ foo: 'bar' }))).toEqual([]);
  });

  it('parses a valid marker list', () => {
    const raw = JSON.stringify([validMarker]);
    expect(parseMarkers(raw)).toEqual([validMarker]);
  });

  it('drops entries with the wrong shape while keeping valid ones', () => {
    const raw = JSON.stringify([
      validMarker,
      { id: 'bad', name: 'missing fields' },
      { ...validMarker, id: 'm2', lat: 999 }, // out-of-range lat
      { ...validMarker, id: 'm3', lon: 'not a number' },
      null,
      'a string entry',
      42,
    ]);
    expect(parseMarkers(raw)).toEqual([validMarker]);
  });

  it('clamps overly long name/note fields instead of dropping the marker', () => {
    const longName = 'x'.repeat(MARKER_NAME_MAX_LENGTH + 50);
    const longNote = 'y'.repeat(MARKER_NOTE_MAX_LENGTH + 50);
    const raw = JSON.stringify([{ ...validMarker, name: longName, note: longNote }]);
    const [parsed] = parseMarkers(raw);
    expect(parsed.name.length).toBe(MARKER_NAME_MAX_LENGTH);
    expect(parsed.note.length).toBe(MARKER_NOTE_MAX_LENGTH);
  });
});

describe('serializeMarkers', () => {
  it('round-trips with parseMarkers', () => {
    const markers = [validMarker, { ...validMarker, id: 'm2', name: 'Osaka Castle' }];
    const serialized = serializeMarkers(markers);
    expect(parseMarkers(serialized)).toEqual(markers);
  });

  it('serializes an empty list', () => {
    expect(serializeMarkers([])).toBe('[]');
    expect(parseMarkers(serializeMarkers([]))).toEqual([]);
  });
});

describe('clampText', () => {
  it('leaves short strings untouched', () => {
    expect(clampText('short', 80)).toBe('short');
  });

  it('truncates strings longer than max', () => {
    expect(clampText('x'.repeat(100), 10)).toBe('x'.repeat(10));
  });

  it('handles the exact boundary length', () => {
    expect(clampText('x'.repeat(10), 10)).toBe('x'.repeat(10));
  });
});
