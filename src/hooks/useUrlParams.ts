import { useCallback, useState } from 'react';
import type { CameraView } from '../types/geo';
import { parseUrlParams, serializeCameraParams } from '../utils/urlParams';

export interface UseUrlParamsResult {
  /** The camera view parsed from `window.location.search` at mount time. */
  initialView: Partial<CameraView>;
  /** Replaces the current URL's query string with the given view (no new history entry). */
  updateUrl(view: CameraView): void;
}

/**
 * Reads the initial camera view from the URL once on mount, and exposes a
 * way to keep the URL in sync afterwards via `history.replaceState` (so
 * panning the globe doesn't spam browser history).
 */
export function useUrlParams(): UseUrlParamsResult {
  const [initialView] = useState<Partial<CameraView>>(() =>
    typeof window === 'undefined' ? {} : parseUrlParams(window.location.search),
  );

  const updateUrl = useCallback((view: CameraView) => {
    if (typeof window === 'undefined') {
      return;
    }
    const params = serializeCameraParams(view);
    const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
    window.history.replaceState(null, '', newUrl);
  }, []);

  return { initialView, updateUrl };
}
