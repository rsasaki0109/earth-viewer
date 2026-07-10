import { describe, expect, it } from 'vitest';
import {
  parseCoordinate,
  validateCoordinates,
  validateLat,
  validateLon,
} from '../coordinates';

describe('validateLat', () => {
  it('accepts values within range', () => {
    expect(validateLat(0)).toBe(true);
    expect(validateLat(45.5)).toBe(true);
    expect(validateLat(-45.5)).toBe(true);
  });

  it('accepts boundary values', () => {
    expect(validateLat(90)).toBe(true);
    expect(validateLat(-90)).toBe(true);
  });

  it('rejects out-of-range values', () => {
    expect(validateLat(90.0001)).toBe(false);
    expect(validateLat(-90.0001)).toBe(false);
    expect(validateLat(180)).toBe(false);
  });

  it('rejects NaN and non-finite values', () => {
    expect(validateLat(NaN)).toBe(false);
    expect(validateLat(Infinity)).toBe(false);
    expect(validateLat(-Infinity)).toBe(false);
  });
});

describe('validateLon', () => {
  it('accepts values within range', () => {
    expect(validateLon(0)).toBe(true);
    expect(validateLon(120)).toBe(true);
    expect(validateLon(-120)).toBe(true);
  });

  it('accepts boundary values', () => {
    expect(validateLon(180)).toBe(true);
    expect(validateLon(-180)).toBe(true);
  });

  it('rejects out-of-range values', () => {
    expect(validateLon(180.0001)).toBe(false);
    expect(validateLon(-180.0001)).toBe(false);
    expect(validateLon(360)).toBe(false);
  });

  it('rejects NaN and non-finite values', () => {
    expect(validateLon(NaN)).toBe(false);
    expect(validateLon(Infinity)).toBe(false);
  });
});

describe('parseCoordinate', () => {
  it('parses valid numeric strings', () => {
    expect(parseCoordinate('45.5')).toBe(45.5);
    expect(parseCoordinate('-122.4')).toBe(-122.4);
    expect(parseCoordinate('  10  ')).toBe(10);
  });

  it('returns null for empty input', () => {
    expect(parseCoordinate('')).toBeNull();
    expect(parseCoordinate('   ')).toBeNull();
  });

  it('returns null for non-numeric input', () => {
    expect(parseCoordinate('abc')).toBeNull();
    expect(parseCoordinate('12abc')).toBeNull();
  });

  it('returns null for NaN/Infinity-producing input', () => {
    expect(parseCoordinate('NaN')).toBeNull();
    expect(parseCoordinate('Infinity')).toBeNull();
  });
});

describe('validateCoordinates', () => {
  it('returns ok for valid coordinates', () => {
    const result = validateCoordinates(35.6, 139.7);
    expect(result).toEqual({ ok: true, lat: 35.6, lon: 139.7 });
  });

  it('returns a discriminated error for out-of-range latitude', () => {
    const result = validateCoordinates(91, 0);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/latitude/i);
    }
  });

  it('returns a discriminated error for out-of-range longitude', () => {
    const result = validateCoordinates(0, 181);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/longitude/i);
    }
  });

  it('returns a discriminated error for NaN input', () => {
    const result = validateCoordinates(NaN, 0);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeTruthy();
    }
  });
});
