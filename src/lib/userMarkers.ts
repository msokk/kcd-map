import type { UserMarker } from '../data/types';

const STORAGE_KEY = 'mapUserMarkers';

let counter = 0;
function nextId(): string {
  counter += 1;
  return `u${Date.now()}_${counter}`;
}

// Accepts both the new schema and the original site's schema
// ({ coords: { x, y }, iconvalue, title, desc }) so old backups still import.
function normalize(raw: unknown): UserMarker | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, any>;
  let lat: number;
  let lng: number;
  if (r.coords && typeof r.coords === 'object') {
    lat = Number(r.coords.x);
    lng = Number(r.coords.y);
  } else {
    lat = Number(r.lat);
    lng = Number(r.lng);
  }
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const iconValue = Number(r.iconValue ?? r.iconvalue ?? 0) || 0;
  return {
    id: typeof r.id === 'string' ? r.id : nextId(),
    lat,
    lng,
    title: String(r.title ?? r.name ?? ''),
    desc: String(r.desc ?? ''),
    iconValue,
  };
}

export function loadUserMarkers(): UserMarker[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalize).filter((m): m is UserMarker => m !== null);
  } catch {
    return [];
  }
}

export function saveUserMarkers(markers: UserMarker[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(markers));
}

export function createUserMarker(input: Omit<UserMarker, 'id'>): UserMarker {
  return { ...input, id: nextId() };
}
