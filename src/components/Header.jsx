import { translate } from '../i18n/translations';
import { formatClock } from '../utils/formatters';
import { BrandMark, ClockIcon } from './Icons';

export default function Header({
  activeTab,
  onSelectTab,
  counts,
  liveTimerSeconds,
  timerIsRunning,
  timerBookTitle,
  lang,
  onChangeLang,
  user,
  onLogout,
}) {
  const t = (key, vars) => translate(lang, key, vars);

  const tabs = [
    { id: 'directory', label: t('navDirectory'), count: counts.directory },
    { id: 'wishlist', label: t('navWishlist'), count: counts.wishlist },
    { id: 'reading', label: t('navReading'), count: counts.reading },
    { id: 'completed', label: t('navCompleted'), count: counts.completed },
  ];

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <button
          type="button"
          className="brand"
          onClick={() => onSelectTab('directory')}
          aria-label="Book Violet"
        >
          <BrandMark size={26} />
          <span className="brand__name">Book Violet</span>
        </button>

        <nav className="primary-nav" aria-label={t('navAriaLabel')}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                type="button"
                className={`primary-nav__item ${isActive ? 'is-active' : ''}`}
                onClick={() => onSelectTab(tab.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                <span>{tab.label}</span>
                <span className="primary-nav__count">{tab.count}</span>
              </button>
            );
          })}
        </nav>

        <div className="header-utilities">
          {(timerIsRunning || liveTimerSeconds > 0) && activeTab !== 'reading' && (
            <button
              type="button"
              id="header-timer-pill"
              className={`timer-pill ${timerIsRunning ? 'is-running' : ''}`}
              onClick={() => onSelectTab('reading')}
              title={timerBookTitle ? t('returnToBook', { title: timerBookTitle }) : ''}
            >
              <span className="timer-pill__dot" aria-hidden="true" />
              <ClockIcon size={13} />
              <span className="timer-pill__time">{formatClock(liveTimerSeconds)}</span>
            </button>
          )}

          <div className="lang-switcher" role="group" aria-label={t('languageLabel')}>
            <button
              type="button"
              id="lang-btn-en"
              className={`lang-switcher__btn ${lang === 'en' ? 'is-active' : ''}`}
              onClick={() => onChangeLang('en')}
              aria-pressed={lang === 'en'}
            >
              EN
            </button>
            <button
              type="button"
              id="lang-btn-es"
              className={`lang-switcher__btn ${lang === 'es' ? 'is-active' : ''}`}
              onClick={() => onChangeLang('es')}
              aria-pressed={lang === 'es'}
            >
              ES
            </button>
          </div>

          {user && (
            <div className="account-pill" title={t('signedInAs', { name: user.name })}>
              <span className="account-pill__name">{user.name}</span>
              <button
                type="button"
                id="logout-btn"
                className="account-pill__logout"
                onClick={onLogout}
              >
                {t('signOut')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
