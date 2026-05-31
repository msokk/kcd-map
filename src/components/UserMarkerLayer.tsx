import { Marker, Popup } from 'react-leaflet';
import type { UserMarker } from '../data/types';
import { getPaletteIcon } from '../lib/icons';
import UserMarkerPopup from './popups/UserMarkerPopup';

interface Props {
  markers: UserMarker[];
  onUpdate: (id: string, patch: Partial<UserMarker>) => void;
  onRemove: (id: string) => void;
}

export default function UserMarkerLayer({ markers, onUpdate, onRemove }: Props) {
  return (
    <>
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={[marker.lat, marker.lng]}
          icon={getPaletteIcon(marker.iconValue)}
          keyboard={false}
        >
          <Popup>
            <UserMarkerPopup marker={marker} onUpdate={onUpdate} onRemove={onRemove} />
          </Popup>
        </Marker>
      ))}
    </>
  );
}
