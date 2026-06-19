import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import analyticsService from '../services/analyticsService';
import { isDemoHost } from '../utils/demoMode';
import { waitForElement, waitForAnyElement } from '../utils/waitForElement';
import { tourDebug, tourWarn } from '../utils/tourDebug';

const TourContext = createContext(null);

export const TOUR_STORAGE_KEY = 'solidevbooks_tour_state';
export const TOUR_SEEN_KEY = 'solidevbooks_tour_seen';
export const TOUR_START_PENDING_KEY = 'solidevbooks_start_tour_pending';

export function armTourStartPending() {
  sessionStorage.setItem(TOUR_START_PENDING_KEY, 'true');
}

export function clearTourStartPending() {
  sessionStorage.removeItem(TOUR_START_PENDING_KEY);
}

export function isTourStartPending() {
  return sessionStorage.getItem(TOUR_START_PENDING_KEY) === 'true';
}

function readInitialWelcomeModal() {
  if (typeof window === 'undefined' || !isDemoHost()) return false;
  if (window.location.pathname !== '/dashboard') return false;

  const params = new URLSearchParams(window.location.search);
  if (params.get('startTour') === 'true') {
    armTourStartPending();
    return true;
  }

  return isTourStartPending();
}

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

export const STEP_TARGETS = {
  0: ['.tour-revenue-cards', '.tour-dashboard-kpis', '.tour-dashboard-root'],
};

export const TOUR_STEPS = [
  {
    target: '.tour-revenue-cards',
    content: 'This dashboard provides operational visibility across your financial workflows. Track revenue, invoices, and expenses in real-time.',
    skipBeacon: true,
    placement: 'bottom',
    title: 'Operational Dashboard',
  },
  {
    target: '.tour-customer-list',
    content: 'Customers are the starting point for quote-to-cash workflows. Manage customer profiles, details, and transaction history.',
    skipBeacon: true,
    placement: 'bottom',
    title: 'Customers Module',
  },
  {
    target: '.tour-quote-pipeline',
    content: 'Sales teams create and track quotations before invoicing. Monitor quote status from draft to converted.',
    skipBeacon: true,
    placement: 'bottom',
    title: 'Quotations Module',
  },
  {
    target: '.tour-invoice-lifecycle',
    content: 'Invoices manage billing, collections, and receivables. Track invoice lifecycle states and record payments.',
    skipBeacon: true,
    placement: 'bottom',
    title: 'Invoices Module',
  },
  {
    target: '.tour-inventory-status',
    content: 'Track stock levels, purchasing needs, and inventory valuation across your product line.',
    skipBeacon: true,
    placement: 'bottom',
    title: 'Inventory Module',
  },
  {
    target: '.tour-purchase-workflow',
    content: 'Manage purchasing operations from vendor purchase orders through settlement.',
    skipBeacon: true,
    placement: 'bottom',
    title: 'Purchase Orders Module',
  },
  {
    target: '.tour-banking-accounts',
    content: 'Monitor cash movement, connect bank accounts, and reconcile transactions.',
    skipBeacon: true,
    placement: 'bottom',
    title: 'Banking & Reconciliation',
  },
  {
    target: '.tour-reports-area',
    content: 'Gain operational and financial visibility through built-in P&L, Balance Sheet, and Aging reports.',
    skipBeacon: true,
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

function clearPersistedTourState() {
  localStorage.removeItem(TOUR_STORAGE_KEY);
}

export const TourProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const persisted = readPersistedTourState();
  const recoverIdx = persisted?.stepIndex ?? 0;
  const canRecoverTour = Boolean(
    persisted?.tourRunning &&
    !persisted?.tourCompleted &&
    STEP_ROUTES[recoverIdx] === location.pathname
  );

  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(canRecoverTour ? recoverIdx : 0);
  const [tourRunning, setTourRunning] = useState(canRecoverTour);
  const [tourCompleted, setTourCompleted] = useState(Boolean(persisted?.tourCompleted));
  const [showWelcomeModal, setShowWelcomeModal] = useState(readInitialWelcomeModal);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const [tourSeen, setTourSeen] = useState(() =>
    Boolean(localStorage.getItem(TOUR_SEEN_KEY))
  );

  const isTourActiveRef = useRef(canRecoverTour);
  const pendingStepRef = useRef(canRecoverTour ? recoverIdx : null);
  const [pendingResume, setPendingResume] = useState(canRecoverTour);
  const resumeInFlightRef = useRef(false);
  const resumeGenerationRef = useRef(0);
  const targetRetryRef = useRef({});

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
    clearTourStartPending();
    setShowWelcomeModal(false);
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
    const selectors = STEP_TARGETS[idx] || [selector];
    const target = selectors.length > 1
      ? await waitForAnyElement(selectors, { timeout: 5000 })
      : await waitForElement(selector, { timeout: 5000 });

    if (generation !== resumeGenerationRef.current) {
      resumeInFlightRef.current = false;
      tourDebug('resumeCurrentStep:stale', { idx, generation });
      return;
    }

    if (!target) {
      const attempts = (targetRetryRef.current[idx] ?? 0) + 1;
      targetRetryRef.current[idx] = attempts;
      tourWarn('TARGET_NOT_FOUND', { idx, selector, selectors, route, attempt: attempts });
      resumeInFlightRef.current = false;

      if (attempts < 10) {
        setPendingResume(true);
        setTimeout(() => {
          if (!isTourActiveRef.current) return;
          if ((pendingStepRef.current ?? idx) !== idx) return;
          resumeCurrentStep(idx);
        }, 300);
        return;
      }

      targetRetryRef.current[idx] = 0;
      if (idx + 1 < TOUR_STEPS.length) {
        pendingStepRef.current = idx + 1;
        setPendingResume(true);
        navigate(STEP_ROUTES[idx + 1]);
      } else {
        stopTour(true);
      }
      return;
    }

    targetRetryRef.current[idx] = 0;

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
    clearTourStartPending();
    clearPersistedTourState();
    setShowWelcomeModal(false);
    setShowCompletionModal(false);
    setTourCompleted(false);
    setStepIndex(0);
    setTourRunning(true);
    isTourActiveRef.current = true;
    resumeGenerationRef.current += 1;
    resumeInFlightRef.current = false;
    targetRetryRef.current = {};
    pendingStepRef.current = 0;
    setPendingResume(false);
    setRun(false);

    analyticsService.trackEvent('tour_started', { mode: fromStart ? 'auto' : 'manual' });

    tourDebug('startTour', { pathname: location.pathname });

    if (location.pathname !== '/dashboard') {
      setPendingResume(true);
      navigate('/dashboard');
    } else {
      resumeCurrentStep(0);
    }
  }, [location.pathname, navigate, resumeCurrentStep]);

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
    isTourActiveRef.current = true;
    setTourRunning(true);
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

  // ─── URL param: ?startTour=true (trigger only — intent stored in sessionStorage) ─
  useEffect(() => {
    if (!isDemoHost()) return;
    if (location.pathname !== '/dashboard') return;

    const params = new URLSearchParams(location.search);
    const fromUrl = params.get('startTour') === 'true';

    if (fromUrl) {
      armTourStartPending();
      navigate(location.pathname, { replace: true });
      tourDebug('startTour-url-armed', { pathname: location.pathname });
    }

    if (fromUrl || isTourStartPending()) {
      clearPersistedTourState();
      setTourRunning(false);
      setPendingResume(false);
      isTourActiveRef.current = false;
      setShowWelcomeModal(true);
    }
  }, [location.pathname, location.search, navigate]);

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

    const idx = saved.stepIndex ?? 0;
    const expectedRoute = STEP_ROUTES[idx];

    if (location.pathname !== expectedRoute) {
      tourDebug('recover-skip-stale-route', { idx, pathname: location.pathname, expectedRoute });
      clearPersistedTourState();
      return;
    }

    tourDebug('recover-from-storage', saved);
    isTourActiveRef.current = true;
    setTourRunning(true);
    setStepIndex(idx);
    pendingStepRef.current = idx;
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
