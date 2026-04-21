import { useEffect } from 'react';

const INPUT_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

function isTypingTarget(el) {
  if (!el) return false;
  if (INPUT_TAGS.has(el.tagName)) return true;
  if (el.isContentEditable) return true;
  return false;
}

/**
 * useKeyboardShortcuts
 *
 * Registers a keydown listener on `document` and calls `handler(event)`
 * when a keydown fires.
 *
 * @param {(e: KeyboardEvent) => void} handler  – provided by context
 * @param {boolean} active – pass false to temporarily disable (e.g. admin pages)
 */
export function useKeyboardShortcuts(handler, active = true) {
  useEffect(() => {
    if (!active) return;

    const onKeyDown = (e) => handler(e, isTypingTarget(document.activeElement));

    // Capture phase improves reliability with complex UI components
    // that may stop bubbling key events.
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [handler, active]);
}
