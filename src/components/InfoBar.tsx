import { useEffect, useRef, useState } from 'react';
import type { Viewer } from 'cesium';
import type { BaseLayerId } from '../hooks/useLayers';
import { useCameraReadout } from '../hooks/useCameraReadout';
import { formatHeight, formatLatLon, heightToZoomLevel } from '../utils/format';

export interface InfoBarProps {
  viewer: Viewer | null;
  baseLayer: BaseLayerId;
}

const FPS_FLUSH_INTERVAL_MS = 1000;

/** Dev-only FPS counter, driven by the Cesium scene's `postRender` event. */
function useFps(viewer: Viewer | null): number | null {
  const [fps, setFps] = useState<number | null>(null);
  const frameCountRef = useRef(0);

  useEffect(() => {
    if (!viewer || !import.meta.env.DEV) {
      return;
    }

    frameCountRef.current = 0;
    const countFrame = (): void => {
      frameCountRef.current += 1;
    };
    const removeListener = viewer.scene.postRender.addEventListener(countFrame);

    const interval = setInterval(() => {
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
    }, FPS_FLUSH_INTERVAL_MS);

    return () => {
      removeListener();
      clearInterval(interval);
    };
  }, [viewer]);

  return fps;
}

/**
 * Bottom bar: live lat/lon/height/zoom readout for the screen-center point,
 * required map attribution, and (dev builds only) an FPS counter.
 */
export function InfoBar({ viewer, baseLayer }: InfoBarProps): JSX.Element {
  const readout = useCameraReadout(viewer);
  const fps = useFps(viewer);

  const coordsText =
    readout && readout.centerLat !== null && readout.centerLon !== null
      ? formatLatLon(readout.centerLat, readout.centerLon)
      : '—';
  const heightText = readout ? formatHeight(readout.height) : '—';
  const zoomText = readout ? heightToZoomLevel(readout.height).toString() : '—';

  return (
    <div className="info-bar">
      <span className="info-bar__item">{coordsText}</span>
      <span className="info-bar__item">Alt: {heightText}</span>
      <span className="info-bar__item">Zoom: {zoomText}</span>
      {import.meta.env.DEV && fps !== null && <span className="info-bar__item">{fps} fps</span>}
      <span className="info-bar__attribution">
        © OpenStreetMap contributors
        {baseLayer === 'satellite' && ' · Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'}
      </span>
    </div>
  );
}
