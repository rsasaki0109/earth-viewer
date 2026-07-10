import { useRef, type ReactNode } from 'react';
import { useCesiumViewer } from '../hooks/useCesiumViewer';
import { CesiumContext } from './useCesium';

export interface CesiumProviderProps {
  children?: ReactNode;
}

/**
 * Owns the globe's container `<div>` and the single Cesium `Viewer`
 * instance, and exposes both through context so any descendant can reach
 * the viewer without threading it through props. `children` are rendered
 * as overlay content on top of the globe (e.g. loading state in Stage 2,
 * UI panels in Stage 3).
 */
export function CesiumProvider({ children }: CesiumProviderProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const { viewer, isReady } = useCesiumViewer(containerRef);

  return (
    <CesiumContext.Provider value={{ viewer, isReady }}>
      <div ref={containerRef} className="globe-container" />
      {children}
    </CesiumContext.Provider>
  );
}
