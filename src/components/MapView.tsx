import { MapContainer, TileLayer } from 'react-leaflet';
import type { LatLngBoundsExpression } from 'leaflet';
import { MySimpleCRS } from '../lib/crs';
import {
  INITIAL_CENTER,
  INITIAL_ZOOM,
  MAP_BOUNDS,
  MAP_MAX_ZOOM,
  MAP_MIN_ZOOM,
  MAX_NATIVE_ZOOM,
  TILE_SIZE,
  TILES_URL,
} from '../lib/constants';
import MapControls from './MapControls';
import GameMarkerLayer from './GameMarkerLayer';
import TextLabels from './TextLabels';
import UserMarkerLayer from './UserMarkerLayer';
import AddMarker from './AddMarker';
import UrlMarkers from './UrlMarkers';
import LivePlayerMarker from './LivePlayerMarker';
import type { UserMarker } from '../data/types';
import type { VisitedMap } from '../lib/visited';

const TILE_BOUNDS: LatLngBoundsExpression = [
  [0, 0],
  [MAP_BOUNDS, MAP_BOUNDS],
];
const MAX_BOUNDS: LatLngBoundsExpression = [
  [-3000, -3000],
  [7000, 7000],
];

interface Props {
  visible: Set<string>;
  showTextLabels: boolean;
  userVisible: boolean;
  userMarkers: UserMarker[];
  visited: VisitedMap;
  onToggleVisited: (key: string) => void;
  onAddUserMarker: (input: Omit<UserMarker, 'id'>) => UserMarker;
  onUpdateUserMarker: (id: string, patch: Partial<UserMarker>) => void;
  onRemoveUserMarker: (id: string) => void;
}

export default function MapView({
  visible,
  showTextLabels,
  userVisible,
  userMarkers,
  visited,
  onToggleVisited,
  onAddUserMarker,
  onUpdateUserMarker,
  onRemoveUserMarker,
}: Props) {
  return (
    <MapContainer
      id="map"
      className="sidebar-map"
      crs={MySimpleCRS}
      center={INITIAL_CENTER}
      zoom={INITIAL_ZOOM}
      minZoom={MAP_MIN_ZOOM}
      maxZoom={MAP_MAX_ZOOM}
      maxBounds={MAX_BOUNDS}
      zoomControl={false}
      scrollWheelZoom={false}
      closePopupOnClick={false}
    >
      <TileLayer
        url={TILES_URL}
        tileSize={TILE_SIZE}
        maxNativeZoom={MAX_NATIVE_ZOOM}
        minZoom={MAP_MIN_ZOOM}
        maxZoom={MAP_MAX_ZOOM}
        noWrap
        bounds={TILE_BOUNDS}
      />
      <MapControls />
      <TextLabels show={showTextLabels} />
      <GameMarkerLayer visible={visible} visited={visited} onToggleVisited={onToggleVisited} />
      {userVisible && (
        <UserMarkerLayer
          markers={userMarkers}
          onUpdate={onUpdateUserMarker}
          onRemove={onRemoveUserMarker}
        />
      )}
      <AddMarker onAdd={onAddUserMarker} />
      <UrlMarkers onAdd={onAddUserMarker} />
      <LivePlayerMarker />
    </MapContainer>
  );
}
