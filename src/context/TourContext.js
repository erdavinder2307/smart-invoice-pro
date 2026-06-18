import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import analyticsService from '../services/analyticsService';
import { isDemoHost } from '../utils/demoMode';
import { waitForElement } from '../utils/waitForElement';
import { tourDebug, tourWarn } from '../utils/tourDebug';

const TourContext = createContext(null);

export const TOUR_STORAGE_KEY = 'solidevbooks_tour_state';
export const TOUR_SEEN_KEY = 'solidevbooks_tour_seen';

export const STEP_ROUTES = {
  0: '/dashboard',
  1: '/customers',
  2: '/quotes',
  3: '/invoices',
  4: '/products',
  5: '/purchase-orders',
  6: '/bank-accounts',
  7: '/reports',
};

export const TOUR_STEPS = [
  {
    target: '.tour-dashboard-root',
    content: 'This dashboard provides operational visibility across your financial workflows. Track revenue, invoices, and expenses in real-time.',
    disableBeacon: true,
    placement: 'bottom',
    title: 'Operational Dashboard',
  },
  {
    target: '.tour-customer-list',
    content: 'Customers are the starting point for quote-to-cash workflows. Manage customer profiles, details, and transaction history.',
    disableBeacon: true,
    placement: 'bottom',
    title: 'Customers Module',
  },
  {
    target: '.tour-quote-pipeline',
    content: 'Sales teams create and track quotations before invoicing. Monitor quote status from draft to converted.',
    disableBeacon: true,
    placement: 'bottom',
    title: 'Quotations Module',
  },
  {
    target: '.tour-invoice-lifecycle',
    content: 'Invoices manage billing, collections, and receivables. Track invoice lifecycle states and record payments.',
    disableBeacon: true,
    placement: 'bottom',
    title: 'Invoices Module',
  },
  {
    target: '.tour-inventory-status',
    content: 'Track stock levels, purchasing needs, and inventory valuation across your product line.',
    disableBeacon: true,
    placement: 'bottom',
    title: 'Inventory Module',
  },
  {
    target: '.tour-purchase-workflow',
    content: 'Manage purchasing operations from vendor purchase orders through settlement.',
    disableBeacon: true,
    placement: 'bottom',
    title: 'Purchase Orders Module',
  },
  {
    target: '.tour-banking-accounts',
    content: 'Monitor cash movement, connect bank accounts, and reconcile transactions.',
    disableBeacon: true,
    placement: 'bottom',
    title: 'Banking & Reconciliation',
  },
  {
    target: '.tour-reports-area',
    content: 'Gain operational and financial visibility through built-in P&L, Balance Sheet, and Aging reports.',
    disableBeacon: true,
    placement: 'bottom',
    title: 'Financial Reports',
  },
];

function readPersistedTourState() {
  try {
    const raw = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

function writePersistedTourState(state) {
  if (state?.tourRunning) {
    localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(state));
  } else {
    localStorage.removeItem(TOUR_STORAGE_KEY);
  }
}

export const TourProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const persisted = readPersistedTourState();

  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(persisted?.stepIndex ?? 0);
  const [tourRunning, setTourRunning] = useState(Boolean(persisted?.tourRunning));
  const [tourCompleted, setTourCompleted] = useState(Boolean(persisted?.tourCompleted));
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const [tourSeen, setTourSeen] = useState(() =>
    Boolean(localStorage.getItem(TOUR_SEEN_KEY))
  );

  const isTourActiveRef = useRef(tourRunning);
  const pendingStepRef = useRef(
    persisted?.tourRunning ? (persisted.stepIndex ?? 0) : null
  );
  const [pendingResume, setPendingResume] = useState(Boolean(persisted?.tourRunning));
  const resumeInFlightRef = useRef(false);
  const resumeGenerationRef = useRef(0);
  const startTourParamConsumedRef = useRef(false);

  useEffect(() => {
    isTourActiveRef.current = tourRunning;
  }, [tourRunning]);

  const persistTour = useCallback((partial) => {
    const next = {
      tourRunning: isTourActiveRef.current,
      stepIndex: pendingStepRef.current ?? stepIndex,
      tourCompleted,
      ...partial,
    };
    writePersistedTourState(next);
    tourDebug('persist', next);
  }, [stepIndex, tourCompleted]);

  const stopTour = useCallback((completed = false, skipped = false) => {
    setRun(false);
    isTourActiveRef.current = false;
    setPendingResume(false);
    pendingStepRef.current = null;
    resumeInFlightRef.current = false;
    setTourRunning(false);

    if (completed) {
      setTourCompleted(true);
      localStorage.setItem(TOUR_SEEN_KEY, 'true');
      setTourSeen(true);
      setShowCompletionModal(true);
      analyticsService.trackEvent('tour_completed');
      writePersistedTourState({ tourRunning: false, tourCompleted: true, stepIndex: 0 });
    } else if (skipped) {
      setTourCompleted(false);
      localStorage.setItem(TOUR_SEEN_KEY, 'true');
      setTourSeen(true);
      analyticsService.trackEvent('tour_skipped', { step_index: stepIndex });
      writePersistedTourState({ tourRunning: false, tourCompleted: false, stepIndex: 0 });
    } else {
      writePersistedTourState({ tourRunning: false, tourCompleted: false, stepIndex: 0 });
    }

    tourDebug('stopTour', { completed, skipped, stepIndex });
  }, [stepIndex]);

  const resumeCurrentStep = useCallback(async (idx) => {
    if (resumeInFlightRef.current) return;
    resumeInFlightRef.current = true;
    const generation = ++resumeGenerationRef.current;

    const route = STEP_ROUTES[idx];
    const selector = TOUR_STEPS[idx]?.target;

    tourDebug('resumeCurrentStep:start', {
      idx,
      route,
      selector,
      pathname: location.pathname,
      generation,
    });

    if (location.pathname !== route) {
      resumeInFlightRef.current = false;
      pendingStepRef.current = idx;
      setPendingResume(true);
      setRun(false);
      navigate(route);
      return;
    }

    setRun(false);
    const target = await waitForElement(selector, { timeout: 5000 });

    if (generation !== resumeGenerationRef.current) {
      resumeInFlightRef.current = false;
      tourDebug('resumeCurrentStep:stale', { idx, generation });
      return;
    }

    if (!target) {
      tourWarn('TARGET_NOT_FOUND', { idx, selector, route });
      resumeInFlightRef.current = false;
      if (idx + 1 < TOUR_STEPS.length) {
        pendingStepRef.current = idx + 1;
        setPendingResume(true);
        navigate(STEP_ROUTES[idx + 1]);
      } else {
        stopTour(true);
      }
      return;
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    if (generation !== resumeGenerationRef.current) {
      resumeInFlightRef.current = false;
      tourDebug('resumeCurrentStep:stale-after-wait', { idx, generation });
      return;
    }

    setStepIndex(idx);
    setRun(true);
    resumeInFlightRef.current = false;
    setPendingResume(false);
    pendingStepRef.current = null;

    persistTour({ tourRunning: true, stepIndex: idx, tourCompleted: false });

    tourDebug('resumeCurrentStep:running', { idx, selector });
  }, [location.pathname, navigate, persistTour, stopTour]);

  const startTour = useCallback((fromStart = false) => {
    setShowWelcomeModal(false);
    setShowCompletionModal(false);
    setTourCompleted(false);
    setStepIndex(0);
    setTourRunning(true);
    isTourActiveRef.current = true;
    resumeGenerationRef.current += 1;
    resumeInFlightRef.current = false;
    pendingStepRef.current = null;

    analyticsService.trackEvent('tour_started', { mode: fromStart ? 'auto' : 'manual' });
    persistTour({ tourRunning: true, stepIndex: 0, tourCompleted: false });

    tourDebug('startTour', { pathname: location.pathname });

    if (location.pathname !== '/dashboard') {
      pendingStepRef.current = 0;
      setPendingResume(true);
      setRun(false);
      navigate('/dashboard');
    } else {
      pendingStepRef.current = 0;
      resumeCurrentStep(0);
    }
  }, [location.pathname, navigate, persistTour, resumeCurrentStep]);

  const handleStepNavigation = useCallback((nextIdx) => {
    if (nextIdx < 0 || nextIdx >= TOUR_STEPS.length) return;

    analyticsService.trackEvent('tour_step_completed', {
      step_index: stepIndex,
      step_title: TOUR_STEPS[stepIndex]?.title || '',
    });

    tourDebug('handleStepNavigation', {
      from: stepIndex,
      to: nextIdx,
      route: STEP_ROUTES[nextIdx],
      pathname: location.pathname,
    });

    setRun(false);
    resumeGenerationRef.current += 1;
    resumeInFlightRef.current = false;
    pendingStepRef.current = nextIdx;
    setPendingResume(true);
    writePersistedTourState({
      tourRunning: true,
      stepIndex: nextIdx,
      tourCompleted: false,
    });

    const nextRoute = STEP_ROUTES[nextIdx];
    if (location.pathname !== nextRoute) {
      navigate(nextRoute);
    } else {
      resumeCurrentStep(nextIdx);
    }
  }, [location.pathname, navigate, resumeCurrentStep, stepIndex]);

  const retryCurrentStep = useCallback(() => {
    tourDebug('retryCurrentStep', { stepIndex });
    resumeCurrentStep(stepIndex);
  }, [resumeCurrentStep, stepIndex]);

  // ─── URL param: ?startTour=true (trigger only — state lives in context/storage) ─
  useEffect(() => {
    if (!isDemoHost()) return;
    const params = new URLSearchParams(location.search);
    if (params.get('startTour') !== 'true') return;
    if (startTourParamConsumedRef.current) return;

    startTourParamConsumedRef.current = true;
    navigate(location.pathname, { replace: true });
    setShowWelcomeModal(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  useEffect(() => {
    if (location.pathname !== '/dashboard') {
      startTourParamConsumedRef.current = false;
    }
  }, [location.pathname]);

  // ─── Resume after route change ───────────────────────────────────────────
  useEffect(() => {
    if (!isTourActiveRef.current) return;
    if (!pendingResume) return;
    if (run || resumeInFlightRef.current) return;

    const targetIdx = pendingStepRef.current ?? stepIndex;
    const expectedRoute = STEP_ROUTES[targetIdx];

    if (!expectedRoute || location.pathname !== expectedRoute) return;

    tourDebug('route-ready', { targetIdx, pathname: location.pathname });
    resumeCurrentStep(targetIdx);
  }, [location.pathname, resumeCurrentStep, run, stepIndex, pendingResume]);

  // ─── Recover in-progress tour after reload / strict-mode remount ─────────
  useEffect(() => {
    const saved = readPersistedTourState();
    if (!saved?.tourRunning || saved.tourCompleted) return;

    tourDebug('recover-from-storage', saved);
    isTourActiveRef.current = true;
    setTourRunning(true);
    setStepIndex(saved.stepIndex ?? 0);
    pendingStepRef.current = saved.stepIndex ?? 0;
    setPendingResume(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TourContext.Provider
      value={{
        run,
        setRun,
        stepIndex,
        setStepIndex,
        tourRunning,
        tourCompleted,
        showWelcomeModal,
        setShowWelcomeModal,
        showCompletionModal,
        setShowCompletionModal,
        tourSeen,
        startTour,
        stopTour,
        handleStepNavigation,
        retryCurrentStep,
      }}
    >
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};
