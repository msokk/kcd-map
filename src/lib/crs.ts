import L from 'leaflet';

// Custom simple CRS from the original site: pixel coordinates with a 1/16
// scale and a 256 offset so map coordinates line up with in-game coordinates.
export const MySimpleCRS = L.extend({}, L.CRS.Simple, {
  transformation: new L.Transformation(1 / 16, 0, -1 / 16, 256),
}) as L.CRS;
