import { useCallback } from 'react';
import { Cartesian3, Math as CesiumMath, type Viewer } from 'cesium';
import type { CameraView } from '../types/geo';

const FLY_DURATION_SECONDS = 1.5;
const WHOLE_EARTH_HEIGHT_METERS = 2e7;
const TOP_DOWN_PITCH_DEGREES = -90;
const DEFAULT_FLY_HEIGHT_METERS = 10000;

export interface UseCameraControlsResult {
  flyToView(view: CameraView): void;
  /** Flies to a top-down view of the whole earth. */
  flyHome(): void;
  /** Flies to straight-down orientation above the current ground position. */
  flyTopDown(): void;
  flyToLatLon(lat: number, lon: number, height?: number): void;
  /** Resets heading to north while keeping the current position/pitch. */
  resetNorth(): void;
  getCurrentView(): CameraView | null;
}

/**
 * Animated camera actions built on Cesium's `camera.flyTo`. Every action is
 * a no-op when the viewer isn't ready yet (e.g. still mounting).
 */
export function useCameraControls(viewer: Viewer | null): UseCameraControlsResult {
  const flyToView = useCallback(
    (view: CameraView) => {
      if (!viewer) {
        return;
      }
      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(view.lon, view.lat, view.height),
        orientation: {
          heading: CesiumMath.toRadians(view.heading),
          pitch: CesiumMath.toRadians(view.pitch),
          roll: 0,
        },
        duration: FLY_DURATION_SECONDS,
      });
    },
    [viewer],
  );

  const flyHome = useCallback(() => {
    if (!viewer) {
      return;
    }
    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(0, 0, WHOLE_EARTH_HEIGHT_METERS),
      orientation: {
        heading: 0,
        pitch: CesiumMath.toRadians(TOP_DOWN_PITCH_DEGREES),
        roll: 0,
      },
      duration: FLY_DURATION_SECONDS,
    });
  }, [viewer]);

  const flyTopDown = useCallback(() => {
    if (!viewer) {
      return;
    }
    const carto = viewer.camera.positionCartographic;
    viewer.camera.flyTo({
      destination: Cartesian3.fromRadians(carto.longitude, carto.latitude, carto.height),
      orientation: {
        heading: 0,
        pitch: CesiumMath.toRadians(TOP_DOWN_PITCH_DEGREES),
        roll: 0,
      },
      duration: FLY_DURATION_SECONDS,
    });
  }, [viewer]);

  const flyToLatLon = useCallback(
    (lat: number, lon: number, height: number = DEFAULT_FLY_HEIGHT_METERS) => {
      if (!viewer) {
        return;
      }
      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(lon, lat, height),
        duration: FLY_DURATION_SECONDS,
      });
    },
    [viewer],
  );

  const resetNorth = useCallback(() => {
    if (!viewer) {
      return;
    }
    const carto = viewer.camera.positionCartographic;
    const { pitch } = viewer.camera;
    viewer.camera.flyTo({
      destination: Cartesian3.fromRadians(carto.longitude, carto.latitude, carto.height),
      orientation: { heading: 0, pitch, roll: 0 },
      duration: FLY_DURATION_SECONDS,
    });
  }, [viewer]);

  const getCurrentView = useCallback((): CameraView | null => {
    if (!viewer) {
      return null;
    }
    const carto = viewer.camera.positionCartographic;
    return {
      lat: CesiumMath.toDegrees(carto.latitude),
      lon: CesiumMath.toDegrees(carto.longitude),
      height: carto.height,
      heading: CesiumMath.toDegrees(viewer.camera.heading),
      pitch: CesiumMath.toDegrees(viewer.camera.pitch),
    };
  }, [viewer]);

  return { flyToView, flyHome, flyTopDown, flyToLatLon, resetNorth, getCurrentView };
}
