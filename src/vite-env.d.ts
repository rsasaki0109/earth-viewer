/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional Cesium ion access token. Leave unset to run without ion. */
  readonly VITE_CESIUM_ION_TOKEN?: string;
  /** Base path used by Vite/GitHub Pages. */
  readonly VITE_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
