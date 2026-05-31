import { useTranslation } from 'react-i18next';
import type { TreasureMarker } from '../../data/types';
import { parseMarkerName, humanizeItem } from '../../i18n';
import { shareCoords, shareUrl } from '../../lib/geo';
import CopyLinkButton from '../CopyLinkButton';
import VisitedControl from '../VisitedControl';

interface Props {
  marker: TreasureMarker;
  visitedAt?: number;
  onToggleVisited: () => void;
}

export default function TreasurePopup({ marker, visitedAt, onToggleVisited }: Props) {
  const { t } = useTranslation();
  const { key, text } = parseMarkerName(marker.name);
  const name = t(key, { defaultValue: text });
  const [c0, c1] = marker.coords;
  const url = shareUrl(`marker=${shareCoords(c1, c0)}`);

  return (
    <>
      <p className="mtitle">{name}</p>
      {marker.desc ? <p className="mdesc">{marker.desc}</p> : null}
      {marker.desc2 ? <p className="mdesc">{marker.desc2}</p> : null}
      {marker.req ? (
        <>
          <p className="req">{t('req')}</p>
          <ul className="ilist">
            <li>
              <i className={marker.req} />
              <span className="iname">{t(marker.req, { defaultValue: humanizeItem(marker.req) })}</span>
              {marker.level ? (
                <span className={`ilevel ${marker.level}`}>{humanizeItem(marker.level)}</span>
              ) : null}
            </li>
          </ul>
        </>
      ) : null}
      {marker.items && marker.items.length > 0 ? (
        <ul className="ilist">
          {marker.items.map((it, i) => (
            <li key={i}>
              <i className={it} />
              <span className="iname">{t(it, { defaultValue: humanizeItem(it) })}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="original_coords">
        {c0},{c1}
      </p>
      <CopyLinkButton url={url} />
      <VisitedControl visitedAt={visitedAt} onToggle={onToggleVisited} />
    </>
  );
}
