import { useEffect, useRef, useState } from 'react';
import { Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { usePersistedState } from '../hooks/usePersistedState';

// Live player position from kcd.log ([LIVEMAP] lines written by the
// LiveMapTracker game mod). Served same-origin by the desktop app
// (app/main.ts); in dev the Vite proxy forwards it to whichever of
// app/main.ts or live/bridge.ps1 is running on 8765. Coordinates are
// in-game world meters, which this map uses natively (see lib/crs.ts).
const BRIDGE_URL = '/position';
const POLL_MS = 1000;
const IDLE_POLL_MS = 10000; // slow down while the bridge is unreachable
const STALE_AFTER_FAILS = 3;

interface LivePos {
  x: number;
  y: number;
  z: number;
  dx: number;
  dy: number;
  t: number;
}

/** Heading in degrees clockwise from north (map up) from a facing vector. */
function headingDeg(dx: number, dy: number): number {
  return (Math.atan2(dx, dy) * 180) / Math.PI;
}

function playerIcon(deg: number): L.DivIcon {
  return L.divIcon({
    className: 'live-player-icon',
    html:
      `<svg width="26" height="26" viewBox="0 0 24 24" style="transform:rotate(${deg}deg);display:block">` +
      `<path d="M12 2 L19.5 20.5 L12 15.8 L4.5 20.5 Z" fill="#d81e1e" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>` +
      `</svg>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

export default function LivePlayerMarker() {
  const map = useMap();
  const [pos, setPos] = useState<LivePos | null>(null);
  const [follow, setFollow] = usePersistedState('livePlayerFollow', true);
  const failsRef = useRef(0);

  useEffect(() => {
    let alive = true;
    let timer = 0;
    const poll = async () => {
      let delay = POLL_MS;
      try {
        const res = await fetch(BRIDGE_URL);
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as Partial<LivePos>;
        failsRef.current = 0;
        if (alive && typeof data.x === 'number' && typeof data.y === 'number') {
          setPos(data as LivePos);
        }
      } catch {
        failsRef.current += 1;
        if (failsRef.current >= STALE_AFTER_FAILS) {
          if (alive) setPos(null);
          delay = IDLE_POLL_MS;
        }
      }
      if (alive) timer = window.setTimeout(poll, delay);
    };
    poll();
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (pos && follow) map.panTo([pos.y, pos.x]);
  }, [pos, follow, map]);

  if (!pos) return null;

  return (
    <Marker
      position={[pos.y, pos.x]}
      icon={playerIcon(headingDeg(pos.dx, pos.dy))}
      zIndexOffset={1000}
      eventHandlers={{ click: () => setFollow((f) => !f) }}
    >
      <Tooltip className="live-player-tooltip" direction="top" offset={[0, -12]}>
        Henry — {follow ? 'following (click to unfollow)' : 'click to follow'}
      </Tooltip>
    </Marker>
  );
}
