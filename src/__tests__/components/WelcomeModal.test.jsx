import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import WelcomeModal from '../../components/Tour/WelcomeModal';
import { useTour } from '../../context/TourContext';

const mockStartTour = jest.fn();
const mockStopTour = jest.fn();
const mockSetShowWelcomeModal = jest.fn();

jest.mock('../../context/TourContext', () => ({
  useTour: () => ({
    showWelcomeModal: true,
    setShowWelcomeModal: mockSetShowWelcomeModal,
    startTour: mockStartTour,
    stopTour: mockStopTour
  })
}));

const testTheme = createTheme();

const renderComponent = () => render(
  <ThemeProvider theme={testTheme}>
    <WelcomeModal />
  </ThemeProvider>
);

describe('WelcomeModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with welcome text and options when open', () => {
    renderComponent();

    expect(screen.getByText('Welcome to Solidev Books')).toBeInTheDocument();
    expect(screen.getByText('Start Tour')).toBeInTheDocument();
    expect(screen.getByText('Explore Yourself')).toBeInTheDocument();
    expect(screen.getByText('Estimated time: 2–3 minutes')).toBeInTheDocument();
  });

  it('triggers startTour when "Start Tour" is clicked', () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /Start Tour/i }));
    expect(mockStartTour).toHaveBeenCalled();
  });

  it('triggers stopTour when "Explore Yourself" is clicked', () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /Explore Yourself/i }));
    expect(mockSetShowWelcomeModal).toHaveBeenCalledWith(false);
    expect(mockStopTour).toHaveBeenCalledWith(false, true);
  });
});
