import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { CATEGORIES } from './lib/categories';

// English is the canonical bundle (the original site displayed English for all
// but a handful of UI strings). Category labels are folded in automatically.
const categoryStrings: Record<string, string> = {};
for (const c of CATEGORIES) categoryStrings[c.i18nKey] = c.label;

const en = {
  ...categoryStrings,
  Mymarkers: 'My Markers',
  Allmarkers: 'All markers',
  send_markers: 'Send Markers',
  ImportExportmarkers: 'Import/Export markers',
  info: 'Info',
  settings: 'Settings',
  languagechange: 'Change Language',
  version: 'Version',
  yes: 'Yes',
  no: 'No',
  copylink: 'Copy link',
  copied: 'Copied',
  share: 'Share',
  add: 'Add',
  add_marker: 'Add marker',
  edit_marker: 'Edit marker',
  remove_marker: 'Remove marker',
  remove_text: 'Are you sure?',
  cancel: 'Cancel',
  Save: 'Save',
  choose_icon: 'Choose Icon:',
  marker_title: 'Marker Title:',
  marker_desc: 'Marker Description:',
  req: 'Requirements:',
  export_markers: 'Export markers',
  import_markers: 'Import markers',
  clear_markers: 'Clear markers',
  clear_confirm: 'This will delete all markers from the map, are you sure?',
  English: 'English',
  Spanish: 'Spanish',
  PortugueseBrazilian: 'Portuguese Brazilian',
  French: 'French',
  Italian: 'Italian',
  German: 'German',
  Russian: 'Russian',
  Polish: 'Polish',
  Dutch: 'Dutch',
  Chinese: 'Chinese',
  Korean: 'Korean',
  Japanese: 'Japanese',
};

// Sparse overrides carried over from the original lang.js.
const overrides: Record<string, Record<string, string>> = {
  br: { settings: 'Configurações', languagechange: 'Mudar Idioma', version: 'Versão' },
  es: { settings: 'Ajustes', languagechange: 'Cambiar Lenguaje', version: 'Versión' },
  ru: { settings: 'настройки', languagechange: 'Изменить язык', version: 'версия' },
  de: { settings: 'Einstellungen', languagechange: 'Sprache ändern', version: 'version' },
  cn: { settings: '设置', languagechange: '更改语言', version: '版本' },
  it: { settings: 'Impostazioni', languagechange: 'Cambia lingua', version: 'Versione' },
};

const resources: Record<string, { translation: Record<string, string> }> = {
  en: { translation: en },
};
for (const [lang, strings] of Object.entries(overrides)) {
  resources[lang] = { translation: { ...en, ...strings } };
}

const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('langactive') : null;

void i18n.use(initReactI18next).init({
  resources,
  lng: stored || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;

/**
 * Marker names in the data are wrapped like
 * `<span data-i18n='key'>English</span>`. Pull out the key + fallback text.
 */
export function parseMarkerName(raw: string): { key: string; text: string } {
  const match = raw.match(/data-i18n=['"]([^'"]+)['"]\s*>([^<]*)</);
  if (match) return { key: match[1].trim(), text: match[2].trim() };
  return { key: raw, text: raw };
}

/** Title-case an item id, e.g. "herb_paris" -> "Herb Paris". */
export function humanizeItem(id: string): string {
  return id.replace(/_/g, ' ');
}
