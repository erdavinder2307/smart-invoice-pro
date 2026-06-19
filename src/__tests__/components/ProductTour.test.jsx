import React from 'react';
import { render, act } from '@testing-library/react';
import ProductTour from '../../components/Tour/ProductTour';
import { useTour, TOUR_STEPS } from '../../context/TourContext';
import { ACTIONS, EVENTS, STATUS } from 'react-joyride';

// ── Mocks ──────────────────────────────────────────────────────────────────

// Capture Joyride props for assertions
let capturedOnEvent = null;
let capturedRun = false;
let capturedStepIndex = 0;
let capturedOptions = null;

jest.mock('react-joyride', () => {
  const ACTIONS = { NEXT: 'next', PREV: 'prev', CLOSE: 'close', SKIP: 'skip', START: 'start', STOP: 'stop', RESET: 'reset', RESTART: 'restart', INDEX: 'index', UPDATE: 'update' };
  const EVENTS = { STEP_AFTER: 'step:after', TARGET_NOT_FOUND: 'error:target_not_found', TOUR_END: 'tour:end', TOUR_START: 'tour:start' };
  const STATUS = { FINISHED: 'finished', SKIPPED: 'skipped', IDLE: 'idle', READY: 'ready', RUNNING: 'running', WAITING: 'waiting', ERROR: 'error', LOADING: 'loading', PAUSED: 'paused' };

  const Joyride = ({ onEvent, run, stepIndex, options }) => {
    capturedOnEvent = onEvent;
    capturedRun = run;
    capturedStepIndex = stepIndex;
    capturedOptions = options;
    return null;
  };

  return { Joyride, ACTIONS, EVENTS, STATUS };
});

const mockStopTour = jest.fn();
const mockHandleStepNavigation = jest.fn();
const mockRetryCurrentStep = jest.fn();
const mockSetRun = jest.fn();

jest.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/dashboard', search: '' }),
}));

jest.mock('../../context/TourContext', () => ({
  useTour: jest.fn(),
  TOUR_STEPS: Array.from({ length: 8 }, (_, i) => ({
    target: `.step-${i}`,
    title: `Step ${i}`,
    content: `Content ${i}`,
    disableBeacon: true,
  })),
  STEP_ROUTES: {
    0: '/dashboard',
    1: '/customers',
    2: '/quotes',
    3: '/invoices',
    4: '/products',
    5: '/purchase-orders',
    6: '/bank-accounts',
    7: '/reports',
  },
}));

function setupTourMock(overrides = {}) {
  useTour.mockReturnValue({
    run: false,
    stepIndex: 0,
    stopTour: mockStopTour,
    handleStepNavigation: mockHandleStepNavigation,
    retryCurrentStep: mockRetryCurrentStep,
    setRun: mockSetRun,
    ...overrides,
  });
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('ProductTour', () => {
  beforeEach(() => {
    capturedOnEvent = null;
    capturedRun = false;
    capturedStepIndex = 0;
    capturedOptions = null;
    jest.clearAllMocks();
    setupTourMock();
  });

  it('wires react-joyride v3 onEvent (not legacy callback)', () => {
    render(<ProductTour />);
    expect(typeof capturedOnEvent).toBe('function');
  });

  it('passes skipBeacon globally so tooltips open without a beacon click', () => {
    render(<ProductTour />);
    expect(capturedOptions).toEqual({ skipBeacon: true });
  });

  it('updates Joyride stepIndex when the tour advances', () => {
    setupTourMock({ run: true, stepIndex: 0 });
    const { rerender } = render(<ProductTour />);
    expect(capturedStepIndex).toBe(0);

    setupTourMock({ run: true, stepIndex: 1 });
    rerender(<ProductTour />);
    expect(capturedStepIndex).toBe(1);
  });

  it('renders without crashing and passes run/stepIndex to Joyride', () => {
    setupTourMock({ run: true, stepIndex: 2 });
    render(<ProductTour />);
    expect(capturedRun).toBe(true);
    expect(capturedStepIndex).toBe(2);
  });

  it('mounts with run=false when tour is not started', () => {
    render(<ProductTour />);
    expect(capturedRun).toBe(false);
  });

  // ── STATUS.FINISHED ───────────────────────────────────────────────────────
  it('calls stopTour(true, false) when STATUS is FINISHED', () => {
    render(<ProductTour />);
    act(() => {
      capturedOnEvent({ action: ACTIONS.NEXT, index: 0, status: STATUS.FINISHED, type: EVENTS.TOUR_END });
    });
    expect(mockStopTour).toHaveBeenCalledWith(true, false);
    expect(mockHandleStepNavigation).not.toHaveBeenCalled();
  });

  // ── STATUS.SKIPPED ────────────────────────────────────────────────────────
  it('calls stopTour(false, true) when STATUS is SKIPPED', () => {
    render(<ProductTour />);
    act(() => {
      capturedOnEvent({ action: ACTIONS.SKIP, index: 3, status: STATUS.SKIPPED, type: EVENTS.TOUR_END });
    });
    expect(mockStopTour).toHaveBeenCalledWith(false, true);
  });

  // ── EVENTS.STEP_AFTER + ACTIONS.NEXT on first step (dashboard → customers) ─
  it('calls handleStepNavigation(1) when Next is clicked on step 0', () => {
    render(<ProductTour />);
    act(() => {
      capturedOnEvent({ action: ACTIONS.NEXT, index: 0, status: STATUS.RUNNING, type: EVENTS.STEP_AFTER });
    });
    expect(mockHandleStepNavigation).toHaveBeenCalledWith(1);
    expect(mockStopTour).not.toHaveBeenCalled();
  });

  // ── EVENTS.STEP_AFTER + ACTIONS.NEXT (middle step) ───────────────────────
  it('calls handleStepNavigation with nextIndex when Next is clicked on a middle step', () => {
    render(<ProductTour />);
    act(() => {
      capturedOnEvent({ action: ACTIONS.NEXT, index: 2, status: STATUS.RUNNING, type: EVENTS.STEP_AFTER });
    });
    expect(mockHandleStepNavigation).toHaveBeenCalledWith(3);
    expect(mockStopTour).not.toHaveBeenCalled();
  });

  // ── EVENTS.STEP_AFTER + ACTIONS.PREV (middle step) ───────────────────────
  it('calls handleStepNavigation with prevIndex when Back is clicked', () => {
    render(<ProductTour />);
    act(() => {
      capturedOnEvent({ action: ACTIONS.PREV, index: 3, status: STATUS.RUNNING, type: EVENTS.STEP_AFTER });
    });
    expect(mockHandleStepNavigation).toHaveBeenCalledWith(2);
  });

  // ── EVENTS.STEP_AFTER + last step + NEXT = finish ────────────────────────
  it('calls stopTour(true) when Next is clicked on the last step', () => {
    const lastStepIndex = TOUR_STEPS.length - 1; // 7
    render(<ProductTour />);
    act(() => {
      capturedOnEvent({ action: ACTIONS.NEXT, index: lastStepIndex, status: STATUS.RUNNING, type: EVENTS.STEP_AFTER });
    });
    expect(mockStopTour).toHaveBeenCalledWith(true);
    expect(mockHandleStepNavigation).not.toHaveBeenCalled();
  });

  // ── EVENTS.STEP_AFTER + ACTIONS.CLOSE = skip ─────────────────────────────
  it('calls stopTour(false, true) when X (close) button is clicked on a step', () => {
    render(<ProductTour />);
    act(() => {
      capturedOnEvent({ action: ACTIONS.CLOSE, index: 2, status: STATUS.RUNNING, type: EVENTS.STEP_AFTER });
    });
    expect(mockStopTour).toHaveBeenCalledWith(false, true);
    expect(mockHandleStepNavigation).not.toHaveBeenCalled();
  });

  // ── EVENTS.TARGET_NOT_FOUND retries current step ─────────────────────────
  it('calls retryCurrentStep when target is not found', () => {
    render(<ProductTour />);
    act(() => {
      capturedOnEvent({ action: ACTIONS.NEXT, index: 1, status: STATUS.RUNNING, type: EVENTS.TARGET_NOT_FOUND });
    });
    expect(mockRetryCurrentStep).toHaveBeenCalled();
    expect(mockHandleStepNavigation).not.toHaveBeenCalled();
  });

  // ── Guard: back before first step ─────────────────────────────────────────
  it('calls stopTour(false, true) when Back is clicked on the first step (nextIndex < 0)', () => {
    render(<ProductTour />);
    act(() => {
      capturedOnEvent({ action: ACTIONS.PREV, index: 0, status: STATUS.RUNNING, type: EVENTS.STEP_AFTER });
    });
    expect(mockStopTour).toHaveBeenCalledWith(false, true);
  });

  // ── Irrelevant event types are silently ignored ───────────────────────────
  it('does not call stopTour or handleStepNavigation for unrelated event types', () => {
    render(<ProductTour />);
    act(() => {
      capturedOnEvent({ action: ACTIONS.START, index: 0, status: STATUS.RUNNING, type: 'tour:start' });
    });
    expect(mockStopTour).not.toHaveBeenCalled();
    expect(mockHandleStepNavigation).not.toHaveBeenCalled();
  });

  // ── EVENTS.TOUR_END ───────────────────────────────────────────────────────
  it('calls stopTour on TOUR_END even when status is still RUNNING', () => {
    render(<ProductTour />);
    act(() => {
      capturedOnEvent({ action: ACTIONS.NEXT, index: 0, status: STATUS.RUNNING, type: EVENTS.TOUR_END });
    });
    expect(mockStopTour).toHaveBeenCalledWith(false, false);
  });

  // ── STATUS.FINISHED takes priority over EVENTS.STEP_AFTER ────────────────
  it('handles FINISHED status even when type is STEP_AFTER (early return)', () => {
    render(<ProductTour />);
    act(() => {
      capturedOnEvent({ action: ACTIONS.NEXT, index: 5, status: STATUS.FINISHED, type: EVENTS.STEP_AFTER });
    });
    expect(mockStopTour).toHaveBeenCalledWith(true, false);
    expect(mockHandleStepNavigation).not.toHaveBeenCalled();
  });
});
