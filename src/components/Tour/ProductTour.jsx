import React from 'react';
import { Joyride, ACTIONS, EVENTS, STATUS } from 'react-joyride';
import { useTour, TOUR_STEPS } from '../../context/TourContext';

const ProductTour = () => {
  const {
    run,
    stepIndex,
    stopTour,
    handleStepNavigation
  } = useTour();

  const handleJoyrideCallback = (data) => {
    const { action, index, status, type } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      stopTour(status === STATUS.FINISHED, status === STATUS.SKIPPED);
    } else if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
      const nextIndex = index + (action === ACTIONS.PREV ? -1 : 1);
      
      // If we are at the end of the tour, finish it
      if (nextIndex >= TOUR_STEPS.length && action !== ACTIONS.PREV) {
        stopTour(true);
      } else {
        handleStepNavigation(nextIndex);
      }
    }
  };

  return (
    <Joyride
      steps={TOUR_STEPS}
      run={run}
      stepIndex={stepIndex}
      continuous={true}
      scrollToFirstStep={true}
      showProgress={false}
      showSkipButton={true}
      disableOverlayClose={true}
      spotlightClicks={false}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          arrowColor: '#ffffff',
          backgroundColor: '#ffffff',
          overlayColor: 'rgba(5, 12, 36, 0.72)',
          primaryColor: '#2563eb',
          textColor: '#334155',
          width: 340,
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
          fontSize: '1.15rem',
          color: '#0f172a',
          marginBottom: '8px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        },
        tooltipContent: {
          fontSize: '0.925rem',
          color: '#475569',
          lineHeight: '1.6',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        },
        buttonNext: {
          backgroundColor: '#2563eb',
          backgroundImage: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)',
          borderRadius: '10px',
          fontWeight: 700,
          fontSize: '0.875rem',
          padding: '10px 18px',
          color: '#ffffff',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        },
        buttonBack: {
          color: '#64748b',
          fontWeight: 600,
          fontSize: '0.875rem',
          marginRight: '16px',
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        },
        buttonSkip: {
          color: '#94a3b8',
          fontSize: '0.875rem',
          fontWeight: 500,
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }
      }}
    />
  );
};

export default ProductTour;
