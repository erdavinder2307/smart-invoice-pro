import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { NotificationProvider, useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import {
  getNotifications,
  markNotificationRead,
  markAllRead,
} from '../../services/notificationService';

jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../services/notificationService', () => ({
  getNotifications: jest.fn(),
  markNotificationRead: jest.fn(),
  markAllRead: jest.fn(),
}));

function Consumer() {
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markRead,
    markAllAsRead,
  } = useNotifications();

  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="unread">{String(unreadCount)}</span>
      <span data-testid="count">{String(notifications.length)}</span>
      <button onClick={() => fetchNotifications()}>refresh</button>
      <button onClick={() => markRead('n1')}>mark-read</button>
      <button onClick={() => markAllAsRead()}>mark-all</button>
    </div>
  );
}

describe('NotificationContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not fetch when user is not authenticated', async () => {
    useAuth.mockReturnValue({ isAuthenticated: false });

    render(
      <NotificationProvider>
        <Consumer />
      </NotificationProvider>
    );

    expect(screen.getByTestId('unread').textContent).toBe('0');
    await waitFor(() => {
      expect(getNotifications).not.toHaveBeenCalled();
    });
  });

  it('fetches notifications and updates read state actions', async () => {
    useAuth.mockReturnValue({ isAuthenticated: true });
    getNotifications.mockResolvedValue({
      notifications: [
        { id: 'n1', is_read: false, title: 'A' },
        { id: 'n2', is_read: false, title: 'B' },
      ],
      unread_count: 2,
    });
    markNotificationRead.mockResolvedValue({ ok: true });
    markAllRead.mockResolvedValue({ ok: true });

    render(
      <NotificationProvider>
        <Consumer />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(getNotifications).toHaveBeenCalled();
      expect(screen.getByTestId('count').textContent).toBe('2');
      expect(screen.getByTestId('unread').textContent).toBe('2');
    });

    fireEvent.click(screen.getByText('mark-read'));
    await waitFor(() => {
      expect(markNotificationRead).toHaveBeenCalledWith('n1');
      expect(screen.getByTestId('unread').textContent).toBe('1');
    });

    fireEvent.click(screen.getByText('mark-all'));
    await waitFor(() => {
      expect(markAllRead).toHaveBeenCalled();
      expect(screen.getByTestId('unread').textContent).toBe('0');
    });
  });
});
