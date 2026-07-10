import { useEffect, useRef, useState, type RefObject } from 'react';
import {
  EllipsoidTerrainProvider,
  ImageryLayer,
  Ion,
  OpenStreetMapImageryProvider,
  Viewer,
} from 'cesium';

export interface UseCesiumViewerResult {
  viewer: Viewer | null;
  isReady: boolean;
}

/**
 * Initializes a Cesium Viewer on the provided container element.
 *
 * - Ion is only enabled when `VITE_CESIUM_ION_TOKEN` is set; base imagery is
 *   always OpenStreetMap and terrain always starts as the plain ellipsoid
 *   (features that need ion, e.g. world terrain, are opted into later via
 *   `useLayers`, which itself no-ops safely when no token is configured).
 * - Safe to call from an effect that runs twice under React StrictMode: a
 *   ref guards against constructing a second Viewer for the same container.
 * - Exposes the single `Viewer` instance itself (rather than many derived
 *   Cesium objects) so it can be threaded through React context.
 */
export function useCesiumViewer(containerRef: RefObject<HTMLDivElement>): UseCesiumViewerResult {
  const viewerRef = useRef<Viewer | null>(null);
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || viewerRef.current) {
      return;
    }

    Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ION_TOKEN ?? '';

    const osmImageryProvider = new OpenStreetMapImageryProvider({
      url: 'https://tile.openstreetmap.org/',
      credit: '© OpenStreetMap contributors',
    });

    const createdViewer = new Viewer(container, {
      baseLayer: new ImageryLayer(osmImageryProvider),
      terrainProvider: new EllipsoidTerrainProvider(),
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      animation: false,
      timeline: false,
      fullscreenButton: false,
      infoBox: false,
      selectionIndicator: false,
    });

    viewerRef.current = createdViewer;
    setViewer(createdViewer);

    const removeListener = createdViewer.scene.globe.tileLoadProgressEvent.addEventListener(
      (queuedTileCount: number) => {
        if (queuedTileCount === 0 && createdViewer.scene.globe.tilesLoaded) {
          setIsReady(true);
        }
      },
    );

    return () => {
      removeListener();
      viewerRef.current?.destroy();
      viewerRef.current = null;
      setViewer(null);
      setIsReady(false);
    };
  }, [containerRef]);

  return { viewer, isReady };
}
