import type { UseLayersResult } from '../hooks/useLayers';

export interface LayerSwitcherProps {
  layers: UseLayersResult;
}

/**
 * Base imagery (normal/satellite) and terrain toggles. Terrain is disabled
 * (never crashes) when `terrainAvailable` is false, with a short hint.
 */
export function LayerSwitcher({ layers }: LayerSwitcherProps): JSX.Element {
  const { baseLayer, setBaseLayer, terrainEnabled, terrainAvailable, setTerrainEnabled } = layers;

  return (
    <div className="layer-switcher panel">
      <h2 className="panel-heading">Map layers</h2>

      <div className="layer-switcher__group" role="group" aria-label="Base map">
        <button
          type="button"
          className={`layer-switcher__option${baseLayer === 'normal' ? ' layer-switcher__option--active' : ''}`}
          aria-pressed={baseLayer === 'normal'}
          onClick={() => setBaseLayer('normal')}
        >
          Normal
        </button>
        <button
          type="button"
          className={`layer-switcher__option${baseLayer === 'satellite' ? ' layer-switcher__option--active' : ''}`}
          aria-pressed={baseLayer === 'satellite'}
          onClick={() => setBaseLayer('satellite')}
        >
          Satellite
        </button>
      </div>

      <label className="layer-switcher__terrain">
        <input
          type="checkbox"
          checked={terrainEnabled}
          disabled={!terrainAvailable}
          onChange={(e) => setTerrainEnabled(e.target.checked)}
        />
        <span>Terrain</span>
      </label>
      {!terrainAvailable && <p className="layer-switcher__hint">Terrain requires a Cesium ion token.</p>}
    </div>
  );
}
