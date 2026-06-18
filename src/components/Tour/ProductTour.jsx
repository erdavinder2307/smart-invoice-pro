import React from 'react';
import { Joyride, ACTIONS, EVENTS, STATUS } from 'react-joyride';
import { useLocation } from 'react-router-dom';
import { useTour, TOUR_STEPS } from '../../context/TourContext';
import { tourDebug, tourWarn } from '../../utils/tourDebug';

const ProductTour = () => {
  const location = useLocation();
  const {
    run,
    stepIndex,
    stopTour,
    handleStepNavigation,
    retryCurrentStep,
  } = useTour();

  const handleJoyrideCallback = (data) => {
    const { action, index, status, type, step } = data;

    tourDebug('joyride-callback', {
      action,
      index,
      status,
      type,
      route: location.pathname,
      target: step?.target,
      stepIndex,
      run,
    });

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      stopTour(status === STATUS.FINISHED, status === STATUS.SKIPPED);
      return;
    }

    if (type === EVENTS.TARGET_NOT_FOUND) {
      tourWarn('joyride-TARGET_NOT_FOUND', {
        index,
        target: TOUR_STEPS[index]?.target,
        route: location.pathname,
      });
      retryCurrentStep();
      return;
    }

    if (type === EVENTS.STEP_AFTER) {
      if (action === ACTIONS.CLOSE) {
        stopTour(false, true);
        return;
      }

      const delta = action === ACTIONS.PREV ? -1 : 1;
      const nextIndex = index + delta;

      if (nextIndex >= TOUR_STEPS.length) {
        stopTour(true);
      } else if (nextIndex < 0) {
        stopTour(false, true);
      } else {
        handleStepNavigation(nextIndex);
      }
    }
  };

  return (
    <Joyride
      key={`tour-${stepIndex}-${location.pathname}`}
      steps={TOUR_STEPS}
      run={run}
      stepIndex={stepIndex}
      continuous
      scrollToFirstStep
      scrollOffset={120}
      showProgress
      showSkipButton
      disableOverlayClose
      spotlightClicks={false}
      disableScrolling={false}
      options={{ skipBeacon: true }}
      callback={handleJoyrideCallback}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish Tour',
        next: 'Next',
        skip: 'Skip Tour',
      }}
      styles={{
        options: {
          arrowColor: '#ffffff',
          backgroundColor: '#ffffff',
          overlayColor: 'rgba(5, 12, 36, 0.72)',
          primaryColor: '#2563eb',
          textColor: '#334155',
          width: 360,
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '24px',
          border: '1px solid rgba(15, 23, 42, 0.08)',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        tooltipTitle: {
          fontWeight: 700,
          fontSize: '1.1rem',
          color: '#0f172a',
          marginBottom: '8px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        },
        tooltipContent: {
          fontSize: '0.9rem',
          color: '#475569',
          lineHeight: '1.65',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        },
        tooltipFooter: {
          marginTop: '16px',
        },
        buttonNext: {
          backgroundColor: '#2563eb',
          backgroundImage: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)',
          borderRadius: '10px',
          fontWeight: 700,
          fontSize: '0.875rem',
          padding: '10px 20px',
          color: '#ffffff',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        },
        buttonBack: {
          color: '#64748b',
          fontWeight: 600,
          fontSize: '0.875rem',
          marginRight: '12px',
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        },
        buttonSkip: {
          color: '#94a3b8',
          fontSize: '0.8125rem',
          fontWeight: 500,
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        },
        buttonClose: {
          color: '#94a3b8',
          height: 14,
          width: 14,
          padding: 0,
        },
        spotlight: {
          borderRadius: '8px',
        },
      }}
    />
  );
};

export default ProductTour;
