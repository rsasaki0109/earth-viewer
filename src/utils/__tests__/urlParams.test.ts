import { describe, expect, it } from 'vitest';
import { buildShareUrl, parseUrlParams, serializeCameraParams } from '../urlParams';
import type { CameraView } from '../../types/geo';

describe('parseUrlParams', () => {
  it('parses a fully valid query string', () => {
    const result = parseUrlParams('?lat=35.6&lon=139.7&height=1000&heading=90&pitch=-45');
    expect(result).toEqual({ lat: 35.6, lon: 139.7, height: 1000, heading: 90, pitch: -45 });
  });

  it('returns an empty object when params are missing', () => {
    expect(parseUrlParams('')).toEqual({});
    expect(parseUrlParams('?foo=bar')).toEqual({});
  });

  it('falls back (omits the field) on out-of-range lat/lon', () => {
    const result = parseUrlParams('?lat=999&lon=-500&height=1000');
    expect(result.lat).toBeUndefined();
    expect(result.lon).toBeUndefined();
    expect(result.height).toBe(1000);
  });

  it('falls back on non-numeric values', () => {
    const result = parseUrlParams('?lat=abc&lon=139.7&heading=xyz');
    expect(result.lat).toBeUndefined();
    expect(result.lon).toBe(139.7);
    expect(result.heading).toBeUndefined();
  });

  it('never throws on malformed input', () => {
    expect(() => parseUrlParams('???not a=query&&&')).not.toThrow();
  });

  it('rejects out-of-range height/heading/pitch', () => {
    const result = parseUrlParams('?height=-5&heading=400&pitch=200');
    expect(result.height).toBeUndefined();
    expect(result.heading).toBeUndefined();
    expect(result.pitch).toBeUndefined();
  });
});

describe('serializeCameraParams / buildShareUrl', () => {
  const view: CameraView = { lat: 35.681236, lon: 139.767125, height: 1234.2, heading: 12.3, pitch: -45.6 };

  it('serializes all camera fields', () => {
    const params = serializeCameraParams(view);
    expect(params.get('lat')).toBe('35.681236');
    expect(params.get('lon')).toBe('139.767125');
    expect(params.get('height')).toBe('1234');
    expect(params.get('heading')).toBe('12.3');
    expect(params.get('pitch')).toBe('-45.6');
  });

  it('round-trips through parseUrlParams', () => {
    const params = serializeCameraParams(view);
    const reparsed = parseUrlParams(`?${params.toString()}`);
    expect(reparsed.lat).toBeCloseTo(view.lat, 5);
    expect(reparsed.lon).toBeCloseTo(view.lon, 5);
    expect(reparsed.height).toBeCloseTo(view.height, 0);
    expect(reparsed.heading).toBeCloseTo(view.heading, 1);
    expect(reparsed.pitch).toBeCloseTo(view.pitch, 1);
  });

  it('builds a share URL by appending params to a base path', () => {
    const url = buildShareUrl('https://example.com/earth-viewer/', view);
    expect(url.startsWith('https://example.com/earth-viewer/?')).toBe(true);
    expect(url).toContain('lat=35.681236');
  });

  it('strips any pre-existing query string from the base before appending', () => {
    const url = buildShareUrl('https://example.com/earth-viewer/?old=1', view);
    expect(url).not.toContain('old=1');
  });
});
