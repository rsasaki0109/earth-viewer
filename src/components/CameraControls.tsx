import { useEffect, useState } from 'react';
import type { Viewer } from 'cesium';
import type { UseCameraControlsResult } from '../hooks/useCameraControls';
import type { UseGeolocationResult } from '../hooks/useGeolocation';
import type { Marker } from '../types/geo';

export interface CameraControlsProps {
  viewer: Viewer | null;
  cameraControls: UseCameraControlsResult;
  geolocation: UseGeolocationResult;
  selectedMarker: Marker | null;
}

const ZOOM_FRACTION = 0.5;

/**
 * Vertical stack of icon-only camera action buttons: zoom in/out, current
 * location, home (whole earth), north-up reset, top-down preset, and
 * fly-to-selected-marker. Geolocation failures show a dismissible message
 * instead of crashing.
 */
export function CameraControls({ viewer, cameraControls, geolocation, selectedMarker }: CameraControlsProps): JSX.Element {
  const [errorDismissed, setErrorDismissed] = useState(false);

  useEffect(() => {
    if (geolocation.status === 'error') {
      setErrorDismissed(false);
    }
  }, [geolocation.status, geolocation.error]);

  const handleZoomIn = (): void => {
    if (!viewer) return;
    viewer.camera.zoomIn(viewer.camera.positionCartographic.height * ZOOM_FRACTION);
  };

  const handleZoomOut = (): void => {
    if (!viewer) return;
    viewer.camera.zoomOut(viewer.camera.positionCartographic.height * ZOOM_FRACTION);
  };

  const showGeolocationError = geolocation.status === 'error' && !errorDismissed;

  return (
    <div className="camera-controls">
      <div className="camera-controls__group">
        <button type="button" className="icon-button" aria-label="Zoom in" onClick={handleZoomIn}>
          +
        </button>
        <button type="button" className="icon-button" aria-label="Zoom out" onClick={handleZoomOut}>
          −
        </button>
      </div>

      <div className="camera-controls__group">
        <button
          type="button"
          className="icon-button"
          aria-label="Go to current location"
          title="Current location"
          onClick={() => geolocation.request()}
          disabled={geolocation.status === 'prompting'}
        >
          📍
        </button>
        <button
          type="button"
          className="icon-button"
          aria-label="Fly to whole earth view"
          title="Whole earth"
          onClick={() => cameraControls.flyHome()}
        >
          🌐
        </button>
        <button
          type="button"
          className="icon-button"
          aria-label="Reset north-up orientation"
          title="Reset north"
          onClick={() => cameraControls.resetNorth()}
        >
          🧭
        </button>
        <button
          type="button"
          className="icon-button"
          aria-label="Top-down view"
          title="Top-down view"
          onClick={() => cameraControls.flyTopDown()}
        >
          ⬇️
        </button>
        <button
          type="button"
          className="icon-button"
          aria-label="Fly to selected marker"
          title="Fly to selected marker"
          disabled={!selectedMarker}
          onClick={() => {
            if (selectedMarker) {
              cameraControls.flyToLatLon(selectedMarker.lat, selectedMarker.lon);
            }
          }}
        >
          🎯
        </button>
      </div>

      {showGeolocationError && (
        <div className="camera-controls__error" role="alert">
          <span>{geolocation.error}</span>
          <button
            type="button"
            className="camera-controls__dismiss"
            aria-label="Dismiss location error"
            onClick={() => setErrorDismissed(true)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
