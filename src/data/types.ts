export interface KcdItem {
  item: string;
  qnt: string | number;
}

/** A marker extracted from the game (markers.json). */
export interface GameMarker {
  name: string;
  group: string;
  icon: string;
  coords: [number, number];
  desc?: string;
  items?: string;
  kcditems?: KcdItem[];
}

/** A city/region name label (textMarkers.json). */
export interface TextMarker {
  name: string;
  coords: [number, number];
}

/** A curated treasure marker with requirements (treasureMarkers.json). */
export interface TreasureMarker {
  name: string;
  group: string;
  icon: string;
  coords: [number, number];
  desc?: string;
  desc2?: string;
  req?: string;
  level?: string;
  skillbook?: string;
  bookname?: string;
  skillbooklvl?: string;
  items?: string[];
  verified?: string;
}

/** A user-placed marker persisted to localStorage. */
export interface UserMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  desc: string;
  /** Index into the addable icon palette. */
  iconValue: number;
}
