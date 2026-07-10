import { createContext, useContext } from 'react';
import type { Viewer } from 'cesium';

export interface CesiumContextValue {
  /** The Cesium Viewer instance, or `null` until it has been created. */
  viewer: Viewer | null;
  /** True once the initial globe imagery has finished loading. */
  isReady: boolean;
}

export const CesiumContext = createContext<CesiumContextValue | null>(null);

/** Access the shared Cesium `Viewer`/readiness state. Must be used within `CesiumProvider`. */
export function useCesium(): CesiumContextValue {
  const value = useContext(CesiumContext);
  if (!value) {
    throw new Error('useCesium must be used within a CesiumProvider');
  }
  return value;
}
