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

  it('initializes and triggers welcome modal on first dashboard visit (demo host)', () => {
    render(
      <TourProvider>
        <Consumer />
      </TourProvider>
    );

    expect(screen.getByTestId('showWelcomeModal').textContent).toBe('true');
    expect(sessionStorage.getItem('solidevbooks_tour_session_seen')).toBe('true');
  });

  it('does NOT auto-start tour (run stays false) on /dashboard without explicit start', () => {
    // Ensures the fix: no phantom beacon without explicit tour start
    render(
      <TourProvider>
        <Consumer />
      </TourProvider>
    );

    // Even after timers fire, run must stay false without explicit startTour()
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByTestId('run').textContent).toBe('false');
  });

  it('does not trigger welcome modal if not on demo host', () => {
    isDemoHost.mockReturnValue(false);
    render(
      <TourProvider>
        <Consumer />
      </TourProvider>
    );

    expect(screen.getByTestId('showWelcomeModal').textContent).toBe('false');
  });

  it('does not trigger welcome modal if already seen in session', () => {
    sessionStorage.setItem('solidevbooks_tour_session_seen', 'true');
    render(
      <TourProvider>
        <Consumer />
      </TourProvider>
    );

    expect(screen.getByTestId('showWelcomeModal').textContent).toBe('false');
  });

  it('starts tour manually on dashboard and runs it after timeout', () => {
    render(
      <TourProvider>
        <Consumer />
      </TourProvider>
    );

    fireEvent.click(screen.getByText('start-manual'));
    expect(analyticsService.trackEvent).toHaveBeenCalledWith('tour_started', { mode: 'manual' });

    // Assert run is false before timeout
    expect(screen.getByTestId('run').textContent).toBe('false');

    act(() => {
      jest.advanceTimersByTime(400);
    });

    expect(screen.getByTestId('run').textContent).toBe('true');
  });

  it('starts tour from non-dashboard path and redirects', () => {
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

  it('completes the tour successfully', () => {
    render(
      <TourProvider>
        <Consumer />
      </TourProvider>
    );

    fireEvent.click(screen.getByText('start-manual'));
    act(() => {
      jest.advanceTimersByTime(400);
    });
    expect(screen.getByTestId('run').textContent).toBe('true');

    fireEvent.click(screen.getByText('stop-completed'));
    expect(screen.getByTestId('run').textContent).toBe('false');
    expect(screen.getByTestId('showCompletionModal').textContent).toBe('true');
    expect(localStorage.getItem('solidevbooks_tour_seen')).toBe('true');
    expect(analyticsService.trackEvent).toHaveBeenCalledWith('tour_completed');
  });

  it('skips the tour', () => {
    render(
      <TourProvider>
        <Consumer />
      </TourProvider>
    );

    fireEvent.click(screen.getByText('start-manual'));
    act(() => {
      jest.advanceTimersByTime(400);
    });

    fireEvent.click(screen.getByText('stop-skipped'));
    expect(screen.getByTestId('run').textContent).toBe('false');
    expect(localStorage.getItem('solidevbooks_tour_seen')).toBe('true');
    expect(analyticsService.trackEvent).toHaveBeenCalledWith('tour_skipped', { step_index: 0 });
  });

  it('handles step navigation and changes route', () => {
    render(
      <TourProvider>
        <Consumer />
      </TourProvider>
    );

    fireEvent.click(screen.getByText('start-manual'));
    act(() => {
      jest.advanceTimersByTime(400);
    });

    fireEvent.click(screen.getByText('next-step'));
    expect(screen.getByTestId('stepIndex').textContent).toBe('1');
    expect(mockNavigate).toHaveBeenCalledWith('/customers');
    expect(screen.getByTestId('run').textContent).toBe('false');
    expect(analyticsService.trackEvent).toHaveBeenCalledWith('tour_step_completed', {
      step_index: 0,
      step_title: TOUR_STEPS[0].title
    });
  });

  it('resumes tour once expected route is navigated to (after pendingResume)', () => {
    const { rerender } = render(
      <TourProvider>
        <Consumer />
      </TourProvider>
    );

    fireEvent.click(screen.getByText('start-manual'));
    act(() => {
      jest.advanceTimersByTime(400);
    });

    // Navigate to step 1 route
    fireEvent.click(screen.getByText('next-step'));
    expect(mockNavigate).toHaveBeenCalledWith('/customers');

    // Simulate location route change to customer route
    mockLocation = { pathname: '/customers', search: '' };

    // Rerender to trigger useLocation change
    rerender(
      <TourProvider>
        <Consumer />
      </TourProvider>
    );

    // Advance timers past the 600ms delay
    act(() => {
      jest.advanceTimersByTime(700);
    });

    // Check if run resumed
    expect(screen.getByTestId('run').textContent).toBe('true');
  });

  it('does NOT resume tour on route change if tour was never started', () => {
    // Ensures the phantom beacon fix: auto-resume must not fire without isTourActiveRef
    const { rerender } = render(
      <TourProvider>
        <Consumer />
      </TourProvider>
    );

    // Simulate navigating to /customers without starting tour
    mockLocation = { pathname: '/customers', search: '' };
    rerender(
      <TourProvider>
        <Consumer />
      </TourProvider>
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByTestId('run').textContent).toBe('false');
  });

  it('handles URL startTour parameter and shows welcome modal', () => {
    mockLocation = { pathname: '/dashboard', search: '?startTour=true' };
    render(
      <TourProvider>
        <Consumer />
      </TourProvider>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    expect(screen.getByTestId('showWelcomeModal').textContent).toBe('true');
  });

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
