import { useEffect, useRef, useState } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import { getPaletteIcon } from '../lib/icons';
import { MAP_BOUNDS } from '../lib/constants';
import type { UserMarker } from '../data/types';

interface SharedMarker {
  lat: number;
  lng: number;
  title: string;
  desc: string;
  iconValue: number;
}

function parseShared(): SharedMarker | null {
  const params = new URLSearchParams(window.location.search);
  const m = params.get('m');
  if (!m) return null;
  const [lng, lat] = m.split(',').map(Number);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return {
    lat,
    lng,
    title: params.get('title') ?? '',
    desc: params.get('desc') ?? '',
    iconValue: Number(params.get('icon') ?? 0) || 0,
  };
}

function parseMarkerFly(): [number, number] | null {
  const params = new URLSearchParams(window.location.search);
  const marker = params.get('marker');
  if (!marker) return null;
  const [lng, lat] = marker.split(',').map(Number);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat <= 0 || lat > MAP_BOUNDS || lng <= 0 || lng > MAP_BOUNDS) return null;
  return [lat, lng];
}

interface Props {
  onAdd?: (input: Omit<UserMarker, 'id'>) => UserMarker;
}

export default function UrlMarkers({ onAdd }: Props) {
  const map = useMap();
  const { t } = useTranslation();
  const [shared, setShared] = useState<SharedMarker | null>(() => parseShared());
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;
    const fly = parseMarkerFly();
    if (fly) {
      map.flyTo(fly, 4);
    } else if (shared) {
      map.flyTo([shared.lat, shared.lng], 4);
    }
  }, [map, shared]);

  if (!shared) return null;

  return (
    <Marker position={[shared.lat, shared.lng]} icon={getPaletteIcon(shared.iconValue)} keyboard={false}>
      <Popup>
        <div className="popcontent">
          <p className="mtitle">{shared.title}</p>
          <p className="mdesc">{shared.desc}</p>
          <span className="mcoords">
            X: {shared.lng} Y: {shared.lat}
          </span>
        </div>
        {onAdd ? (
          <button
            type="button"
            className="save-marker"
            onClick={() => {
              onAdd({
                lat: shared.lat,
                lng: shared.lng,
                title: shared.title,
                desc: shared.desc,
                iconValue: shared.iconValue,
              });
              setShared(null);
            }}
          >
            {t('Save')}
          </button>
        ) : null}
      </Popup>
    </Marker>
  );
}
