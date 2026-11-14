/**
 * Format seconds into HH:MM:SS for the live reading session timer.
 */
export function formatClock(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds || 0));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;

  return [hours, minutes, seconds]
    .map((unit) => String(unit).padStart(2, '0'))
    .join(':');
}

/**
 * Format accumulated reading duration cleanly (e.g., "6h 24m", "18m 40s", or "42s").
 */
export function formatDuration(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds || 0));
  if (safe === 0) return '0m';

  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  if (minutes > 0) {
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
  }
  return `${seconds}s`;
}

/**
 * Calculate clamped integer completion percentage.
 */
export function getCompletionPercentage(currentPage, totalPages) {
  if (!totalPages || totalPages <= 0) return 0;
  const clamped = Math.max(0, Math.min(currentPage || 0, totalPages));
  return Math.round((clamped / totalPages) * 100);
}

/**
 * Format ISO timestamp into clean localized date.
 */
export function formatDateShort(isoString, lang = 'en') {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Compute live timer elapsed seconds safely using timestamp delta when running.
 */
export function computeLiveTimerSeconds(timer, nowMs = Date.now()) {
  if (!timer) return 0;
  const base = Math.max(0, Math.floor(timer.elapsedSeconds || 0));
  if (!timer.isRunning || !timer.lastStartedAtMs) return base;
  const delta = Math.max(0, Math.floor((nowMs - timer.lastStartedAtMs) / 1000));
  return base + delta;
}
