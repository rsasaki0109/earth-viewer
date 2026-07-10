import { useEffect, useState } from 'react';
import type { Marker } from '../types/geo';
import { MARKER_NAME_MAX_LENGTH, MARKER_NOTE_MAX_LENGTH } from '../utils/markerStorage';
import { formatLatLon } from '../utils/format';
import type { MarkerPatch } from '../hooks/useMarkers';

export interface MarkerDetailProps {
  marker: Marker;
  onUpdate(patch: MarkerPatch): void;
  onDelete(): void;
  onFlyTo(): void;
}

/**
 * Editable detail view for a single marker: coordinates (read-only),
 * name/note (editable, length-limited), fly-to, and delete.
 */
export function MarkerDetail({ marker, onUpdate, onDelete, onFlyTo }: MarkerDetailProps): JSX.Element {
  const [name, setName] = useState(marker.name);
  const [note, setNote] = useState(marker.note);

  // Keep local editable fields in sync if a different marker's data arrives
  // (e.g. selecting another marker while this component instance persists).
  useEffect(() => {
    setName(marker.name);
    setNote(marker.note);
  }, [marker.id, marker.name, marker.note]);

  return (
    <div className="marker-detail">
      <p className="marker-detail__coords">{formatLatLon(marker.lat, marker.lon)}</p>

      <label className="marker-detail__field">
        <span>Name</span>
        <input
          type="text"
          value={name}
          maxLength={MARKER_NAME_MAX_LENGTH}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => onUpdate({ name })}
        />
      </label>

      <label className="marker-detail__field">
        <span>Note</span>
        <textarea
          value={note}
          maxLength={MARKER_NOTE_MAX_LENGTH}
          rows={3}
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => onUpdate({ note })}
        />
      </label>

      <div className="marker-detail__actions">
        <button type="button" onClick={onFlyTo}>
          Fly to
        </button>
        <button type="button" className="marker-detail__delete" onClick={onDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}
