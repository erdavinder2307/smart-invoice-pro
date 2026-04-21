/**
 * Centralized shortcut registry.
 *
 * Each entry describes ONE shortcut:
 *   id       – unique key used as registry key
 *   label    – human-readable name shown in the help modal
 *   category – group heading in the help modal
 *   keys     – { mac, win } display strings for the help modal
 *   match    – (KeyboardEvent) => boolean predicate
 *   ignoreInput – when true the shortcut fires even when focus is inside
 *                 an input/textarea/select/contenteditable
 *
 * Action functions are injected at runtime by KeyboardShortcutsContext so
 * this file stays pure (no imports from React or context).
 *
 * To add a new shortcut:
 *   1. Add a descriptor here.
 *   2. Add the action name to KeyboardShortcutsContext.
 *   3. That's it.
 */

export const SHORTCUT_DEFS = [
  // Lightweight sequence matcher for two-key shortcuts like C then I.
  // We avoid firing inside text inputs by keeping ignoreInput false.
  (() => {
    let stage = 0;
    let lastTs = 0;
    return {
      id: 'quick-create-invoice',
      labelKey: 'keyboardShortcuts.items.quickCreateInvoice',
      category: 'quickCreate',
      keys: { mac: 'C I', win: 'C I' },
      match: (e) => {
        const key = String(e.key || '').toLowerCase();
        const now = Date.now();
        if (e.metaKey || e.ctrlKey || e.altKey) {
          stage = 0;
          return false;
        }
        if (key === 'c') {
          stage = 1;
          lastTs = now;
          return false;
        }
        if (stage === 1 && now - lastTs <= 900 && key === 'i') {
          stage = 0;
          return true;
        }
        stage = 0;
        return false;
      },
      ignoreInput: false,
    };
  })(),
  (() => {
    let stage = 0;
    let lastTs = 0;
    return {
      id: 'quick-add-customer',
      labelKey: 'keyboardShortcuts.items.quickAddCustomer',
      category: 'quickCreate',
      keys: { mac: 'C C', win: 'C C' },
      match: (e) => {
        const key = String(e.key || '').toLowerCase();
        const now = Date.now();
        if (e.metaKey || e.ctrlKey || e.altKey) {
          stage = 0;
          return false;
        }
        // Check completion first; otherwise the second "c" is consumed as a new start.
        if (stage === 1 && now - lastTs <= 900 && key === 'c') {
          stage = 0;
          return true;
        }
        if (key === 'c') {
          stage = 1;
          lastTs = now;
          return false;
        }
        stage = 0;
        return false;
      },
      ignoreInput: false,
    };
  })(),
  // ── General ────────────────────────────────────────────────────────────────
  {
    id: 'command-palette',
    labelKey: 'keyboardShortcuts.items.openCommandPalette',
    category: 'general',
    keys: { mac: '⌘ K', win: 'Ctrl K' },
    match: (e) => (e.metaKey || e.ctrlKey) && e.key === 'k',
    ignoreInput: false,
  },
  {
    id: 'shortcut-help',
    labelKey: 'keyboardShortcuts.items.showShortcutHelp',
    category: 'general',
    keys: { mac: '⌘ /', win: 'Ctrl /' },
    match: (e) => (e.metaKey || e.ctrlKey) && e.key === '/',
    ignoreInput: false,
  },
  {
    id: 'submit-form',
    labelKey: 'keyboardShortcuts.items.saveOrSubmitForm',
    category: 'general',
    keys: { mac: '⌘ Enter', win: 'Ctrl Enter' },
    match: (e) => (e.metaKey || e.ctrlKey) && e.key === 'Enter',
    // Always fires even inside inputs so users can save while typing
    ignoreInput: true,
  },
  {
    id: 'close',
    labelKey: 'keyboardShortcuts.items.closeModal',
    category: 'general',
    keys: { mac: 'Esc', win: 'Esc' },
    match: (e) => e.key === 'Escape',
    ignoreInput: true,
  },
];

// Groups for the help modal (ordered)
export const SHORTCUT_CATEGORIES = ['quickCreate', 'general'];

// ── Future phase: navigation + create shortcuts ─────────────────────────────
// When ready, add entries to SHORTCUT_DEFS above and handle in context.
// Example:
// { id: 'goto-dashboard', label: 'Go to Dashboard', category: 'Navigation',
//   keys: { mac: 'G then D', win: 'G then D' }, match: gSeq('d') }
