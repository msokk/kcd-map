import { useState } from 'react';
import { Marker, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import textData from '../data/textMarkers.json';
import type { TextMarker } from '../data/types';
import { ICONS_URL } from '../lib/constants';
import { textLatLng } from '../lib/geo';
import { parseMarkerName } from '../i18n';

const TEXT_MARKERS = textData as TextMarker[];

const transparentIcon = L.icon({
  iconUrl: `${ICONS_URL}alpha_marker.png`,
  iconSize: [1, 1],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18],
});

// Font sizes per zoom level, carried over from the original site.
function fontSizeForZoom(zoom: number): number {
  if (zoom <= 0) return 12;
  if (zoom === 1) return 14;
  if (zoom === 2) return 16;
  if (zoom === 3) return 18;
  return 20;
}

export default function TextLabels({ show }: { show: boolean }) {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) });

  if (!show) return null;
  const fontSize = fontSizeForZoom(zoom);

  return (
    <>
      {TEXT_MARKERS.map((marker, i) => {
        const { key, text } = parseMarkerName(marker.name);
        return (
          <Marker key={i} position={textLatLng(marker.coords)} icon={transparentIcon} opacity={0} keyboard={false}>
            <Tooltip permanent direction="top" className="text-label" offset={[0, 0]}>
              <span data-i18n={key} style={{ fontSize: `${fontSize}px` }}>
                {text}
              </span>
            </Tooltip>
          </Marker>
        );
      })}
    </>
  );
}
