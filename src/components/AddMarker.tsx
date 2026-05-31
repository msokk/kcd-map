import { useEffect, useRef, useState } from 'react';
import { Popup, useMapEvents } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import type { UserMarker } from '../data/types';
import { MARKER_PALETTE, paletteIconUrl } from '../lib/icons';
import { humanizeItem } from '../i18n';
import { MAP_BOUNDS } from '../lib/constants';

interface Props {
  onAdd: (input: Omit<UserMarker, 'id'>) => UserMarker;
}

export default function AddMarker({ onAdd }: Props) {
  const { t } = useTranslation();
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [stage, setStage] = useState<'info' | 'form'>('info');
  const [title, setTitle] = useState('Arrow');
  const [desc, setDesc] = useState('');
  const [iconValue, setIconValue] = useState(0);
  // Set on pointerdown inside any popup. Leaflet fires its map `click` after a
  // delay (to detect double-clicks), by which point a button click may already
  // have re-rendered the popup, so checking the click target is unreliable.
  // Capturing pointerdown records the real origin before that deferred click,
  // so a click inside a popup never opens the add-marker popup.
  const fromPopup = useRef(false);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      fromPopup.current = !!target?.closest('.leaflet-popup');
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, []);

  useMapEvents({
    click(e) {
      if (fromPopup.current) {
        fromPopup.current = false;
        return;
      }
      const lat = Math.round(e.latlng.lat);
      const lng = Math.round(e.latlng.lng);
      if (lng < 0 || lng > MAP_BOUNDS - 1 || lat < 0 || lat > MAP_BOUNDS - 1) return;
      setPos({ lat, lng });
      setStage('info');
      setTitle('Arrow');
      setDesc('');
      setIconValue(0);
    },
  });

  if (!pos) return null;

  const submit = () => {
    onAdd({ lat: pos.lat, lng: pos.lng, title, desc, iconValue });
    setPos(null);
  };

  return (
    <Popup
      position={[pos.lat, pos.lng]}
      closeOnClick={false}
      autoClose={false}
      eventHandlers={{ remove: () => setPos(null) }}
    >
      {stage === 'info' ? (
        <>
          <span className="coordsinfo">
            X: {pos.lng} Y: {pos.lat}
          </span>
          <br />
          <button type="button" className="add-marker" onClick={() => setStage('form')}>
            {t('add_marker')}
          </button>
        </>
      ) : (
        <form
          id="addmark"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div className="chooseIcon">{t('choose_icon')}</div>
          <div id="iconprev" style={{ backgroundImage: `url('${paletteIconUrl(iconValue)}')` }} />
          <select
            id="select_icon"
            name="icon"
            value={iconValue}
            onChange={(e) => {
              const idx = Number(e.target.value);
              setIconValue(idx);
              setTitle(humanizeItem(MARKER_PALETTE[idx].icon));
            }}
          >
            {MARKER_PALETTE.map((p, i) => (
              <option key={i} value={i}>
                {humanizeItem(p.icon)}
              </option>
            ))}
          </select>
          <div className="markertitle">{t('marker_title')}</div>
          <input type="text" id="titleprev" name="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div className="markerdesc">{t('marker_desc')}</div>
          <textarea name="desc" value={desc} onChange={(e) => setDesc(e.target.value)} />
          <table className="coordsinputs">
            <tbody>
              <tr>
                <td>
                  X:<input type="text" readOnly name="mlon" value={pos.lng} />
                </td>
                <td>
                  Y:<input type="text" readOnly name="mlat" value={pos.lat} />
                </td>
              </tr>
            </tbody>
          </table>
          <button type="submit" className="send">
            {t('add')}
          </button>
        </form>
      )}
    </Popup>
  );
}
