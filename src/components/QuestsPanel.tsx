import { useMemo, useState } from 'react';
import questsData from '../data/quests.json';
import { usePersistedState } from '../hooks/usePersistedState';

// Quest checklist: all quests extracted from the game files (see
// scripts/extract-quests.ps1), completion ticked off manually and kept in
// localStorage. No save-game integration yet.

interface Quest {
  name: string;
  title: string;
  desc: string;
  type: string;
  region: string;
}

const SECTIONS = [
  { type: 'main', label: 'Main Quests' },
  { type: 'side', label: 'Side Quests' },
  { type: 'activity', label: 'Activities' },
] as const;

export default function QuestsPanel() {
  const quests = questsData as Quest[];
  const [done, setDone] = usePersistedState<Record<string, number>>('kcdQuestsDone', {});
  const [hideDone, setHideDone] = usePersistedState<boolean>('kcdQuestsHideDone', false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggleDone = (name: string) =>
    setDone((prev) => {
      const next = { ...prev };
      if (next[name]) delete next[name];
      else next[name] = Date.now();
      return next;
    });

  const sections = useMemo(
    () =>
      SECTIONS.map((s) => {
        const list = quests.filter((q) => q.type === s.type);
        const regions = [...new Set(list.map((q) => q.region))].sort((a, b) => {
          if (a === 'Main story') return -1;
          if (b === 'Main story') return 1;
          return a.localeCompare(b);
        });
        return { ...s, list, regions };
      }),
    [quests],
  );

  const totalDone = quests.filter((q) => done[q.name]).length;

  return (
    <>
      <p className="list-title">Quest Journal</p>
      <div className="content">
        <div className="quest-toolbar">
          <span className="quest-total">
            {totalDone}/{quests.length} completed
          </span>
          <label className="quest-hide-done">
            <input type="checkbox" checked={hideDone} onChange={(e) => setHideDone(e.target.checked)} />{' '}
            Hide completed
          </label>
        </div>
        {sections.map((s) => {
          const doneCount = s.list.filter((q) => done[q.name]).length;
          return (
            <div key={s.type} className="quest-section">
              <h3 className="quest-section-header">
                <span>{s.label}</span>
                <span className="quest-count">
                  {doneCount}/{s.list.length}
                </span>
              </h3>
              {s.regions.map((region) => {
                const regionQuests = s.list.filter(
                  (q) => q.region === region && (!hideDone || !done[q.name]),
                );
                if (regionQuests.length === 0) return null;
                return (
                  <div key={region}>
                    {s.regions.length > 1 && <h4 className="quest-region-header">{region}</h4>}
                    <ul className="quest-list">
                      {regionQuests.map((q) => (
                        <li key={q.name} className={`quest-item${done[q.name] ? ' done' : ''}`}>
                          <div className="quest-row">
                            <input
                              type="checkbox"
                              className="quest-check"
                              id={`quest-${q.name}`}
                              checked={!!done[q.name]}
                              onChange={() => toggleDone(q.name)}
                            />
                            <label htmlFor={`quest-${q.name}`} className="quest-box" />
                            <span
                              className="quest-title"
                              onClick={() => setExpanded(expanded === q.name ? null : q.name)}
                            >
                              {q.title}
                            </span>
                          </div>
                          {expanded === q.name && q.desc && <p className="quest-desc">{q.desc}</p>}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </>
  );
}
