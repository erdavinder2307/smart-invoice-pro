import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CompletionModal from '../../components/Tour/CompletionModal';
import { useTour } from '../../context/TourContext';

const mockSetShowCompletionModal = jest.fn();

jest.mock('../../context/TourContext', () => ({
  useTour: () => ({
    showCompletionModal: true,
    setShowCompletionModal: mockSetShowCompletionModal
  })
}));

const testTheme = createTheme();

const renderComponent = () => render(
  <ThemeProvider theme={testTheme}>
    <CompletionModal />
  </ThemeProvider>
);

describe('CompletionModal', () => {
  const originalLocation = window.location;

  beforeAll(() => {
    delete window.location;
    window.location = { href: '' };
  });

  afterAll(() => {
    window.location = originalLocation;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    window.location.href = '';
  });

  it('renders correctly with completion text when open', () => {
    renderComponent();

    expect(screen.getByText('You’re Ready to Explore!')).toBeInTheDocument();
    expect(screen.getByText('Start Free')).toBeInTheDocument();
    expect(screen.getByText('Continue Exploring')).toBeInTheDocument();
    expect(screen.getByText('Book Consultation')).toBeInTheDocument();
  });

  it('triggers setShowCompletionModal(false) when "Continue Exploring" is clicked', () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /Continue Exploring/i }));
    expect(mockSetShowCompletionModal).toHaveBeenCalledWith(false);
  });

  it('navigates to signup and closes modal when "Start Free" is clicked', () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /Start Free/i }));
    expect(mockSetShowCompletionModal).toHaveBeenCalledWith(false);
    expect(window.location.href).toBe('https://www.solidevbooks.com/signup');
  });

  it('navigates to support and closes modal when "Book Consultation" is clicked', () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /Book Consultation/i }));
    expect(mockSetShowCompletionModal).toHaveBeenCalledWith(false);
    expect(window.location.href).toBe('https://www.solidevbooks.com/support');
  });
});
