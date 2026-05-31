import { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import gameData from '../data/markers.json';
import treasureData from '../data/treasureMarkers.json';
import type { GameMarker, TreasureMarker } from '../data/types';
import { getMarkerIcon } from '../lib/icons';
import { markerLatLng } from '../lib/geo';
import GamePopup from './popups/GamePopup';
import TreasurePopup from './popups/TreasurePopup';

const GAME_MARKERS = gameData as GameMarker[];
const TREASURE_MARKERS = treasureData as TreasureMarker[];

interface Props {
  visible: Set<string>;
}

export default function GameMarkerLayer({ visible }: Props) {
  const game = useMemo(() => GAME_MARKERS.filter((m) => visible.has(m.group)), [visible]);
  const treasure = useMemo(() => TREASURE_MARKERS.filter((m) => visible.has(m.group)), [visible]);

  return (
    <>
      {game.map((marker, i) => (
        <Marker key={`g${i}`} position={markerLatLng(marker.coords)} icon={getMarkerIcon(marker.icon)}>
          <Popup>
            <GamePopup marker={marker} />
          </Popup>
        </Marker>
      ))}
      {treasure.map((marker, i) => (
        <Marker key={`t${i}`} position={markerLatLng(marker.coords)} icon={getMarkerIcon(marker.icon)}>
          <Popup>
            <TreasurePopup marker={marker} />
          </Popup>
        </Marker>
      ))}
    </>
  );
}
