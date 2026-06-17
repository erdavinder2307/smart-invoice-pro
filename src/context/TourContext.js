import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import analyticsService from '../services/analyticsService';
import { isDemoHost } from '../utils/demoMode';

const TourContext = createContext(null);

export const STEP_ROUTES = {
  0: '/dashboard',
  1: '/customers',
  2: '/quotes',
  3: '/invoices',
  4: '/products',
  5: '/purchase-orders',
  6: '/bank-accounts',
  7: '/reports'
};

export const TOUR_STEPS = [
  {
    target: '.tour-revenue-cards',
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
  }
];

export const TourProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const [tourSeen, setTourSeen] = useState(() =>
    Boolean(localStorage.getItem('solidevbooks_tour_seen'))
  );

  // Guard: auto-resume ONLY after explicit startTour() call
  const isTourActiveRef = useRef(false);
  // Guard: only resume after a route change triggered by handleStepNavigation
  const pendingResumeRef = useRef(false);
  // Avoid processing the ?startTour param twice on fast re-renders
  const startTourParamConsumedRef = useRef(false);

  // ─── startTour ────────────────────────────────────────────────────────────
  const startTour = useCallback((fromStart = false) => {
    setShowWelcomeModal(false);
    setShowCompletionModal(false);
    setStepIndex(0);
    analyticsService.trackEvent('tour_started', { mode: fromStart ? 'auto' : 'manual' });

    isTourActiveRef.current = true;
    pendingResumeRef.current = false;

    if (location.pathname !== '/dashboard') {
      // Need to navigate first, then resume
      pendingResumeRef.current = true;
      setRun(false);
      navigate('/dashboard');
    } else {
      // Already on dashboard — give DOM time to render the target element
      setTimeout(() => setRun(true), 400);
    }
  }, [navigate, location.pathname]);

  // ─── stopTour ─────────────────────────────────────────────────────────────
  const stopTour = useCallback((completed = false, skipped = false) => {
    setRun(false);
    isTourActiveRef.current = false;
    pendingResumeRef.current = false;

    if (completed) {
      localStorage.setItem('solidevbooks_tour_seen', 'true');
      setTourSeen(true);
      setShowCompletionModal(true);
      analyticsService.trackEvent('tour_completed');
    } else if (skipped) {
      localStorage.setItem('solidevbooks_tour_seen', 'true');
      setTourSeen(true);
      analyticsService.trackEvent('tour_skipped', { step_index: stepIndex });
    }
  }, [stepIndex]);

  // ─── URL param: ?startTour=true ───────────────────────────────────────────
  // Only fires when the search string contains the param.
  // We clear the URL first, THEN open the welcome modal so the modal button
  // can call startTour() cleanly with no stale query string.
  useEffect(() => {
    if (!isDemoHost()) return;
    const params = new URLSearchParams(location.search);
    if (params.get('startTour') !== 'true') return;
    if (startTourParamConsumedRef.current) return;

    startTourParamConsumedRef.current = true;

    // Clear the param from the URL immediately so it won't re-trigger
    navigate(location.pathname, { replace: true });

    // Show welcome modal — user clicks "Start Tour" to actually begin
    setShowWelcomeModal(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Reset the consumed flag when the user navigates away from /dashboard
  // so that a fresh ?startTour=true link always works
  useEffect(() => {
    if (location.pathname !== '/dashboard') {
      startTourParamConsumedRef.current = false;
    }
  }, [location.pathname]);

  // ─── handleStepNavigation ────────────────────────────────────────────────
  const handleStepNavigation = useCallback((nextIdx) => {
    analyticsService.trackEvent('tour_step_completed', {
      step_index: stepIndex,
      step_title: TOUR_STEPS[stepIndex]?.title || ''
    });

    const nextRoute = STEP_ROUTES[nextIdx];
    if (nextRoute && location.pathname !== nextRoute) {
      // Different page → pause Joyride, navigate, let auto-resume pick it up
      setRun(false);
      setStepIndex(nextIdx);
      pendingResumeRef.current = true;
      navigate(nextRoute);
    } else {
      // Same page → just advance; Joyride re-renders with new stepIndex
      setStepIndex(nextIdx);
    }
  }, [location.pathname, navigate, stepIndex]);

  // ─── Auto-resume after route change ──────────────────────────────────────
  // Only fires when: tour is active AND a step navigation triggered a route change
  useEffect(() => {
    if (!isTourActiveRef.current) return;
    if (!pendingResumeRef.current) return;
    if (run) return;

    const expectedRoute = STEP_ROUTES[stepIndex];
    if (expectedRoute && location.pathname === expectedRoute) {
      pendingResumeRef.current = false;
      // Wait for the page components + data to render
      const timer = setTimeout(() => setRun(true), 700);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, stepIndex, run]);

  return (
    <TourContext.Provider
      value={{
        run,
        setRun,
        stepIndex,
        setStepIndex,
        showWelcomeModal,
        setShowWelcomeModal,
        showCompletionModal,
        setShowCompletionModal,
        tourSeen,
        startTour,
        stopTour,
        handleStepNavigation
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
