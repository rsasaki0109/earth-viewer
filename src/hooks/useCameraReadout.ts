import { useEffect, useState } from 'react';
import { Cartesian2, Cartographic, Math as CesiumMath, type Viewer } from 'cesium';

/** Lat/lon/height of the point at the center of the screen, plus the raw camera height. */
export interface CameraReadout {
  /** Latitude, in degrees, of the ground point under the screen center (null over the sky/horizon). */
  centerLat: number | null;
  /** Longitude, in degrees, of the ground point under the screen center (null over the sky/horizon). */
  centerLon: number | null;
  /** Camera height above the ellipsoid, in meters. */
  height: number;
}

function computeReadout(viewer: Viewer): CameraReadout {
  const canvas = viewer.scene.canvas;
  const center = new Cartesian2(canvas.clientWidth / 2, canvas.clientHeight / 2);
  const cartesian = viewer.camera.pickEllipsoid(center, viewer.scene.globe.ellipsoid);
  const height = viewer.camera.positionCartographic.height;

  if (!cartesian) {
    return { centerLat: null, centerLon: null, height };
  }

  const carto = Cartographic.fromCartesian(cartesian);
  return {
    centerLat: CesiumMath.toDegrees(carto.latitude),
    centerLon: CesiumMath.toDegrees(carto.longitude),
    height,
  };
}

/**
 * Live lat/lon/height readout for the point at the center of the screen,
 * updated on every camera `changed` event and on `moveEnd` (so the bottom
 * bar tracks both in-flight motion and the final settled position).
 * Listeners are removed on unmount or when the viewer instance changes.
 */
export function useCameraReadout(viewer: Viewer | null): CameraReadout | null {
  const [readout, setReadout] = useState<CameraReadout | null>(null);

  useEffect(() => {
    if (!viewer) {
      setReadout(null);
      return;
    }

    const update = (): void => {
      setReadout(computeReadout(viewer));
    };

    update();

    const removeChanged = viewer.camera.changed.addEventListener(update);
    const removeMoveEnd = viewer.camera.moveEnd.addEventListener(update);

    return () => {
      removeChanged();
      removeMoveEnd();
    };
  }, [viewer]);

  return readout;
}
