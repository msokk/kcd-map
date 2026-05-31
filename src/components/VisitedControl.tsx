import { useTranslation } from 'react-i18next';

interface Props {
  visitedAt?: number;
  onToggle: () => void;
}

/** "Mark as visited" toggle shown in game/treasure marker popups. */
export default function VisitedControl({ visitedAt, onToggle }: Props) {
  const { t } = useTranslation();

  if (visitedAt) {
    const when = new Date(visitedAt).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    return (
      <div className="visited-block">
        <span className="visited-on">
          {t('visited_on')} {when}
        </span>
        <button type="button" className="visit-marker undo" onClick={onToggle}>
          {t('mark_unvisited')}
        </button>
      </div>
    );
  }

  return (
    <button type="button" className="visit-marker" onClick={onToggle}>
      {t('mark_visited')}
    </button>
  );
}
