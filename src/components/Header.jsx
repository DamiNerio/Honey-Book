import { BrandMark, ClockIcon } from './Icons';
import { formatClock } from '../utils/formatters';

export default function Header({
  activeTab,
  onSelectTab,
  counts,
  liveTimerSeconds,
  timerIsRunning,
  timerBookTitle,
}) {
  const tabs = [
    { id: 'directory', label: 'Directory', count: counts.directory },
    { id: 'wishlist', label: 'Wishlist', count: counts.wishlist },
    { id: 'reading', label: 'Reading', count: counts.reading },
    { id: 'completed', label: 'Completed', count: counts.completed },
  ];

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <button
          type="button"
          className="brand"
          onClick={() => onSelectTab('directory')}
          aria-label="Book Violet home"
        >
          <BrandMark size={26} />
          <span className="brand__name">Book Violet</span>
        </button>

        <nav className="primary-nav" aria-label="Primary sections">
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

        <div className="header-status">
          {(timerIsRunning || liveTimerSeconds > 0) && activeTab !== 'reading' ? (
            <button
              type="button"
              id="header-timer-pill"
              className={`timer-pill ${timerIsRunning ? 'is-running' : ''}`}
              onClick={() => onSelectTab('reading')}
              title={timerBookTitle ? `Return to ${timerBookTitle}` : 'Return to reading session'}
            >
              <span className="timer-pill__dot" aria-hidden="true" />
              <ClockIcon size={13} />
              <span className="timer-pill__time">{formatClock(liveTimerSeconds)}</span>
            </button>
          ) : (
            <span className="header-caption">Reading Sanctuary</span>
          )}
        </div>
      </div>
    </header>
  );
}
