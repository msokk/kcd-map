import type { LatLngTuple } from 'leaflet';

// The original site stores game/treasure marker coords as [a, b] and places
// them at L.marker([b, a]); text labels are used as-is. Mirror that exactly so
// positions and share links stay identical.
export function markerLatLng(coords: [number, number]): LatLngTuple {
  return [coords[1], coords[0]];
}

export function textLatLng(coords: [number, number]): LatLngTuple {
  return [coords[0], coords[1]];
}

/** Share-link `marker=` value for a placed marker (lng,lat — matches legacy). */
export function shareCoords(lat: number, lng: number): string {
  return `${lng},${lat}`;
}

export function shareUrl(params: string): string {
  return `${window.location.origin}${window.location.pathname}?${params}`;
}
