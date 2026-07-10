import { useState, type FormEvent } from 'react';
import { parseCoordinate, validateCoordinates } from '../utils/coordinates';

export interface CoordinateJumpProps {
  /** Called with a validated lat/lon (and optional height) on submit. */
  onSubmit(lat: number, lon: number, height?: number): void;
}

/**
 * Manual lat/lon(/height) entry. Values are parsed and range-validated with
 * the shared coordinate utils; invalid input surfaces an inline error
 * instead of submitting.
 */
export function CoordinateJump({ onSubmit }: CoordinateJumpProps): JSX.Element {
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [height, setHeight] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const latValue = parseCoordinate(lat);
    const lonValue = parseCoordinate(lon);
    if (latValue === null || lonValue === null) {
      setError('Latitude and longitude must be numbers.');
      return;
    }

    const validation = validateCoordinates(latValue, lonValue);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }

    let heightValue: number | undefined;
    if (height.trim() !== '') {
      const parsedHeight = parseCoordinate(height);
      if (parsedHeight === null) {
        setError('Height must be a number.');
        return;
      }
      heightValue = parsedHeight;
    }

    setError(null);
    onSubmit(validation.lat, validation.lon, heightValue);
  };

  return (
    <form className="coordinate-jump" onSubmit={handleSubmit}>
      <h2 className="panel-heading">Go to coordinates</h2>
      <div className="coordinate-jump__fields">
        <label className="coordinate-jump__field">
          <span>Latitude</span>
          <input
            type="text"
            inputMode="decimal"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="-90 to 90"
          />
        </label>
        <label className="coordinate-jump__field">
          <span>Longitude</span>
          <input
            type="text"
            inputMode="decimal"
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            placeholder="-180 to 180"
          />
        </label>
        <label className="coordinate-jump__field">
          <span>Height (m, optional)</span>
          <input
            type="text"
            inputMode="decimal"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="e.g. 10000"
          />
        </label>
      </div>
      {error && (
        <p className="coordinate-jump__error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="coordinate-jump__submit">
        Go
      </button>
    </form>
  );
}
