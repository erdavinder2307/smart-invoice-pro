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

  // Check if tour has been seen
  const [tourSeen, setTourSeen] = useState(() => {
    return Boolean(localStorage.getItem('solidevbooks_tour_seen'));
  });

  // *** KEY FIX: guard flag — the auto-resume effect ONLY fires
  //     when the user has explicitly started the tour (via WelcomeModal or menu).
  //     Without this flag the effect fires on every render at /dashboard and
  //     turns run=true before any interaction, causing the beacon and broken Next.
  const isTourActiveRef = useRef(false);

  // Also track pending navigation so we know to resume after routing
  const pendingResumeRef = useRef(false);

  const startTour = useCallback((fromStart = false) => {
    setShowWelcomeModal(false);
    setShowCompletionModal(false);
    setStepIndex(0);
    analyticsService.trackEvent('tour_started', { mode: fromStart ? 'auto' : 'manual' });

    isTourActiveRef.current = true;

    if (location.pathname !== '/dashboard') {
      pendingResumeRef.current = true;
      setRun(false);
      navigate('/dashboard');
    } else {
      pendingResumeRef.current = false;
      // Small delay to let DOM settle on the current page
      setTimeout(() => {
        setRun(true);
      }, 300);
    }
  }, [navigate, location.pathname]);

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

  // Handle URL parameters for starting the tour
  // Reads startTour param ONCE on mount/location change — but does NOT clear the URL eagerly;
  // only clear once we've consumed it.
  useEffect(() => {
    if (!isDemoHost()) return;

    const params = new URLSearchParams(location.search);
    if (params.get('startTour') === 'true') {
      // Clear URL parameter so it doesn't trigger repeatedly
      navigate(location.pathname, { replace: true });

      const sessionSeen = sessionStorage.getItem('solidevbooks_tour_session_seen');
      if (!sessionSeen) {
        sessionStorage.setItem('solidevbooks_tour_session_seen', 'true');
        setShowWelcomeModal(true);
      } else if (!tourSeen) {
        startTour(true);
      }
    } else if (!tourSeen && location.pathname === '/dashboard') {
      // Auto-show welcome modal on first visit to dashboard inside the session
      const sessionSeen = sessionStorage.getItem('solidevbooks_tour_session_seen');
      if (!sessionSeen) {
        sessionStorage.setItem('solidevbooks_tour_session_seen', 'true');
        setShowWelcomeModal(true);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, location.pathname]);

  const handleStepNavigation = useCallback((nextIdx) => {
    const nextRoute = STEP_ROUTES[nextIdx];
    analyticsService.trackEvent('tour_step_completed', {
      step_index: stepIndex,
      step_title: TOUR_STEPS[stepIndex]?.title || ''
    });

    if (nextRoute && location.pathname !== nextRoute) {
      // Navigating to a different page — pause joyride, set pending resume
      setRun(false);
      setStepIndex(nextIdx);
      pendingResumeRef.current = true;
      navigate(nextRoute);
    } else {
      // Same page — just advance the step index; Joyride will render next step
      setStepIndex(nextIdx);
    }
  }, [location.pathname, navigate, stepIndex]);

  // Auto-resume tour ONLY when the tour is explicitly active and a pending navigation happened
  useEffect(() => {
    if (!isTourActiveRef.current || !pendingResumeRef.current) return;
    if (run) return;

    const expectedRoute = STEP_ROUTES[stepIndex];
    if (expectedRoute && location.pathname === expectedRoute) {
      pendingResumeRef.current = false;
      // Delay to allow DOM elements to render/load API data
      const timer = setTimeout(() => {
        setRun(true);
      }, 600);
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
