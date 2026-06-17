import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { TourProvider, useTour, TOUR_STEPS, STEP_ROUTES } from '../../context/TourContext';
import analyticsService from '../../services/analyticsService';
import { isDemoHost } from '../../utils/demoMode';

jest.mock('../../services/analyticsService', () => ({
  trackEvent: jest.fn()
}));

jest.mock('../../utils/demoMode', () => ({
  isDemoHost: jest.fn(() => true)
}));

const mockNavigate = jest.fn();
let mockLocation = { pathname: '/dashboard', search: '' };

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation
  };
});

function Consumer() {
  const {
    run,
    stepIndex,
    showWelcomeModal,
    showCompletionModal,
    tourSeen,
    startTour,
    stopTour,
    handleStepNavigation
  } = useTour();

  return (
    <div>
      <span data-testid="run">{String(run)}</span>
      <span data-testid="stepIndex">{stepIndex}</span>
      <span data-testid="showWelcomeModal">{String(showWelcomeModal)}</span>
      <span data-testid="showCompletionModal">{String(showCompletionModal)}</span>
      <span data-testid="tourSeen">{String(tourSeen)}</span>
      <button onClick={() => startTour(false)}>start-manual</button>
      <button onClick={() => startTour(true)}>start-auto</button>
      <button onClick={() => stopTour(true, false)}>stop-completed</button>
      <button onClick={() => stopTour(false, true)}>stop-skipped</button>
      <button onClick={() => handleStepNavigation(1)}>next-step</button>
    </div>
  );
}

describe('TourContext', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    isDemoHost.mockReturnValue(true);
    mockLocation = { pathname: '/dashboard', search: '' };
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ── Bug fix regression: welcome modal must NOT auto-show on plain dashboard visit ──
  it('does NOT show welcome modal on plain /dashboard visit (no ?startTour)', () => {
    render(
      <TourProvider>
        <Consumer />
      </TourProvider>
    );

    expect(screen.getByTestId('showWelcomeModal').textContent).toBe('false');
  });

  // ── Bug fix regression: tour must NOT auto-start (no phantom beacon) ─────
  it('does NOT auto-start tour (run stays false) on /dashboard without explicit start', () => {
    render(
      <TourProvider>
        <Consumer />
      </TourProvider>
    );

    act(() => { jest.advanceTimersByTime(1500); });
    expect(screen.getByTestId('run').textContent).toBe('false');
  });

  it('does not trigger welcome modal if not on demo host', () => {
    isDemoHost.mockReturnValue(false);
    mockLocation = { pathname: '/dashboard', search: '?startTour=true' };
    render(
      <TourProvider>
        <Consumer />
      </TourProvider>
    );

    expect(screen.getByTestId('showWelcomeModal').textContent).toBe('false');
  });

  // ── ?startTour=true URL param ─────────────────────────────────────────────
  it('shows welcome modal when ?startTour=true is in URL', () => {
    mockLocation = { pathname: '/dashboard', search: '?startTour=true' };
    render(
      <TourProvider>
        <Consumer />
      </TourProvider>
    );

    expect(screen.getByTestId('showWelcomeModal').textContent).toBe('true');
    // URL should have been cleared
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
  });

  it('does not show welcome modal on plain visit even after ?startTour was consumed', () => {
    // Simulate arriving via ?startTour=true, then navigating away and back
    mockLocation = { pathname: '/dashboard', search: '?startTour=true' };
    const { rerender } = render(
      <TourProvider>
        <Consumer />
      </TourProvider>
    );

    expect(screen.getByTestId('showWelcomeModal').textContent).toBe('true');

    // Close modal, navigate away then back — no auto-show
    mockLocation = { pathname: '/customers', search: '' };
    rerender(<TourProvider><Consumer /></TourProvider>);

    mockLocation = { pathname: '/dashboard', search: '' };
    rerender(<TourProvider><Consumer /></TourProvider>);

    // welcomeModal was set to false when we closed it (stopTour skipped)
    // run should still be false — no phantom beacon
    act(() => { jest.advanceTimersByTime(1000); });
    expect(screen.getByTestId('run').textContent).toBe('false');
  });

  // ── Manual start ─────────────────────────────────────────────────────────
  it('starts tour manually on dashboard and runs after timeout', () => {
    render(
      <TourProvider>
        <Consumer />
      </TourProvider>
    );

    fireEvent.click(screen.getByText('start-manual'));
    expect(analyticsService.trackEvent).toHaveBeenCalledWith('tour_started', { mode: 'manual' });

    expect(screen.getByTestId('run').textContent).toBe('false');

    act(() => { jest.advanceTimersByTime(500); });

    expect(screen.getByTestId('run').textContent).toBe('true');
  });

  it('starts tour from non-dashboard path and navigates to /dashboard', () => {
    mockLocation = { pathname: '/customers', search: '' };
    render(
      <TourProvider>
        <Consumer />
      </TourProvider>
    );

    fireEvent.click(screen.getByText('start-manual'));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    expect(screen.getByTestId('run').textContent).toBe('false');
  });

  // ── Tour completion ───────────────────────────────────────────────────────
  it('completes the tour and shows completion modal', () => {
    render(
      <TourProvider>
        <Consumer />
      </TourProvider>
    );

    fireEvent.click(screen.getByText('start-manual'));
    act(() => { jest.advanceTimersByTime(500); });
    expect(screen.getByTestId('run').textContent).toBe('true');

    fireEvent.click(screen.getByText('stop-completed'));
    expect(screen.getByTestId('run').textContent).toBe('false');
    expect(screen.getByTestId('showCompletionModal').textContent).toBe('true');
    expect(localStorage.getItem('solidevbooks_tour_seen')).toBe('true');
    expect(analyticsService.trackEvent).toHaveBeenCalledWith('tour_completed');
  });

  it('skips the tour and marks it seen', () => {
    render(
      <TourProvider>
        <Consumer />
      </TourProvider>
    );

    fireEvent.click(screen.getByText('start-manual'));
    act(() => { jest.advanceTimersByTime(500); });

    fireEvent.click(screen.getByText('stop-skipped'));
    expect(screen.getByTestId('run').textContent).toBe('false');
    expect(localStorage.getItem('solidevbooks_tour_seen')).toBe('true');
    expect(analyticsService.trackEvent).toHaveBeenCalledWith('tour_skipped', { step_index: 0 });
  });

  // ── Step navigation ───────────────────────────────────────────────────────
  it('navigates to next route on step navigation', () => {
    render(
      <TourProvider>
        <Consumer />
      </TourProvider>
    );

    fireEvent.click(screen.getByText('start-manual'));
    act(() => { jest.advanceTimersByTime(500); });

    fireEvent.click(screen.getByText('next-step'));
    expect(screen.getByTestId('stepIndex').textContent).toBe('1');
    expect(mockNavigate).toHaveBeenCalledWith('/customers');
    expect(screen.getByTestId('run').textContent).toBe('false');
    expect(analyticsService.trackEvent).toHaveBeenCalledWith('tour_step_completed', {
      step_index: 0,
      step_title: TOUR_STEPS[0].title
    });
  });

  it('resumes tour after route change (pendingResume)', () => {
    const { rerender } = render(
      <TourProvider>
        <Consumer />
      </TourProvider>
    );

    fireEvent.click(screen.getByText('start-manual'));
    act(() => { jest.advanceTimersByTime(500); });

    fireEvent.click(screen.getByText('next-step'));
    expect(mockNavigate).toHaveBeenCalledWith('/customers');

    // Simulate route change
    mockLocation = { pathname: '/customers', search: '' };
    rerender(<TourProvider><Consumer /></TourProvider>);

    act(() => { jest.advanceTimersByTime(800); });

    expect(screen.getByTestId('run').textContent).toBe('true');
  });

  it('does NOT resume tour on route change if tour was never started', () => {
    const { rerender } = render(
      <TourProvider>
        <Consumer />
      </TourProvider>
    );

    // Navigate without starting tour
    mockLocation = { pathname: '/customers', search: '' };
    rerender(<TourProvider><Consumer /></TourProvider>);

    act(() => { jest.advanceTimersByTime(1000); });

    expect(screen.getByTestId('run').textContent).toBe('false');
  });

  // ── Error boundary ────────────────────────────────────────────────────────
  it('throws error when useTour is used outside TourProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    function BadComponent() {
      useTour();
      return null;
    }

    expect(() => render(<BadComponent />)).toThrow('useTour must be used within a TourProvider');
    consoleSpy.mockRestore();
  });
});
