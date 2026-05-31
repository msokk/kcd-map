// Marker categories shown in the sidebar, in the same order as the original
// site. `id` matches the marker `group`; `iconClass` maps to a background-image
// rule in the ported legacy stylesheet.
export interface Category {
  id: string;
  i18nKey: string;
  label: string;
  iconClass: string;
}

/** The "Cities Names" toggle controls the permanent text labels. */
export const TEXT_LABELS_ID = 'textmarkers';

export const CATEGORIES: Category[] = [
  { id: 'textmarkers', i18nKey: 'citiesNames', label: 'Cities Names', iconClass: 'cities' },
  { id: 'fast_travel', i18nKey: 'fast_travel', label: 'Fast Travel', iconClass: 'fast_travel' },
  { id: 'accident', i18nKey: 'accident', label: 'Accident', iconClass: 'accident' },
  { id: 'alchemy_bench', i18nKey: 'alchemy_bench', label: 'Alchemy Bench', iconClass: 'alchemy_bench' },
  { id: 'apothecary', i18nKey: 'apothecary', label: 'Apothecary', iconClass: 'apothecary' },
  { id: 'archery_range', i18nKey: 'archery_range', label: 'Archery Range', iconClass: 'archery_range' },
  { id: 'armourer', i18nKey: 'armourer', label: 'Armourer', iconClass: 'armourer' },
  { id: 'bandit_camp', i18nKey: 'bandit_camp', label: 'Bandit Camp', iconClass: 'bandit_camp' },
  { id: 'baker', i18nKey: 'baker', label: 'Baker', iconClass: 'baker' },
  { id: 'baths', i18nKey: 'baths', label: 'Baths', iconClass: 'baths' },
  { id: 'beehive', i18nKey: 'beehive', label: 'Beehive', iconClass: 'beehive' },
  { id: 'blacksmith', i18nKey: 'blacksmith', label: 'Blacksmith', iconClass: 'blacksmith' },
  { id: 'boar_hunting_spot', i18nKey: 'boar_hunting_spot', label: 'Boar Hunting Spot', iconClass: 'boar_hunting_spot' },
  { id: 'butcher', i18nKey: 'butcher', label: 'Butcher', iconClass: 'butcher' },
  { id: 'camp', i18nKey: 'camp', label: 'Camp', iconClass: 'camp' },
  { id: 'cave', i18nKey: 'cave', label: 'Cave', iconClass: 'cave' },
  { id: 'cobbler', i18nKey: 'cobbler', label: 'Cobbler', iconClass: 'cobbler' },
  { id: 'combat_arena', i18nKey: 'combat_arena', label: 'Combat Arena', iconClass: 'combat_arena' },
  { id: 'conciliation_cross', i18nKey: 'conciliation_cross', label: 'Conciliation Cross', iconClass: 'conciliation_cross' },
  { id: 'deer_hunting_spot', i18nKey: 'deer_hunting_spot', label: 'Deer Hunting Spot', iconClass: 'deer_hunting_spot' },
  { id: 'fishing_spot', i18nKey: 'fishing_spot', label: 'Fishing Spot', iconClass: 'fishing_spot' },
  { id: 'fish_trap', i18nKey: 'fish_trap', label: 'Fish Trap', iconClass: 'fish_trap' },
  { id: 'grave', i18nKey: 'grave', label: 'Grave', iconClass: 'grave' },
  { id: 'grindstone', i18nKey: 'grindstone', label: 'Grindstone', iconClass: 'grindstone' },
  { id: 'vegetable_shop', i18nKey: 'vegetable_shop', label: 'Grocer', iconClass: 'vegetable_shop' },
  { id: 'herbalist', i18nKey: 'herbalist', label: 'Herbalist', iconClass: 'herbalist' },
  { id: 'horse_trader', i18nKey: 'horse_trader', label: 'Horse Trader', iconClass: 'horse_trader' },
  { id: 'huntsman', i18nKey: 'huntsman', label: 'Huntsman', iconClass: 'huntsman' },
  { id: 'interesting_site', i18nKey: 'interesting_site', label: 'Interesting Site', iconClass: 'interesting_site' },
  { id: 'lodgings', i18nKey: 'lodgings', label: 'Lodgings', iconClass: 'lodgings' },
  { id: 'miller', i18nKey: 'miller', label: 'Miller', iconClass: 'miller' },
  { id: 'mine', i18nKey: 'mine', label: 'Mine', iconClass: 'mine' },
  { id: 'nest', i18nKey: 'nest', label: 'Nest', iconClass: 'nest' },
  { id: 'scribe', i18nKey: 'scribe', label: 'Scribe', iconClass: 'scribe' },
  { id: 'shrine', i18nKey: 'shrine', label: 'Shrine', iconClass: 'shrine' },
  { id: 'tailor', i18nKey: 'tailor', label: 'Tailor', iconClass: 'tailor' },
  { id: 'tanner', i18nKey: 'tanner', label: 'Tanner', iconClass: 'tanner' },
  { id: 'tavern', i18nKey: 'tavern', label: 'Tavern', iconClass: 'tavern' },
  { id: 'trader', i18nKey: 'trader', label: 'Trader', iconClass: 'trader' },
  { id: 'treasure_chest', i18nKey: 'treasure_chest', label: 'Treasure Chest', iconClass: 'treasure_chest' },
  { id: 'treasure_map', i18nKey: 'treasure_map', label: 'Treasure Map', iconClass: 'treasure_map' },
  { id: 'weaponsmith', i18nKey: 'weaponsmith', label: 'Weaponsmith', iconClass: 'weaponsmith' },
  { id: 'woodland_garden', i18nKey: 'woodland_garden', label: 'Woodland Garden', iconClass: 'woodland_garden' },
  { id: 'bed', i18nKey: 'bed', label: 'Your Bed', iconClass: 'your_bed' },
];

/** Marker groups present in the data but without a dedicated sidebar toggle. */
export const EXTRA_GROUPS = ['charcoal_burner', 'church', 'unknown'];
