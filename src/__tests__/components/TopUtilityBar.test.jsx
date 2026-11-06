import React from 'react';
import { renderWithProviders, screen } from '../../test-utils';

jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  const mockUseMediaQuery = jest.fn(() => false);
  return { ...actual, useMediaQuery: mockUseMediaQuery, __mockUseMediaQuery: mockUseMediaQuery };
});
jest.mock('../../context/KeyboardShortcutsContext', () => ({
  useKeyboardShortcutsContext: () => ({ openShortcutsModal: jest.fn() }),
}));
jest.mock('../../context/TourContext', () => ({ useTour: () => ({ startTour: jest.fn() }) }));
jest.mock('../../components/Notifications/NotificationDropdown', () => () => null);
jest.mock('../../components/search/GlobalSearchInput', () => () => <input aria-label="global search" />);

// eslint-disable-next-line import/first
import TopUtilityBar from '../../components/Layout/TopUtilityBar';

const { __mockUseMediaQuery: mockUseMediaQuery } = jest.requireMock('@mui/material');

describe('TopUtilityBar width on phones (BUG-20261011 header avatar clipped at 390 px)', () => {
  afterEach(() => mockUseMediaQuery.mockReset());

  it('shows the language select and keyboard-shortcut button on wider screens', () => {
    mockUseMediaQuery.mockReturnValue(false);
    renderWithProviders(<TopUtilityBar />);
    expect(screen.getByLabelText('keyboard shortcuts')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByLabelText('Account')).toBeInTheDocument();
  });

  it('drops the language select and keyboard-shortcut button on phones, keeping the avatar', () => {
    mockUseMediaQuery.mockReturnValue(true);
    renderWithProviders(<TopUtilityBar />);
    expect(screen.queryByLabelText('keyboard shortcuts')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Account')).toBeInTheDocument();
  });
});
