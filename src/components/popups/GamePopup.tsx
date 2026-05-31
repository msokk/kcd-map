import { useTranslation } from 'react-i18next';
import type { GameMarker } from '../../data/types';
import { parseMarkerName, humanizeItem } from '../../i18n';
import { shareCoords, shareUrl } from '../../lib/geo';
import CopyLinkButton from '../CopyLinkButton';

export default function GamePopup({ marker }: { marker: GameMarker }) {
  const { t } = useTranslation();
  const { key, text } = parseMarkerName(marker.name);
  const name = t(key, { defaultValue: text });
  const [c0, c1] = marker.coords;
  const url = shareUrl(`marker=${shareCoords(c1, c0)}`);

  return (
    <>
      <p className="mtitle">{name}</p>
      {marker.desc ? <span className="mdesc">{marker.desc}</span> : null}
      {marker.kcditems && marker.kcditems.length > 0 ? (
        <ul className="ilist">
          {marker.kcditems.map((it, i) => (
            <li key={i}>
              <i className={it.item} />
              <span className="iname">{t(it.item, { defaultValue: humanizeItem(it.item) })}</span>
              {it.qnt !== '' && it.qnt !== undefined ? <span className="qnt">{it.qnt}</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
      <p className="original_coords">
        {c0.toFixed(0)},{c1.toFixed(0)}
      </p>
      <CopyLinkButton url={url} />
    </>
  );
}
