import type { Marker } from '../types/geo';
import type { MarkerPatch } from '../hooks/useMarkers';
import { MarkerDetail } from './MarkerDetail';

export interface MarkerListProps {
  markers: Marker[];
  selectedId: string | null;
  /** Click on a list entry: flies the camera there and selects it. */
  onSelect(marker: Marker): void;
  onUpdate(id: string, patch: MarkerPatch): void;
  onDelete(id: string): void;
  onFlyTo(marker: Marker): void;
}

/**
 * Saved-marker list; the selected entry expands inline to show
 * `MarkerDetail` for editing/deleting.
 */
export function MarkerList({ markers, selectedId, onSelect, onUpdate, onDelete, onFlyTo }: MarkerListProps): JSX.Element {
  if (markers.length === 0) {
    return <p className="marker-list__empty">No markers yet. Click the globe or search to add one.</p>;
  }

  return (
    <ul className="marker-list">
      {markers.map((marker) => {
        const isSelected = marker.id === selectedId;
        return (
          <li key={marker.id} className={`marker-list__item${isSelected ? ' marker-list__item--selected' : ''}`}>
            <button
              type="button"
              className="marker-list__button"
              aria-expanded={isSelected}
              onClick={() => onSelect(marker)}
            >
              {marker.name || 'Untitled marker'}
            </button>
            {isSelected && (
              <MarkerDetail
                marker={marker}
                onUpdate={(patch) => onUpdate(marker.id, patch)}
                onDelete={() => onDelete(marker.id)}
                onFlyTo={() => onFlyTo(marker)}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
