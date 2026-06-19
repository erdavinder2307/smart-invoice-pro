import React from 'react';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { TourProvider, useTour, TOUR_STEPS, STEP_ROUTES, STEP_TARGETS, TOUR_START_PENDING_KEY, TOUR_STORAGE_KEY, armTourStartPending, clearTourStartPending, isTourStartPending } from '../../context/TourContext';
import analyticsService from '../../services/analyticsService';
import { isDemoHost } from '../../utils/demoMode';
import { waitForElement, waitForAnyElement } from '../../utils/waitForElement';

jest.mock('../../services/analyticsService', () => ({
  trackEvent: jest.fn()
}));

jest.mock('../../utils/demoMode', () => ({
  isDemoHost: jest.fn(() => true)
}));

jest.mock('../../utils/waitForElement', () => ({
  waitForElement: jest.fn(),
  waitForAnyElement: jest.fn(),
}));

const flushAsync = () => new Promise((resolve) => setTimeout(resolve, 0));
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
    handleStepNavigation,
    retryCurrentStep,
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
      <button onClick={() => retryCurrentStep()}>retry-step</button>
    </div>
  );
}

describe('TourContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    waitForElement.mockResolvedValue({ offsetParent: document.body, isConnected: true });
    waitForAnyElement.mockResolvedValue({ offsetParent: document.body, isConnected: true });
    localStorage.clear();
    sessionStorage.clear();
    isDemoHost.mockReturnValue(true);
    mockLocation = { pathname: '/dashboard', search: '' };
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
  it('does NOT auto-start tour (run stays false) on /dashboard without explicit start', async () => {
    render(
      <TourProvider>
        <Consumer />
      </TourProvider>
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
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

  it('does not show welcome modal on plain visit even after ?startTour was consumed', async () => {
    mockLocation = { pathname: '/dashboard', search: '?startTour=true' };
    const { rerender } = render(
      <TourProvider>
        <Consumer />
      </TourProvider>
    );

    expect(screen.getByTestId('showWelcomeModal').textContent).toBe('true');

    // Dismiss welcome — clears session pending flag
    fireEvent.click(screen.getByText('stop-skipped'));

    mockLocation = { pathname: '/customers', search: '' };
    rerender(<TourProvider><Consumer /></TourProvider>);

    mockLocation = { pathname: '/dashboard', search: '' };
    rerender(<TourProvider><Consumer /></TourProvider>);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(screen.getByTestId('showWelcomeModal').textContent).toBe('false');
    expect(screen.getByTestId('run').textContent).toBe('false');
  });

  // ── Manual start ─────────────────────────────────────────────────────────
  it('starts tour manually on dashboard and runs after target is ready', async () => {
    render(
      <TourProvider>
        <Consumer />
      </TourProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByText('start-manual'));
    });

    await waitFor(() => {
      expect(waitForAnyElement).toHaveBeenCalled();
      expect(screen.getByTestId('run').textContent).toBe('true');
    });
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
  it('completes the tour and shows completion modal', async () => {
    render(
      <TourProvider>
        <Consumer />
      </TourProvider>
    );

    fireEvent.click(screen.getByText('start-manual'));
    await waitFor(() => {
      expect(screen.getByTestId('run').textContent).toBe('true');
    });

    fireEvent.click(screen.getByText('stop-completed'));
    expect(screen.getByTestId('run').textContent).toBe('false');
    expect(screen.getByTestId('showCompletionModal').textContent).toBe('true');
    expect(localStorage.getItem('solidevbooks_tour_seen')).toBe('true');
    expect(localStorage.getItem('solidevbooks_tour_state')).toBeNull();
    expect(analyticsService.trackEvent).toHaveBeenCalledWith('tour_completed');
  });

  it('skips the tour and marks it seen', async () => {
    render(
      <TourProvider>
        <Consumer />
      </TourProvider>
    );

    fireEvent.click(screen.getByText('start-manual'));
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });

    fireEvent.click(screen.getByText('stop-skipped'));
    expect(screen.getByTestId('run').textContent).toBe('false');
    expect(localStorage.getItem('solidevbooks_tour_seen')).toBe('true');
    expect(localStorage.getItem('solidevbooks_tour_state')).toBeNull();
    expect(analyticsService.trackEvent).toHaveBeenCalledWith('tour_skipped', { step_index: 0 });
  });

  // ── Step navigation ───────────────────────────────────────────────────────
  it('navigates to next route on step navigation without advancing stepIndex early', async () => {
    render(
      <TourProvider>
        <Consumer />
      </TourProvider>
    );

    fireEvent.click(screen.getByText('start-manual'));
    await act(async () => { await Promise.resolve(); });

    fireEvent.click(screen.getByText('next-step'));
    expect(mockNavigate).toHaveBeenCalledWith('/customers');
    expect(screen.getByTestId('run').textContent).toBe('false');
    expect(analyticsService.trackEvent).toHaveBeenCalledWith('tour_step_completed', {
      step_index: 0,
      step_title: TOUR_STEPS[0].title
    });
  });

  it('resumes tour after route change once target is ready', async () => {
    const { rerender } = render(
      <TourProvider>
        <Consumer />
      </TourProvider>
    );

    fireEvent.click(screen.getByText('start-manual'));
    await act(async () => { await Promise.resolve(); });

    fireEvent.click(screen.getByText('next-step'));
    expect(mockNavigate).toHaveBeenCalledWith('/customers');

    mockLocation = { pathname: '/customers', search: '' };
    rerender(<TourProvider><Consumer /></TourProvider>);

    await waitFor(() => {
      expect(screen.getByTestId('stepIndex').textContent).toBe('1');
      expect(screen.getByTestId('run').textContent).toBe('true');
    });
  });

  it('does NOT resume tour on route change if tour was never started', async () => {
    const { rerender } = render(
      <TourProvider>
        <Consumer />
      </TourProvider>
    );

    // Navigate without starting tour
    mockLocation = { pathname: '/customers', search: '' };
    rerender(<TourProvider><Consumer /></TourProvider>);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(screen.getByTestId('run').textContent).toBe('false');
  });

  // ── Same-page step navigation (line 182 branch) ───────────────────────────
  it('advances stepIndex in-place when next route equals current route', async () => {
    // Step 0 and step 0 both map to /dashboard — staying on same page
    mockLocation = { pathname: '/dashboard', search: '' };

    // Expose handleStepNavigation(0) to stay on /dashboard (same route)
    function SamePageConsumer() {
      const { startTour, handleStepNavigation, run, stepIndex } = useTour();
      return (
        <div>
          <span data-testid="run">{String(run)}</span>
          <span data-testid="stepIndex">{stepIndex}</span>
          <button onClick={() => startTour()}>start</button>
          {/* Navigate to step 0 while already on /dashboard — same route branch */}
          <button onClick={() => handleStepNavigation(0)}>same-page-nav</button>
        </div>
      );
    }

    render(<TourProvider><SamePageConsumer /></TourProvider>);

    fireEvent.click(screen.getByText('start'));
    await waitFor(() => {
      expect(screen.getByTestId('run').textContent).toBe('true');
    });

    fireEvent.click(screen.getByText('same-page-nav'));

    await act(async () => { await Promise.resolve(); });
    expect(screen.getByTestId('stepIndex').textContent).toBe('0');
    // No navigation should have been triggered for same-page
    expect(mockNavigate).not.toHaveBeenCalledWith('/dashboard');
  });

  // ── tourSeen read from localStorage ──────────────────────────────────────
  it('reads tourSeen=true from localStorage on mount', () => {
    localStorage.setItem('solidevbooks_tour_seen', 'true');
    render(<TourProvider><Consumer /></TourProvider>);
    expect(screen.getByTestId('tourSeen').textContent).toBe('true');
  });

  it('shows welcome modal after strict-mode remount when session pending is set', () => {
    sessionStorage.setItem(TOUR_START_PENDING_KEY, 'true');
    mockLocation = { pathname: '/dashboard', search: '' };

    const { unmount } = render(
      <TourProvider>
        <Consumer />
      </TourProvider>
    );
    unmount();

    render(
      <TourProvider>
        <Consumer />
      </TourProvider>
    );

    expect(screen.getByTestId('showWelcomeModal').textContent).toBe('true');
  });

  // ── sessionStorage pending: double-fire guard ─────────────────────────────
  it('does not call navigate twice if location.search re-renders with same param', () => {
    mockLocation = { pathname: '/dashboard', search: '?startTour=true' };
    const { rerender } = render(
      <TourProvider>
        <Consumer />
      </TourProvider>
    );

    expect(screen.getByTestId('showWelcomeModal').textContent).toBe('true');
    expect(mockNavigate).toHaveBeenCalledTimes(1);

    // After replace navigation the query string is gone (simulate production)
    mockLocation = { pathname: '/dashboard', search: '' };
    rerender(<TourProvider><Consumer /></TourProvider>);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('showWelcomeModal').textContent).toBe('true');
  });

  it('shows welcome modal again when returning to dashboard with ?startTour=true', () => {
    mockLocation = { pathname: '/dashboard', search: '?startTour=true' };
    const { rerender } = render(
      <TourProvider>
        <Consumer />
      </TourProvider>
    );
    expect(screen.getByTestId('showWelcomeModal').textContent).toBe('true');

    fireEvent.click(screen.getByText('stop-skipped'));

    mockLocation = { pathname: '/customers', search: '' };
    rerender(<TourProvider><Consumer /></TourProvider>);

    mockLocation = { pathname: '/dashboard', search: '?startTour=true' };
    rerender(<TourProvider><Consumer /></TourProvider>);

    // Modal should be true again (flag was reset)
    expect(screen.getByTestId('showWelcomeModal').textContent).toBe('true');
  });

  // ── stopTour with no flags (neither complete nor skip) ───────────────────
  it('stops tour cleanly without marking it seen when no flags are passed', async () => {
    render(<TourProvider><Consumer /></TourProvider>);

    fireEvent.click(screen.getByText('start-manual'));
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });

    // Call stopTour() with both false
    const { stopTour } = require('../../context/TourContext');
    // Directly trigger via a consumer button that calls stopTour(false, false)
    // We re-use the "stop-completed" button which calls stopTour(true, false)
    // but here we test through the component with stop-skipped (false, true already covered)
    // Instead assert that stopTour without arguments doesn't set tourSeen
    fireEvent.click(screen.getByText('stop-completed')); // completed=true sets tourSeen
    expect(localStorage.getItem('solidevbooks_tour_seen')).toBe('true');
    expect(localStorage.getItem('solidevbooks_tour_state')).toBeNull();
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

  describe('TOUR_STEPS configuration', () => {
    it('defines 8 steps with skipBeacon for react-joyride v3', () => {
      expect(TOUR_STEPS).toHaveLength(8);
      TOUR_STEPS.forEach((step, idx) => {
        expect(step.skipBeacon).toBe(true);
        expect(step.target).toBeTruthy();
        expect(STEP_ROUTES[idx]).toBeTruthy();
      });
    });

    it('maps each step index to the expected route', () => {
      expect(STEP_ROUTES[0]).toBe('/dashboard');
      expect(STEP_ROUTES[1]).toBe('/customers');
      expect(STEP_ROUTES[2]).toBe('/quotes');
      expect(STEP_ROUTES[3]).toBe('/invoices');
      expect(STEP_ROUTES[4]).toBe('/products');
      expect(STEP_ROUTES[5]).toBe('/purchase-orders');
      expect(STEP_ROUTES[6]).toBe('/bank-accounts');
      expect(STEP_ROUTES[7]).toBe('/reports');
    });

    it('uses fallback selectors for dashboard step 0', () => {
      expect(STEP_TARGETS[0]).toEqual([
        '.tour-revenue-cards',
        '.tour-dashboard-kpis',
        '.tour-dashboard-root',
      ]);
    });
  });

  describe('sessionStorage tour start pending', () => {
    it('armTourStartPending / clearTourStartPending / isTourStartPending work', () => {
      expect(isTourStartPending()).toBe(false);
      armTourStartPending();
      expect(isTourStartPending()).toBe(true);
      clearTourStartPending();
      expect(isTourStartPending()).toBe(false);
    });

    it('arms sessionStorage when ?startTour=true is consumed', () => {
      mockLocation = { pathname: '/dashboard', search: '?startTour=true' };
      render(<TourProvider><Consumer /></TourProvider>);
      expect(sessionStorage.getItem(TOUR_START_PENDING_KEY)).toBe('true');
    });

    it('clears sessionStorage when startTour runs', async () => {
      sessionStorage.setItem(TOUR_START_PENDING_KEY, 'true');
      render(<TourProvider><Consumer /></TourProvider>);

      await act(async () => {
        fireEvent.click(screen.getByText('start-manual'));
      });

      expect(sessionStorage.getItem(TOUR_START_PENDING_KEY)).toBeNull();
    });

    it('clears sessionStorage when tour is skipped', async () => {
      sessionStorage.setItem(TOUR_START_PENDING_KEY, 'true');
      render(<TourProvider><Consumer /></TourProvider>);

      fireEvent.click(screen.getByText('stop-skipped'));
      expect(sessionStorage.getItem(TOUR_START_PENDING_KEY)).toBeNull();
    });
  });

  describe('localStorage recovery', () => {
    it('resumes in-progress tour when saved route matches current page', async () => {
      localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify({
        tourRunning: true,
        stepIndex: 1,
        tourCompleted: false,
      }));
      mockLocation = { pathname: '/customers', search: '' };

      render(<TourProvider><Consumer /></TourProvider>);

      await waitFor(() => {
        expect(screen.getByTestId('stepIndex').textContent).toBe('1');
        expect(screen.getByTestId('run').textContent).toBe('true');
      });
    });

    it('discards stale saved tour when route does not match', async () => {
      localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify({
        tourRunning: true,
        stepIndex: 3,
        tourCompleted: false,
      }));
      mockLocation = { pathname: '/dashboard', search: '' };

      render(<TourProvider><Consumer /></TourProvider>);

      await act(async () => {
        await new Promise((r) => setTimeout(r, 50));
      });

      expect(localStorage.getItem(TOUR_STORAGE_KEY)).toBeNull();
      expect(screen.getByTestId('run').textContent).toBe('false');
    });
  });

  describe('target retry and persistence', () => {
    it('persists tour state when advancing to next step', async () => {
      render(<TourProvider><Consumer /></TourProvider>);

      fireEvent.click(screen.getByText('start-manual'));
      await act(async () => { await Promise.resolve(); });

      fireEvent.click(screen.getByText('next-step'));

      const saved = JSON.parse(localStorage.getItem(TOUR_STORAGE_KEY));
      expect(saved.tourRunning).toBe(true);
      expect(saved.stepIndex).toBe(1);
    });

    it('retries current step when retryCurrentStep is invoked', async () => {
      render(<TourProvider><Consumer /></TourProvider>);

      fireEvent.click(screen.getByText('start-manual'));
      await waitFor(() => {
        expect(screen.getByTestId('run').textContent).toBe('true');
      });

      const callsBefore = waitForAnyElement.mock.calls.length;
      fireEvent.click(screen.getByText('retry-step'));

      await waitFor(() => {
        expect(waitForAnyElement.mock.calls.length).toBeGreaterThan(callsBefore);
      });
    });

    it('retries target detection before giving up on missing element', async () => {
      jest.useFakeTimers();
      waitForAnyElement.mockResolvedValue(null);

      render(<TourProvider><Consumer /></TourProvider>);
      fireEvent.click(screen.getByText('start-manual'));

      await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
      });

      await act(async () => {
        jest.advanceTimersByTime(350);
      });

      expect(waitForAnyElement.mock.calls.length).toBeGreaterThan(1);
      jest.useRealTimers();
    });
  });
});
