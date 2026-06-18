import { isDemoHost } from './demoMode';

const PREFIX = '[GuidedTour]';

function enabled() {
  if (typeof window === 'undefined') return false;
  return isDemoHost() || localStorage.getItem('solidevbooks_tour_debug') === 'true';
}

export function tourDebug(event, payload = {}) {
  if (!enabled()) return;
  // eslint-disable-next-line no-console
  console.info(PREFIX, event, payload);
}

export function tourWarn(event, payload = {}) {
  if (!enabled()) return;
  // eslint-disable-next-line no-console
  console.warn(PREFIX, event, payload);
}
