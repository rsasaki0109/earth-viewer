import { useState } from 'react';
import type { GeocodeResult } from '../types/geocoding';
import type { Marker } from '../types/geo';
import type { MarkerPatch } from '../hooks/useMarkers';
import { SearchBox } from './SearchBox';
import { CoordinateJump } from './CoordinateJump';
import { MarkerList } from './MarkerList';

export interface LeftPanelProps {
  onSelectSearchResult(result: GeocodeResult): void;
  onCoordinateSubmit(lat: number, lon: number, height?: number): void;
  markers: Marker[];
  selectedMarkerId: string | null;
  onSelectMarker(marker: Marker): void;
  onUpdateMarker(id: string, patch: MarkerPatch): void;
  onDeleteMarker(id: string): void;
  onFlyToMarker(marker: Marker): void;
}

/**
 * Top-left app name + search (always visible), plus the coordinate-jump and
 * marker-list panel below it. The panel collapses into a hamburger-toggled
 * drawer on narrow/mobile viewports (see `.left-panel-drawer` in styles.css).
 */
export function LeftPanel({
  onSelectSearchResult,
  onCoordinateSubmit,
  markers,
  selectedMarkerId,
  onSelectMarker,
  onUpdateMarker,
  onDeleteMarker,
  onFlyToMarker,
}: LeftPanelProps): JSX.Element {
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <div className="left-column">
      <div className="app-header panel">
        <h1 className="app-title">EarthViewer</h1>
        <button
          type="button"
          className="icon-button hamburger"
          aria-label={panelOpen ? 'Hide panel' : 'Show panel'}
          aria-expanded={panelOpen}
          onClick={() => setPanelOpen((prev) => !prev)}
        >
          ☰
        </button>
      </div>

      <div className="panel">
        <SearchBox onSelectResult={onSelectSearchResult} />
      </div>

      <div className={`left-panel-drawer${panelOpen ? ' left-panel-drawer--open' : ''}`}>
        <div className="panel">
          <CoordinateJump onSubmit={onCoordinateSubmit} />
        </div>
        <div className="panel marker-panel">
          <h2 className="panel-heading">Markers</h2>
          <MarkerList
            markers={markers}
            selectedId={selectedMarkerId}
            onSelect={onSelectMarker}
            onUpdate={onUpdateMarker}
            onDelete={onDeleteMarker}
            onFlyTo={onFlyToMarker}
          />
        </div>
      </div>
    </div>
  );
}
