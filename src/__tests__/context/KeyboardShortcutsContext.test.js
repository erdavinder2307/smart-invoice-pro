import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import {
  KeyboardShortcutsProvider,
  useKeyboardShortcutsContext,
  useOptionalKeyboardShortcutsContext,
} from '../../context/KeyboardShortcutsContext';

let registeredHandler = null;

jest.mock('../../keyboard/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: (handler) => {
    registeredHandler = handler;
  },
}));

function Consumer() {
  const {
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
  } = useKeyboardShortcutsContext();

  return (
    <div>
      <span data-testid="command">{String(commandPaletteOpen)}</span>
      <span data-testid="help">{String(shortcutsModalOpen)}</span>
      <span data-testid="quick-customer">{String(quickCreateCustomerOpen)}</span>
      <span data-testid="quick-invoice">{String(quickCreateInvoiceOpen)}</span>
      <span data-testid="recent-count">{String(recentCustomers.length)}</span>
      <button onClick={openCommandPalette}>open-command</button>
      <button onClick={closeCommandPalette}>close-command</button>
      <button onClick={openShortcutsModal}>open-help</button>
      <button onClick={closeShortcutsModal}>close-help</button>
      <button onClick={openQuickCreateCustomer}>open-customer</button>
      <button onClick={closeQuickCreateCustomer}>close-customer</button>
      <button onClick={openQuickCreateInvoice}>open-invoice</button>
      <button onClick={closeQuickCreateInvoice}>close-invoice</button>
      <button onClick={() => pushRecentCustomer({ id: '1', name: 'Acme' })}>push-customer</button>
      <button onClick={() => registerFormSubmit(() => {})}>register-submit</button>
      <button onClick={unregisterFormSubmit}>unregister-submit</button>
    </div>
  );
}

function OptionalConsumer() {
  const ctx = useOptionalKeyboardShortcutsContext();
  return <span data-testid="optional">{ctx === null ? 'null' : 'value'}</span>;
}

function ThrowingConsumer() {
  useKeyboardShortcutsContext();
  return null;
}

describe('KeyboardShortcutsContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    registeredHandler = null;
    localStorage.clear();
  });

  it('manages modal states, recents, and keyboard handlers', async () => {
    render(
      <KeyboardShortcutsProvider>
        <Consumer />
      </KeyboardShortcutsProvider>
    );

    fireEvent.click(screen.getByText('open-command'));
    expect(screen.getByTestId('command').textContent).toBe('true');
    fireEvent.click(screen.getByText('open-help'));
    expect(screen.getByTestId('help').textContent).toBe('true');
    fireEvent.click(screen.getByText('open-customer'));
    expect(screen.getByTestId('quick-customer').textContent).toBe('true');
    fireEvent.click(screen.getByText('open-invoice'));
    expect(screen.getByTestId('quick-invoice').textContent).toBe('true');

    fireEvent.click(screen.getByText('push-customer'));
    expect(screen.getByTestId('recent-count').textContent).toBe('1');
    expect(localStorage.getItem('quick_recent_customers')).toContain('Acme');

    const eventCommand = {
      key: 'k',
      ctrlKey: true,
      metaKey: false,
      altKey: false,
      preventDefault: jest.fn(),
      target: { closest: () => null },
    };
    act(() => {
      registeredHandler(eventCommand, false);
    });
    expect(eventCommand.preventDefault).toHaveBeenCalled();

    const submitSpy = jest.fn();
    fireEvent.click(screen.getByText('register-submit'));
    // re-register with a visible spy
    const registerButton = screen.getByText('register-submit');
    fireEvent.click(registerButton);

    // Force submit path using focused form fallback
    const requestSubmit = jest.fn();
    const eventSubmit = {
      key: 'Enter',
      ctrlKey: true,
      metaKey: false,
      altKey: false,
      preventDefault: jest.fn(),
      target: { closest: () => ({ requestSubmit }) },
    };
    act(() => {
      registeredHandler(eventSubmit, false);
    });
    expect(eventSubmit.preventDefault).toHaveBeenCalled();

    fireEvent.click(screen.getByText('unregister-submit'));
    const eventClose = {
      key: 'Escape',
      ctrlKey: false,
      metaKey: false,
      altKey: false,
      preventDefault: jest.fn(),
      target: { closest: () => null },
    };
    act(() => {
      registeredHandler(eventClose, true);
    });
    expect(eventClose.preventDefault).toHaveBeenCalled();
  });

  it('throws for required hook outside provider and returns null for optional hook', async () => {
    expect(() => render(<ThrowingConsumer />)).toThrow(
      'useKeyboardShortcutsContext must be used inside KeyboardShortcutsProvider'
    );

    render(<OptionalConsumer />);
    await waitFor(() => {
      expect(screen.getByTestId('optional').textContent).toBe('null');
    });
  });
});
