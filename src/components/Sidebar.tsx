import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CATEGORIES } from '../lib/categories';
import { APP_VERSION, BASE } from '../lib/constants';

type Tab = 'home' | 'share' | 'about' | 'backup';

interface Props {
  visible: Set<string>;
  userVisible: boolean;
  onToggleCategory: (id: string, checked: boolean) => void;
  onToggleAll: (checked: boolean) => void;
  onToggleUser: (checked: boolean) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onClear: () => void;
  language: string;
  onChangeLanguage: (lang: string) => void;
}

const IMG = `${BASE}assets/images/`;

export default function Sidebar({
  visible,
  userVisible,
  onToggleCategory,
  onToggleAll,
  onToggleUser,
  onExport,
  onImport,
  onClear,
}: Props) {
  const { t } = useTranslation();
  const [active, setActive] = useState<Tab | null>('home');
  const [confirmClear, setConfirmClear] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const allChecked = CATEGORIES.every((c) => visible.has(c.id));
  const collapsed = active === null;

  const openTab = (tab: Tab) => setActive((cur) => (cur === tab ? null : tab));

  return (
    <div id="sidebar" className={`sidebar sidebar-left leaflet-touch${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-tabs">
        <ul role="tablist">
          {(['home', 'share', 'about', 'backup'] as Tab[]).map((tab) => (
            <li key={tab} className={active === tab ? 'active' : ''}>
              <a
                href={`#${tab}`}
                role="tab"
                onClick={(e) => {
                  e.preventDefault();
                  openTab(tab);
                }}
              >
                <i className={tab === 'backup' ? 'inventory' : tab} />
              </a>
            </li>
          ))}
        </ul>
        <ul role="tablist" />
      </div>

      <div className="sidebar-content">
        {/* Home / markers */}
        <div className={`sidebar-pane${active === 'home' ? ' active' : ''}`} id="home">
          <span className="sidebar-close" onClick={() => setActive(null)}>
            <i className="left-arrow" />
          </span>
          <div className="logo-container">
            <img className="logo-menu" src={`${IMG}kcdmap.svg`} alt="Kingdom Come Deliverance Interactive Map" />
            <p className="version">v. {APP_VERSION}</p>
          </div>
          <div className="content">
            <ul className="user-list">
              <li>
                <i className="player" />
                <input
                  type="checkbox"
                  id="usermarkers"
                  className="cc"
                  checked={userVisible}
                  onChange={(e) => onToggleUser(e.target.checked)}
                />
                <label htmlFor="usermarkers" className="cl">
                  {t('Mymarkers')}
                </label>
              </li>
            </ul>
            <ul className="allmarkers-list">
              <li>
                <i className="allmarkers" />
                <input
                  type="checkbox"
                  id="allmarkers"
                  className="cc"
                  checked={allChecked}
                  onChange={(e) => onToggleAll(e.target.checked)}
                />
                <label htmlFor="allmarkers" className="cl">
                  {t('Allmarkers')}
                </label>
              </li>
            </ul>
            <ul className="markers-list">
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <i className={cat.iconClass} />
                  <input
                    type="checkbox"
                    id={cat.id}
                    className="cc"
                    checked={visible.has(cat.id)}
                    onChange={(e) => onToggleCategory(cat.id, e.target.checked)}
                  />
                  <label htmlFor={cat.id} className="cl">
                    {t(cat.i18nKey, { defaultValue: cat.label })}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Share */}
        <div className={`sidebar-pane${active === 'share' ? ' active' : ''}`} id="share">
          <span className="sidebar-close" onClick={() => setActive(null)}>
            <i className="left-arrow" />
          </span>
          <p className="list-title">{t('send_markers')}</p>
          <div className="content">
            <p className="text">
              You can submit your markers in our Discord server. We update markers regularly to make this map as
              complete as possible.
            </p>
            <a href="https://discord.gg/7rvUxAC" target="_blank" rel="noreferrer">
              <img className="discord-img" src={`${IMG}discord-dark.svg`} alt="Discord" />
            </a>
            <p className="text">Or you can submit them in the Reddit thread:</p>
            <a
              href="https://www.reddit.com/r/kingdomcome/comments/81aaov/interactive_map_live/"
              target="_blank"
              rel="noreferrer"
            >
              <img className="discord-img" src={`${IMG}reddit.svg`} alt="Reddit Kingdom Come Map" />
            </a>
          </div>
        </div>

        {/* Backup */}
        <div className={`sidebar-pane${active === 'backup' ? ' active' : ''}`} id="backup">
          <span className="sidebar-close" onClick={() => setActive(null)}>
            <i className="left-arrow" />
          </span>
          <p className="list-title">{t('ImportExportmarkers')}</p>
          <div className="content mtop15px">
            <a className="btn backupls" href="#" onClick={(e) => { e.preventDefault(); onExport(); }}>
              <i className="export" />
              <span className="btn-text">{t('export_markers')}</span>
            </a>
            <a
              className="btn restorels"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                fileInput.current?.click();
              }}
            >
              <i className="import" />
              <span className="btn-text">{t('import_markers')}</span>
            </a>
            <input
              ref={fileInput}
              type="file"
              accept="application/json,.json"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onImport(file);
                e.target.value = '';
              }}
            />
            <div className="dialog">
              <a
                className="btn clearls"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setConfirmClear(true);
                }}
              >
                <i className="erase" />
                <span className="btn-text">{t('clear_markers')}</span>
              </a>
              {confirmClear && (
                <div className="prompt">
                  <p className="text">{t('clear_confirm')}</p>
                  <button
                    className="clearyes"
                    onClick={() => {
                      onClear();
                      setConfirmClear(false);
                    }}
                  >
                    {t('yes')}
                  </button>
                  <button className="clearno" onClick={() => setConfirmClear(false)}>
                    {t('no')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* About */}
        <div className={`sidebar-pane${active === 'about' ? ' active' : ''}`} id="about">
          <span className="sidebar-close" onClick={() => setActive(null)}>
            <i className="left-arrow" />
          </span>
          <h3 className="list-title">{t('info')}</h3>
          <div className="content update">
            <h3>Update 2.0</h3>
            <span className="updateday">Rebuilt UI</span>
            <ul className="update-list">
              <li className="text">Rebuilt on a modern stack (Vite + React + TypeScript + Leaflet).</li>
              <li className="text">Same map, markers, and look as the original.</li>
            </ul>
            <h3>Update 1.3.1</h3>
            <ul className="update-list">
              <li className="text">Added shareable markers; every marker has a direct link.</li>
              <li className="text">Markers shared with you can be added to your own markers.</li>
            </ul>
            <h3>Update 1.3</h3>
            <ul className="update-list">
              <li className="text">Map resolution increased to 8192px; coordinates match in-game.</li>
              <li className="text">Export/import and clear options for your own markers.</li>
            </ul>
            <h3>Initial release 1.0</h3>
            <ul className="update-list">
              <li className="text">
                Place markers around the map; they are saved in your browser&apos;s local storage.
              </li>
            </ul>
            <div className="legalinfo">
              <p className="text creator">Kingdom Come: Deliverance Map</p>
              <p className="text creator">Originally created by RogerHN.</p>
              <p className="text">
                The{' '}
                <a className="link" href="https://www.kingdomcomerpg.com" target="_blank" rel="noreferrer">
                  Kingdom Come: Deliverance
                </a>{' '}
                logo, icons and map are copyright and property of{' '}
                <a className="link" href="https://warhorsestudios.cz/" target="_blank" rel="noreferrer">
                  Warhorse Studios
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
