// The legacy Leaflet plugins below reference a global `L`. Expose the bundled
// Leaflet instance globally before those plugins evaluate. This module must be
// imported before any vendored plugin.
import L from 'leaflet';

declare global {
  interface Window {
    L: typeof L;
  }
}

window.L = L;

export default L;
