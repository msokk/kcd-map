import { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import gameData from '../data/markers.json';
import extraData from '../data/extraMarkers.json';
import treasureData from '../data/treasureMarkers.json';
import type { GameMarker, TreasureMarker } from '../data/types';
import { getMarkerIcon } from '../lib/icons';
import { markerLatLng } from '../lib/geo';
import { markerKey, type VisitedMap } from '../lib/visited';
import GamePopup from './popups/GamePopup';
import TreasurePopup from './popups/TreasurePopup';

// Original converted markers plus community-contributed additions.
const GAME_MARKERS = [...(gameData as GameMarker[]), ...(extraData as GameMarker[])];
const TREASURE_MARKERS = treasureData as TreasureMarker[];

// Visited markers stay visible but fade back so they read as "done".
const VISITED_OPACITY = 0.4;

interface Props {
  visible: Set<string>;
  visited: VisitedMap;
  onToggleVisited: (key: string) => void;
}

export default function GameMarkerLayer({ visible, visited, onToggleVisited }: Props) {
  const game = useMemo(() => GAME_MARKERS.filter((m) => visible.has(m.group)), [visible]);
  const treasure = useMemo(() => TREASURE_MARKERS.filter((m) => visible.has(m.group)), [visible]);

  return (
    <>
      {game.map((marker, i) => {
        const key = markerKey(marker.group, marker.coords);
        const visitedAt = visited[key];
        return (
          <Marker
            key={`g${i}`}
            position={markerLatLng(marker.coords)}
            icon={getMarkerIcon(marker.icon)}
            opacity={visitedAt ? VISITED_OPACITY : 1}
            keyboard={false}
          >
            <Popup>
              <GamePopup marker={marker} visitedAt={visitedAt} onToggleVisited={() => onToggleVisited(key)} />
            </Popup>
          </Marker>
        );
      })}
      {treasure.map((marker, i) => {
        const key = markerKey(marker.group, marker.coords);
        const visitedAt = visited[key];
        return (
          <Marker
            key={`t${i}`}
            position={markerLatLng(marker.coords)}
            icon={getMarkerIcon(marker.icon)}
            opacity={visitedAt ? VISITED_OPACITY : 1}
            keyboard={false}
          >
            <Popup>
              <TreasurePopup marker={marker} visitedAt={visitedAt} onToggleVisited={() => onToggleVisited(key)} />
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
