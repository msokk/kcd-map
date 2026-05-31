const STORAGE_KEY = 'kcdVisited';

/** Map of marker key -> timestamp (ms) when it was marked visited. */
export type VisitedMap = Record<string, number>;

/**
 * Stable identity for a predefined marker. Data is static, so group + raw
 * coordinates uniquely and durably identify a marker across sessions.
 */
export function markerKey(group: string, coords: [number, number]): string {
  return `${group}@${coords[0]},${coords[1]}`;
}

export function loadVisited(): VisitedMap {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as VisitedMap) : {};
  } catch {
    return {};
  }
}

export function saveVisited(visited: VisitedMap): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(visited));
}

export const VISITED_STORAGE_KEY = STORAGE_KEY;
