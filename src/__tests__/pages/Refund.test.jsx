import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Refund from '../../pages/Refund';
import { SUPPORT_EMAIL } from '../../pages/Support';
import { TRIAL_DAYS } from '../../config/plans';

jest.mock('../../components/Layout/Header', () => () => null);
jest.mock('../../components/Layout/Footer', () => () => null);
jest.mock('../../seo/SeoHead', () => () => null);

describe('Refund', () => {
  const renderPage = () =>
    render(
      <MemoryRouter>
        <Refund />
      </MemoryRouter>
    );

  it('is marked as a draft pending legal review', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Refund and cancellation policy' })).toBeInTheDocument();
    expect(screen.getByText('Draft — pending legal review')).toBeInTheDocument();
  });

  it('states the trial, cancellation and duplicate-charge rules', () => {
    renderPage();
    expect(screen.getByText(new RegExp(`${TRIAL_DAYS}-day free trial`))).toBeInTheDocument();
    expect(screen.getByText(/cancel any time from Settings → Billing/)).toBeInTheDocument();
    expect(screen.getByText(/within 7–10 working days/)).toBeInTheDocument();
  });

  it('promises the same reply time as the support page', () => {
    renderPage();
    expect(screen.getByText(/We reply within 1 working day/)).toBeInTheDocument();
  });

  it('links to the support mailbox, pricing and support pages', () => {
    renderPage();
    expect(screen.getByRole('link', { name: SUPPORT_EMAIL })).toHaveAttribute('href', `mailto:${SUPPORT_EMAIL}`);
    expect(screen.getByRole('link', { name: 'pricing' })).toHaveAttribute('href', '/pricing');
    expect(screen.getByRole('link', { name: 'support' })).toHaveAttribute('href', '/support');
  });
});
