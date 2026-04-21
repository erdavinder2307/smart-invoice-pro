import React, { createContext, useCallback, useContext, useState } from 'react';
import { SHORTCUT_DEFS } from '../keyboard/shortcuts';
import { useKeyboardShortcuts } from '../keyboard/useKeyboardShortcuts';

const KeyboardShortcutsContext = createContext(null);

function submitFocusedForm(event) {
  const target = event.target;
  if (!target || typeof target.closest !== 'function') return false;

  const form = target.closest('form');
  if (!form) return false;

  // requestSubmit triggers native submit behavior (validation + submit handlers).
  if (typeof form.requestSubmit === 'function') {
    form.requestSubmit();
    return true;
  }

  if (typeof form.submit === 'function') {
    form.submit();
    return true;
  }

  return false;
}

export function KeyboardShortcutsProvider({ children }) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [quickCreateCustomerOpen, setQuickCreateCustomerOpen] = useState(false);
  const [quickCreateInvoiceOpen, setQuickCreateInvoiceOpen] = useState(false);
  const [recentCustomers, setRecentCustomers] = useState(() => {
    try {
      const raw = localStorage.getItem('quick_recent_customers');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const openCommandPalette = useCallback(() => setCommandPaletteOpen(true), []);
  const closeCommandPalette = useCallback(() => setCommandPaletteOpen(false), []);

  const openShortcutsModal = useCallback(() => setShortcutsModalOpen(true), []);
  const closeShortcutsModal = useCallback(() => setShortcutsModalOpen(false), []);
  const openQuickCreateCustomer = useCallback(() => setQuickCreateCustomerOpen(true), []);
  const closeQuickCreateCustomer = useCallback(() => setQuickCreateCustomerOpen(false), []);
  const openQuickCreateInvoice = useCallback(() => setQuickCreateInvoiceOpen(true), []);
  const closeQuickCreateInvoice = useCallback(() => setQuickCreateInvoiceOpen(false), []);

  const pushRecentCustomer = useCallback((customer) => {
    if (!customer?.id) return;
    setRecentCustomers((prev) => {
      const deduped = prev.filter((c) => c.id !== customer.id);
      const next = [customer, ...deduped].slice(0, 8);
      try {
        localStorage.setItem('quick_recent_customers', JSON.stringify(next));
      } catch {
        // no-op when storage is unavailable
      }
      return next;
    });
  }, []);

  // Map shortcut id → action
  const actions = {
    'command-palette': openCommandPalette,
    'shortcut-help': openShortcutsModal,
    'quick-create-invoice': openQuickCreateInvoice,
    'quick-add-customer': openQuickCreateCustomer,
    // 'submit-form' is handled by individual form components via the context
    // 'close' is handled below
  };

  // Subscribers for Cmd+Enter (forms register/unregister themselves)
  const [formSubmitHandler, setFormSubmitHandler] = useState(null);

  const registerFormSubmit = useCallback((fn) => {
    setFormSubmitHandler(() => fn);
  }, []);

  const unregisterFormSubmit = useCallback(() => {
    setFormSubmitHandler(null);
  }, []);

  const handleKeyDown = useCallback((e, inInput) => {
    const def = SHORTCUT_DEFS.find((d) => d.match(e));
    if (!def) return;

    // If we're in a typing target and this shortcut doesn't override inputs, skip
    if (inInput && !def.ignoreInput) return;

    if (def.id === 'close') {
      // Close topmost layer: command palette > shortcuts modal > nothing
      if (commandPaletteOpen) {
        e.preventDefault();
        closeCommandPalette();
        return;
      }
      if (shortcutsModalOpen) {
        e.preventDefault();
        closeShortcutsModal();
        return;
      }
      if (quickCreateInvoiceOpen) {
        e.preventDefault();
        closeQuickCreateInvoice();
        return;
      }
      if (quickCreateCustomerOpen) {
        e.preventDefault();
        closeQuickCreateCustomer();
        return;
      }
      return; // let native Escape work for other elements
    }

    if (def.id === 'submit-form') {
      if (formSubmitHandler) {
        e.preventDefault();
        formSubmitHandler(e);
        return;
      }

      if (submitFocusedForm(e)) {
        e.preventDefault();
      }
      return;
    }

    const action = actions[def.id];
    if (action) {
      e.preventDefault();
      action();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commandPaletteOpen, shortcutsModalOpen, quickCreateInvoiceOpen, quickCreateCustomerOpen, formSubmitHandler]);

  useKeyboardShortcuts(handleKeyDown);

  return (
    <KeyboardShortcutsContext.Provider
      value={{
        commandPaletteOpen,
        openCommandPalette,
        closeCommandPalette,
        shortcutsModalOpen,
        openShortcutsModal,
        closeShortcutsModal,
        quickCreateCustomerOpen,
        openQuickCreateCustomer,
        closeQuickCreateCustomer,
        quickCreateInvoiceOpen,
        openQuickCreateInvoice,
        closeQuickCreateInvoice,
        recentCustomers,
        pushRecentCustomer,
        registerFormSubmit,
        unregisterFormSubmit,
      }}
    >
      {children}
    </KeyboardShortcutsContext.Provider>
  );
}

export function useKeyboardShortcutsContext() {
  const ctx = useContext(KeyboardShortcutsContext);
  if (!ctx) throw new Error('useKeyboardShortcutsContext must be used inside KeyboardShortcutsProvider');
  return ctx;
}

export function useOptionalKeyboardShortcutsContext() {
  return useContext(KeyboardShortcutsContext);
}
