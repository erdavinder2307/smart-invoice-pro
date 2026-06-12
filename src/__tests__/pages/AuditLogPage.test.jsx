import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AuditLogPage from '../../pages/AuditLogPage';

describe('AuditLogPage redirect', () => {
  it('redirects legacy /settings/audit-log route to /activity', async () => {
    render(
      <MemoryRouter initialEntries={['/settings/audit-log']}>
        <Routes>
          <Route path="/settings/audit-log" element={<AuditLogPage />} />
          <Route path="/activity" element={<div>Activity Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Activity Page')).toBeInTheDocument();
  });
});
