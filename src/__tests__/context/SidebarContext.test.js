import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SidebarProvider, useSidebar } from '../../context/SidebarContext';

jest.mock('@mui/material/useMediaQuery', () => jest.fn(() => false));

function Consumer() {
  const { isCollapsed, mobileOpen, toggleSidebar, toggleMobileDrawer } = useSidebar();
  return (
    <div>
      <span data-testid="collapsed">{String(isCollapsed)}</span>
      <span data-testid="mobile">{String(mobileOpen)}</span>
      <button onClick={toggleSidebar}>toggle-sidebar</button>
      <button onClick={toggleMobileDrawer}>toggle-mobile</button>
    </div>
  );
}

function NoProviderConsumer() {
  const ctx = useSidebar();
  return <span data-testid="fallback">{String(ctx.isCollapsed)}-{String(ctx.mobileOpen)}-{String(ctx.isMobile)}</span>;
}

describe('SidebarContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides and toggles sidebar/mobile state', () => {
    localStorage.setItem('sidebarCollapsed', 'true');

    render(
      <SidebarProvider>
        <Consumer />
      </SidebarProvider>
    );

    expect(screen.getByTestId('collapsed').textContent).toBe('true');
    expect(screen.getByTestId('mobile').textContent).toBe('false');

    fireEvent.click(screen.getByText('toggle-sidebar'));
    expect(screen.getByTestId('collapsed').textContent).toBe('false');
    expect(localStorage.getItem('sidebarCollapsed')).toBe('false');

    fireEvent.click(screen.getByText('toggle-mobile'));
    expect(screen.getByTestId('mobile').textContent).toBe('true');
  });

  it('returns safe fallback outside provider', () => {
    render(<NoProviderConsumer />);
    expect(screen.getByTestId('fallback').textContent).toBe('false-false-false');
  });
});
