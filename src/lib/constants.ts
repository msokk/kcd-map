// Asset base path (matches Vite `base`, e.g. "/kcd-map/").
export const BASE = import.meta.env.BASE_URL;

export const ICONS_URL = `${BASE}assets/images/`;
export const TILES_URL = `${BASE}map/{z}_{x}_{y}.jpg`;

// Map geometry, carried over verbatim from the original site.
export const MAP_BOUNDS = 4096;
export const MAP_MIN_ZOOM = 1;
export const MAP_MAX_ZOOM = 5;
export const MAX_NATIVE_ZOOM = 5;
export const TILE_SIZE = 256;
export const INITIAL_CENTER: [number, number] = [2048, 2048];
export const INITIAL_ZOOM = 2;

export const APP_VERSION = '2.0.0';
