import { useEffect, useRef, useState } from 'react';
import type { CameraView } from '../types/geo';
import { buildShareUrl } from '../utils/urlParams';

export interface ShareButtonProps {
  getCurrentView(): CameraView | null;
}

type CopyState = 'idle' | 'copied' | 'manual';

/**
 * Copies a shareable URL (current camera view encoded as query params) to
 * the clipboard. Uses the async Clipboard API when available, falling back
 * to a hidden-textarea `execCommand('copy')`, and finally to just showing
 * the URL for manual copying if both fail.
 */
export function ShareButton({ getCurrentView }: ShareButtonProps): JSX.Element {
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [manualUrl, setManualUrl] = useState('');
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const scheduleReset = (): void => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }
    resetTimerRef.current = setTimeout(() => {
      setCopyState('idle');
    }, 2500);
  };

  const copyViaTextarea = (url: string): boolean => {
    const textarea = document.createElement('textarea');
    textarea.value = url;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    let succeeded = false;
    try {
      succeeded = document.execCommand('copy');
    } catch {
      succeeded = false;
    }
    document.body.removeChild(textarea);
    return succeeded;
  };

  const handleShare = async (): Promise<void> => {
    const view = getCurrentView();
    if (!view) {
      return;
    }
    const url = buildShareUrl(window.location.href, view);

    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(url);
        setCopyState('copied');
        scheduleReset();
        return;
      } catch {
        // Fall through to the legacy fallback below.
      }
    }

    if (copyViaTextarea(url)) {
      setCopyState('copied');
      scheduleReset();
      return;
    }

    setManualUrl(url);
    setCopyState('manual');
  };

  return (
    <div className="share-button">
      <button type="button" onClick={() => void handleShare()}>
        Share
      </button>
      {copyState === 'copied' && (
        <span className="share-button__toast" role="status">
          Link copied!
        </span>
      )}
      {copyState === 'manual' && (
        <div className="share-button__manual" role="status">
          <label htmlFor="share-manual-url">Copy this link:</label>
          <input id="share-manual-url" type="text" readOnly value={manualUrl} onFocus={(e) => e.target.select()} />
        </div>
      )}
    </div>
  );
}
