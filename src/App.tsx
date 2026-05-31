import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import { usePersistedState } from './hooks/usePersistedState';
import { CATEGORIES, EXTRA_GROUPS, TEXT_LABELS_ID } from './lib/categories';
import {
  loadUserMarkers,
  saveUserMarkers,
  createUserMarker,
} from './lib/userMarkers';
import type { UserMarker } from './data/types';

const ALL_GROUP_IDS = [...CATEGORIES.map((c) => c.id), ...EXTRA_GROUPS];

export default function App() {
  const { i18n } = useTranslation();

  const [visibleList, setVisibleList] = usePersistedState<string[]>('kcdVisibleGroups', []);
  const [userVisible, setUserVisible] = usePersistedState<boolean>('kcdUserVisible', true);
  const [userMarkers, setUserMarkers] = useState<UserMarker[]>(() => loadUserMarkers());

  const visible = useMemo(() => new Set(visibleList), [visibleList]);

  const toggleCategory = useCallback(
    (id: string, checked: boolean) => {
      setVisibleList((prev) => {
        const next = new Set(prev);
        if (checked) next.add(id);
        else next.delete(id);
        return [...next];
      });
    },
    [setVisibleList],
  );

  const toggleAll = useCallback(
    (checked: boolean) => {
      setVisibleList(checked ? [...ALL_GROUP_IDS] : []);
    },
    [setVisibleList],
  );

  const persist = useCallback((markers: UserMarker[]) => {
    setUserMarkers(markers);
    saveUserMarkers(markers);
  }, []);

  const addUserMarker = useCallback(
    (input: Omit<UserMarker, 'id'>) => {
      const marker = createUserMarker(input);
      persist([...userMarkers, marker]);
      return marker;
    },
    [persist, userMarkers],
  );

  const updateUserMarker = useCallback(
    (id: string, patch: Partial<UserMarker>) => {
      persist(userMarkers.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    },
    [persist, userMarkers],
  );

  const removeUserMarker = useCallback(
    (id: string) => {
      persist(userMarkers.filter((m) => m.id !== id));
    },
    [persist, userMarkers],
  );

  const clearUserMarkers = useCallback(() => persist([]), [persist]);

  const exportMarkers = useCallback(() => {
    const backup = {
      markers: JSON.stringify(userMarkers),
      langactive: i18n.language,
    };
    const href = `data:text/javascript;charset=utf-8;base64,${btoa(JSON.stringify(backup))}`;
    const link = document.createElement('a');
    const now = new Date();
    const stamp = `${now.getFullYear()}-${`0${now.getMonth() + 1}`.slice(-2)}-${now.getDate()}_${now.getHours()}.${now.getMinutes()}`;
    link.setAttribute('download', `kcdmap_${stamp}.json`);
    link.setAttribute('href', href);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, [userMarkers, i18n.language]);

  const importMarkers = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = JSON.parse(String(e.target?.result));
          const parsed = typeof text.markers === 'string' ? JSON.parse(text.markers) : text.markers;
          saveUserMarkers([]);
          // Round-trip through the loader so legacy backup shapes normalize.
          localStorage.setItem('mapUserMarkers', JSON.stringify(parsed));
          setUserMarkers(loadUserMarkers());
          if (text.langactive) void i18n.changeLanguage(text.langactive);
        } catch {
          alert('Failed to load file');
        }
      };
      reader.readAsText(file);
    },
    [i18n],
  );

  const changeLanguage = useCallback(
    (lang: string) => {
      void i18n.changeLanguage(lang);
      localStorage.setItem('langactive', lang);
    },
    [i18n],
  );

  return (
    <>
      <Sidebar
        visible={visible}
        userVisible={userVisible}
        onToggleCategory={toggleCategory}
        onToggleAll={toggleAll}
        onToggleUser={setUserVisible}
        onExport={exportMarkers}
        onImport={importMarkers}
        onClear={clearUserMarkers}
        language={i18n.language}
        onChangeLanguage={changeLanguage}
      />
      <MapView
        visible={visible}
        showTextLabels={visible.has(TEXT_LABELS_ID)}
        userVisible={userVisible}
        userMarkers={userMarkers}
        onAddUserMarker={addUserMarker}
        onUpdateUserMarker={updateUserMarker}
        onRemoveUserMarker={removeUserMarker}
      />
    </>
  );
}
