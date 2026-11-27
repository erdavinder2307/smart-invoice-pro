import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Privacy, { GRIEVANCE_OFFICER, PROCESSORS } from '../../pages/Privacy';

jest.mock('../../components/Layout/Header', () => () => null);
jest.mock('../../components/Layout/Footer', () => () => null);
jest.mock('../../seo/SeoHead', () => () => null);

describe('Privacy', () => {
  const renderPage = () =>
    render(
      <MemoryRouter>
        <Privacy />
      </MemoryRouter>
    );

  it('is a DPDP Act draft, not the old GDPR/CCPA text', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 1, name: 'Privacy Policy' })).toBeInTheDocument();
    expect(screen.getByText('Draft — pending legal review')).toBeInTheDocument();
    expect(screen.getByText(/Digital Personal Data Protection Act, 2023/)).toBeInTheDocument();
    expect(screen.queryByText(/GDPR|CCPA|California/)).not.toBeInTheDocument();
  });

  it('names the grievance officer with response times', () => {
    renderPage();
    expect(screen.getByText(new RegExp(`${GRIEVANCE_OFFICER.name}, Grievance Officer`))).toBeInTheDocument();
    expect(screen.getByText(/within 24 hours and resolve it within 15 days/)).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: GRIEVANCE_OFFICER.email })[0]).toHaveAttribute('href', `mailto:${GRIEVANCE_OFFICER.email}`);
  });

  it('lists every processor and the India data region', () => {
    renderPage();
    PROCESSORS.forEach((p) => expect(screen.getByText(new RegExp(`^${p.name}:`))).toBeInTheDocument());
    expect(screen.getByText(/Microsoft Azure in the Central India region/)).toBeInTheDocument();
  });
});
