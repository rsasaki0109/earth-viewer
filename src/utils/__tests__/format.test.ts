import { describe, expect, it } from 'vitest';
import { formatHeight, formatLatLon, heightToZoomLevel } from '../format';

describe('formatLatLon', () => {
  it('formats northern/eastern coordinates', () => {
    expect(formatLatLon(35.681236, 139.767125)).toBe('35.681236°N, 139.767125°E');
  });

  it('formats southern/western coordinates', () => {
    expect(formatLatLon(-33.8688, -151.2093, 4)).toBe('33.8688°S, 151.2093°W');
  });

  it('respects the digits parameter', () => {
    expect(formatLatLon(1.23456789, 2.3456789, 2)).toBe('1.23°N, 2.35°E');
  });
});

describe('formatHeight', () => {
  it('formats sub-1000m heights in meters', () => {
    expect(formatHeight(500)).toBe('500 m');
  });

  it('formats 1000m+ heights in kilometers', () => {
    expect(formatHeight(1500)).toBe('1.50 km');
  });

  it('handles non-finite input gracefully', () => {
    expect(formatHeight(NaN)).toBe('—');
    expect(formatHeight(Infinity)).toBe('—');
  });
});

describe('heightToZoomLevel', () => {
  it('returns 0 for non-positive/invalid heights', () => {
    expect(heightToZoomLevel(0)).toBe(0);
    expect(heightToZoomLevel(-100)).toBe(0);
    expect(heightToZoomLevel(NaN)).toBe(0);
  });

  it('returns a higher level for a lower camera height', () => {
    const far = heightToZoomLevel(1e7);
    const near = heightToZoomLevel(1000);
    expect(near).toBeGreaterThan(far);
  });

  it('never exceeds the max zoom level', () => {
    expect(heightToZoomLevel(0.0001)).toBeLessThanOrEqual(20);
  });
});
