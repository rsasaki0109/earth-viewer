import { useCallback, useEffect, useRef, useState } from 'react';
import {
  EllipsoidTerrainProvider,
  ImageryLayer,
  OpenStreetMapImageryProvider,
  UrlTemplateImageryProvider,
  createWorldTerrainAsync,
  type Viewer,
} from 'cesium';

export type BaseLayerId = 'normal' | 'satellite';

// No-token satellite source: Esri World Imagery served as plain XYZ tiles,
// with the Esri attribution surfaced via the imagery layer's credit so it
// shows up in Cesium's credit display.
const ESRI_WORLD_IMAGERY_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const ESRI_CREDIT =
  'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community';
const ESRI_MAX_ZOOM_LEVEL = 19;

function createOsmImageryLayer(): ImageryLayer {
  return new ImageryLayer(
    new OpenStreetMapImageryProvider({
      url: 'https://tile.openstreetmap.org/',
      credit: '© OpenStreetMap contributors',
    }),
  );
}

function createSatelliteImageryLayer(): ImageryLayer {
  return new ImageryLayer(
    new UrlTemplateImageryProvider({
      url: ESRI_WORLD_IMAGERY_URL,
      credit: ESRI_CREDIT,
      maximumLevel: ESRI_MAX_ZOOM_LEVEL,
    }),
  );
}

export interface UseLayersResult {
  baseLayer: BaseLayerId;
  setBaseLayer(id: BaseLayerId): void;
  /** Whether Cesium World Terrain is currently active. */
  terrainEnabled: boolean;
  /** False when no ion token is configured, so the UI can disable the toggle instead of it crashing. */
  terrainAvailable: boolean;
  setTerrainEnabled(enabled: boolean): void;
}

/**
 * Manages base imagery layer switching and an optional terrain toggle,
 * without ever requiring a Cesium ion token: imagery defaults to OSM with
 * Esri World Imagery as a token-free satellite alternative, and terrain
 * only activates Cesium World Terrain when `VITE_CESIUM_ION_TOKEN` is set —
 * otherwise it reports `terrainAvailable: false` and stays on the ellipsoid.
 */
export function useLayers(viewer: Viewer | null): UseLayersResult {
  const [baseLayer, setBaseLayerState] = useState<BaseLayerId>('normal');
  const [terrainEnabled, setTerrainEnabledState] = useState(false);
  // Invalidates a pending createWorldTerrainAsync() resolution if a newer
  // request supersedes it, or the component unmounts.
  const terrainRequestIdRef = useRef(0);

  const terrainAvailable = Boolean(import.meta.env.VITE_CESIUM_ION_TOKEN);

  useEffect(() => {
    return () => {
      terrainRequestIdRef.current += 1;
    };
  }, []);

  const setBaseLayer = useCallback(
    (id: BaseLayerId) => {
      if (!viewer) {
        return;
      }
      viewer.imageryLayers.removeAll(true);
      viewer.imageryLayers.add(
        id === 'satellite' ? createSatelliteImageryLayer() : createOsmImageryLayer(),
      );
      setBaseLayerState(id);
    },
    [viewer],
  );

  const setTerrainEnabled = useCallback(
    (enabled: boolean) => {
      if (!viewer) {
        return;
      }

      if (!enabled) {
        terrainRequestIdRef.current += 1;
        viewer.terrainProvider = new EllipsoidTerrainProvider();
        setTerrainEnabledState(false);
        return;
      }

      if (!terrainAvailable) {
        // No ion token: never attempt the request, just report unavailable.
        setTerrainEnabledState(false);
        return;
      }

      const requestId = ++terrainRequestIdRef.current;
      createWorldTerrainAsync()
        .then((terrainProvider) => {
          if (terrainRequestIdRef.current !== requestId) {
            return;
          }
          viewer.terrainProvider = terrainProvider;
          setTerrainEnabledState(true);
        })
        .catch(() => {
          if (terrainRequestIdRef.current !== requestId) {
            return;
          }
          setTerrainEnabledState(false);
        });
    },
    [viewer, terrainAvailable],
  );

  return { baseLayer, setBaseLayer, terrainEnabled, terrainAvailable, setTerrainEnabled };
}
