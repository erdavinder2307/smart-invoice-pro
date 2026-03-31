import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminSidebar, { MENU_ITEMS } from '../../admin/components/AdminSidebar';

describe('AdminSidebar', () => {
  it('renders all menu items', () => {
    render(
      <MemoryRouter>
        <AdminSidebar />
      </MemoryRouter>
    );

    MENU_ITEMS.forEach((item) => {
      expect(screen.getByText(item.text)).toBeInTheDocument();
    });
  });

  it('contains expected navigation items', () => {
    expect(MENU_ITEMS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ text: 'Dashboard', path: '/admin/dashboard' }),
        expect.objectContaining({ text: 'Tenants', path: '/admin/tenants' }),
        expect.objectContaining({ text: 'Users', path: '/admin/users' }),
        expect.objectContaining({ text: 'Feature Flags', path: '/admin/feature-flags' }),
      ])
    );
  });
});
