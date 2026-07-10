import { useEffect, useRef, useState } from 'react';
import { useCesium } from '../context/useCesium';
import { useMarkers } from '../hooks/useMarkers';
import { useCameraControls } from '../hooks/useCameraControls';
import { useLayers } from '../hooks/useLayers';
import { useUrlParams } from '../hooks/useUrlParams';
import { useGeolocation } from '../hooks/useGeolocation';
import { useTheme } from '../hooks/useTheme';
import type { GeocodeResult } from '../types/geocoding';
import type { Marker } from '../types/geo';
import { LeftPanel } from './LeftPanel';
import { LayerSwitcher } from './LayerSwitcher';
import { CameraControls } from './CameraControls';
import { InfoBar } from './InfoBar';
import { ShareButton } from './ShareButton';
import { ThemeToggle } from './ThemeToggle';
import { MarkerEntities } from './MarkerEntities';

const DEFAULT_MARKER_NAME = 'Marker';

/**
 * Top-level UI layer: composes every panel/control, wires them to the
 * Stage 2 hooks, and owns the small bits of cross-cutting state (selected
 * marker, URL-params-on-load, geolocation-success side effects).
 */
export function EarthViewerUI(): JSX.Element {
  const { viewer, isReady } = useCesium();
  const markers = useMarkers();
  const cameraControls = useCameraControls(viewer);
  const layers = useLayers(viewer);
  const { initialView } = useUrlParams();
  const geolocation = useGeolocation();
  const { theme, toggleTheme } = useTheme();

  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);

  // `cameraControls`/`markers` are fresh object literals every render, so
  // effects that call into them (but shouldn't re-run just because the
  // parent re-rendered) read the latest functions via these refs instead of
  // depending on the whole object.
  const cameraControlsRef = useRef(cameraControls);
  cameraControlsRef.current = cameraControls;
  const markersRef = useRef(markers);
  markersRef.current = markers;

  // Fly to (and drop a marker at) the view encoded in the URL, once, after
  // the viewer is ready.
  const appliedInitialViewRef = useRef(false);
  useEffect(() => {
    if (appliedInitialViewRef.current || !isReady) {
      return;
    }
    const { lat, lon, height, heading, pitch } = initialView;
    if (lat === undefined || lon === undefined) {
      return;
    }
    appliedInitialViewRef.current = true;

    if (height !== undefined && heading !== undefined && pitch !== undefined) {
      cameraControlsRef.current.flyToView({ lat, lon, height, heading, pitch });
    } else {
      cameraControlsRef.current.flyToLatLon(lat, lon, height);
    }
    const marker = markersRef.current.addMarker({ name: 'Shared location', lat, lon });
    setSelectedMarkerId(marker.id);
  }, [isReady, initialView]);

  // On a successful geolocation request, fly there and drop/select a marker.
  // Guarded by a ref (rather than relying on the effect running once) so
  // React 18 StrictMode's dev-only double-invoke of effects without a
  // cleanup function can't add the marker twice for the same position.
  const appliedGeoPositionRef = useRef<typeof geolocation.position>(null);
  useEffect(() => {
    if (geolocation.status !== 'success' || !geolocation.position) {
      return;
    }
    if (appliedGeoPositionRef.current === geolocation.position) {
      return;
    }
    appliedGeoPositionRef.current = geolocation.position;
    const { lat, lon } = geolocation.position;
    cameraControlsRef.current.flyToLatLon(lat, lon);
    const marker = markersRef.current.addMarker({ name: 'My location', lat, lon });
    setSelectedMarkerId(marker.id);
  }, [geolocation.status, geolocation.position]);

  const selectedMarker: Marker | null = markers.markers.find((m) => m.id === selectedMarkerId) ?? null;

  const handleSelectSearchResult = (result: GeocodeResult): void => {
    cameraControls.flyToLatLon(result.lat, result.lon);
    const marker = markers.addMarker({ name: result.label, lat: result.lat, lon: result.lon });
    setSelectedMarkerId(marker.id);
  };

  const handleCoordinateSubmit = (lat: number, lon: number, height?: number): void => {
    cameraControls.flyToLatLon(lat, lon, height);
    const marker = markers.addMarker({ name: DEFAULT_MARKER_NAME, lat, lon });
    setSelectedMarkerId(marker.id);
  };

  const handleSelectMarkerFromList = (marker: Marker): void => {
    cameraControls.flyToLatLon(marker.lat, marker.lon);
    setSelectedMarkerId(marker.id);
  };

  const handleSelectMarkerFromGlobe = (id: string): void => {
    setSelectedMarkerId(id);
  };

  const handleAddMarkerFromGlobe = (lat: number, lon: number): void => {
    const marker = markers.addMarker({ name: DEFAULT_MARKER_NAME, lat, lon });
    setSelectedMarkerId(marker.id);
  };

  const handleDeleteMarker = (id: string): void => {
    markers.removeMarker(id);
    setSelectedMarkerId((prev) => (prev === id ? null : prev));
  };

  const handleFlyToMarker = (marker: Marker): void => {
    cameraControls.flyToLatLon(marker.lat, marker.lon);
  };

  return (
    <>
      {!isReady && <div className="loading-overlay">Loading globe…</div>}

      <MarkerEntities
        viewer={viewer}
        markers={markers.markers}
        selectedMarkerId={selectedMarkerId}
        onSelectMarker={handleSelectMarkerFromGlobe}
        onAddMarker={handleAddMarkerFromGlobe}
      />

      <LeftPanel
        onSelectSearchResult={handleSelectSearchResult}
        onCoordinateSubmit={handleCoordinateSubmit}
        markers={markers.markers}
        selectedMarkerId={selectedMarkerId}
        onSelectMarker={handleSelectMarkerFromList}
        onUpdateMarker={markers.updateMarker}
        onDeleteMarker={handleDeleteMarker}
        onFlyToMarker={handleFlyToMarker}
      />

      <div className="top-right-controls">
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
        <ShareButton getCurrentView={cameraControls.getCurrentView} />
        <LayerSwitcher layers={layers} />
      </div>

      <CameraControls
        viewer={viewer}
        cameraControls={cameraControls}
        geolocation={geolocation}
        selectedMarker={selectedMarker}
      />

      <InfoBar viewer={viewer} baseLayer={layers.baseLayer} />
    </>
  );
}
