import L from 'leaflet';
import { ICONS_URL } from './constants';

const iconCache = new Map<string, L.Icon>();

/** Standard 36x36 game/treasure marker icon, centred on its location. */
export function getMarkerIcon(icon: string): L.Icon {
  const cached = iconCache.get(icon);
  if (cached) return cached;
  const markerIcon = L.icon({
    iconUrl: `${ICONS_URL}${icon}.png`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
  iconCache.set(icon, markerIcon);
  return markerIcon;
}

interface PaletteIcon {
  icon: string;
  width: number;
  height: number;
}

// Icons selectable when adding a custom marker (order preserved from the
// original site so existing shared-marker links keep the same icon index).
export const MARKER_PALETTE: PaletteIcon[] = [
  { icon: 'arrow', width: 36, height: 36 },
  { icon: 'accident', width: 36, height: 36 },
  { icon: 'alchemy_bench', width: 36, height: 36 },
  { icon: 'apothecary', width: 36, height: 36 },
  { icon: 'archery_range', width: 36, height: 36 },
  { icon: 'armourer', width: 36, height: 36 },
  { icon: 'baker', width: 36, height: 36 },
  { icon: 'bandit_camp', width: 36, height: 36 },
  { icon: 'baths', width: 36, height: 36 },
  { icon: 'beehive', width: 36, height: 36 },
  { icon: 'blacksmith', width: 36, height: 36 },
  { icon: 'boar_hunting_spot', width: 36, height: 36 },
  { icon: 'butcher', width: 36, height: 36 },
  { icon: 'camp', width: 36, height: 36 },
  { icon: 'cave', width: 36, height: 36 },
  { icon: 'charcoal_burner', width: 36, height: 36 },
  { icon: 'cobbler', width: 36, height: 36 },
  { icon: 'combat_arena', width: 36, height: 36 },
  { icon: 'conciliation_cross', width: 36, height: 36 },
  { icon: 'deer_hunting_spot', width: 36, height: 36 },
  { icon: 'fast_travel', width: 64, height: 64 },
  { icon: 'fish_trap', width: 36, height: 36 },
  { icon: 'fishing_spot', width: 36, height: 36 },
  { icon: 'grave', width: 36, height: 36 },
  { icon: 'grindstone', width: 36, height: 36 },
  { icon: 'grocer', width: 36, height: 36 },
  { icon: 'herbalist', width: 36, height: 36 },
  { icon: 'home', width: 36, height: 36 },
  { icon: 'horse_trader', width: 36, height: 36 },
  { icon: 'huntsman', width: 36, height: 36 },
  { icon: 'interesting_site', width: 36, height: 36 },
  { icon: 'lodgings', width: 36, height: 36 },
  { icon: 'miller', width: 36, height: 36 },
  { icon: 'nest', width: 36, height: 36 },
  { icon: 'scribe', width: 36, height: 36 },
  { icon: 'shrine', width: 36, height: 36 },
  { icon: 'tailor', width: 36, height: 36 },
  { icon: 'tanner', width: 36, height: 36 },
  { icon: 'tavern', width: 36, height: 36 },
  { icon: 'trader', width: 36, height: 36 },
  { icon: 'treasure_chest', width: 36, height: 36 },
  { icon: 'treasure_map', width: 36, height: 36 },
  { icon: 'treasure_map_alt', width: 36, height: 36 },
  { icon: 'weaponsmith', width: 36, height: 36 },
  { icon: 'woodland_garden', width: 36, height: 36 },
  { icon: 'belladonna', width: 36, height: 36 },
  { icon: 'chamomile', width: 36, height: 36 },
  { icon: 'comfrey', width: 36, height: 36 },
  { icon: 'dandelion', width: 36, height: 36 },
  { icon: 'eyebright', width: 36, height: 36 },
  { icon: 'herb_paris', width: 36, height: 36 },
  { icon: 'marigold', width: 36, height: 36 },
  { icon: 'mint', width: 36, height: 36 },
  { icon: 'nettle', width: 36, height: 36 },
  { icon: 'poppy', width: 36, height: 36 },
  { icon: 'sage', width: 36, height: 36 },
  { icon: 'st_johns_wort', width: 36, height: 36 },
  { icon: 'thistle', width: 36, height: 36 },
  { icon: 'valerian', width: 36, height: 36 },
  { icon: 'wormwood', width: 36, height: 36 },
  { icon: 'marker_a', width: 36, height: 36 },
  { icon: 'marker_b', width: 36, height: 36 },
  { icon: 'marker_c', width: 36, height: 36 },
  { icon: 'star', width: 36, height: 36 },
  { icon: 'exclamation', width: 36, height: 36 },
];

const paletteIconCache = new Map<number, L.Icon>();

/** Build the Leaflet icon for a palette index (used by user markers). */
export function getPaletteIcon(index: number): L.Icon {
  const cached = paletteIconCache.get(index);
  if (cached) return cached;
  const { icon, width, height } = MARKER_PALETTE[index] ?? MARKER_PALETTE[0];
  const markerIcon = L.icon({
    iconUrl: `${ICONS_URL}${icon}.png`,
    iconSize: [width, height],
    iconAnchor: [width / 2, height / 2],
    popupAnchor: [0, -height / 2],
  });
  paletteIconCache.set(index, markerIcon);
  return markerIcon;
}

export function paletteIconUrl(index: number): string {
  const { icon } = MARKER_PALETTE[index] ?? MARKER_PALETTE[0];
  return `${ICONS_URL}${icon}.png`;
}
