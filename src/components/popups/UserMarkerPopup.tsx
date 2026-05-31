import { useState } from 'react';
import { useMap } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import type { UserMarker } from '../../data/types';
import { MARKER_PALETTE, paletteIconUrl } from '../../lib/icons';
import { humanizeItem } from '../../i18n';
import { shareUrl } from '../../lib/geo';
import CopyLinkButton from '../CopyLinkButton';

type Mode = 'view' | 'edit' | 'remove';

interface Props {
  marker: UserMarker;
  onUpdate: (id: string, patch: Partial<UserMarker>) => void;
  onRemove: (id: string) => void;
}

export default function UserMarkerPopup({ marker, onUpdate, onRemove }: Props) {
  const { t } = useTranslation();
  const map = useMap();
  const [mode, setMode] = useState<Mode>('view');
  const [title, setTitle] = useState(marker.title);
  const [desc, setDesc] = useState(marker.desc);
  const [iconValue, setIconValue] = useState(marker.iconValue);

  const url = shareUrl(
    encodeURI(`m=${marker.lng},${marker.lat}&title=${title}&desc=${desc}&icon=${iconValue}&`),
  );

  const save = () => {
    onUpdate(marker.id, { title, desc, iconValue });
    setMode('view');
    map.closePopup();
  };

  if (mode === 'remove') {
    return (
      <div id="remove-dialog">
        <span className="remove-text">{t('remove_text')}</span>
        <button type="button" className="yes" onClick={() => onRemove(marker.id)}>
          {t('yes')}
        </button>
        <button type="button" className="no" onClick={() => setMode('view')}>
          {t('no')}
        </button>
      </div>
    );
  }

  if (mode === 'edit') {
    return (
      <div id="edit-dialog">
        <div className="chooseIcon">{t('choose_icon')}</div>
        <div id="iconprev" style={{ backgroundImage: `url('${paletteIconUrl(iconValue)}')` }} />
        <select
          id="select_icon"
          name="icon"
          value={iconValue}
          onChange={(e) => setIconValue(Number(e.target.value))}
        >
          {MARKER_PALETTE.map((p, i) => (
            <option key={i} value={i}>
              {humanizeItem(p.icon)}
            </option>
          ))}
        </select>
        <input type="text" id="editedtitle" name="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea id="editeddesc" name="desc" value={desc} onChange={(e) => setDesc(e.target.value)} />
        <button type="button" className="cancel" onClick={() => setMode('view')}>
          {t('cancel')}
        </button>
        <button type="button" className="save-marker" onClick={save}>
          {t('Save')}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="popcontent">
        <p className="mtitle">{title}</p>
        <p className="mdesc">{desc}</p>
        <span className="mcoords">
          X: {marker.lng} Y: {marker.lat}
        </span>
      </div>
      <CopyLinkButton url={url} />
      <button type="button" className="edit-marker" onClick={() => setMode('edit')}>
        {t('edit_marker')}
      </button>
      <button type="button" className="remove-marker" onClick={() => setMode('remove')}>
        {t('remove_marker')}
      </button>
    </>
  );
}
