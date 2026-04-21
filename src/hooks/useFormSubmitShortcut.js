import { useEffect } from 'react';
import { useOptionalKeyboardShortcutsContext } from '../context/KeyboardShortcutsContext';

/**
 * useFormSubmitShortcut
 *
 * Call this inside any form component to enable Cmd/Ctrl+Enter to submit.
 *
 * @param {() => void} onSubmit  – called when the shortcut fires
 * @param {boolean} [enabled]    – pass false to temporarily disable
 *
 * @example
 *   useFormSubmitShortcut(handleSave);
 */
export function useFormSubmitShortcut(onSubmit, enabled = true) {
  const shortcutsCtx = useOptionalKeyboardShortcutsContext();

  useEffect(() => {
    if (!shortcutsCtx) return undefined;

    const { registerFormSubmit, unregisterFormSubmit } = shortcutsCtx;

    if (enabled && onSubmit) {
      registerFormSubmit(onSubmit);
    } else {
      unregisterFormSubmit();
    }
    return () => unregisterFormSubmit();
  // We intentionally re-register whenever onSubmit reference changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, onSubmit, shortcutsCtx]);
}
