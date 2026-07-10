/** A plain latitude/longitude pair in degrees. */
export interface LatLon {
  lat: number;
  lon: number;
}

/** A full Cesium camera view: position plus orientation, in degrees/meters. */
export interface CameraView extends LatLon {
  /** Camera height above the ellipsoid, in meters. */
  height: number;
  /** Camera heading, in degrees (0 = north). */
  heading: number;
  /** Camera pitch, in degrees (0 = horizon, -90 = straight down). */
  pitch: number;
}

/** A user-created point of interest, persisted to LocalStorage. */
export interface Marker extends LatLon {
  id: string;
  name: string;
  note: string;
  /** Epoch milliseconds. */
  createdAt: number;
}
