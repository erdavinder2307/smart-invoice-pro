import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Support, { SUPPORT_EMAIL } from '../../pages/Support';

jest.mock('../../components/Layout/Header', () => () => null);
jest.mock('../../components/Layout/Footer', () => () => null);
jest.mock('../../seo/SeoHead', () => () => null);

describe('Support', () => {
  const renderPage = () =>
    render(
      <MemoryRouter>
        <Support />
      </MemoryRouter>
    );

  it('shows the support email as a mailto link', () => {
    renderPage();
    expect(screen.getByRole('link', { name: SUPPORT_EMAIL })).toHaveAttribute('href', `mailto:${SUPPORT_EMAIL}`);
  });

  it('explains how to delete the account', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'How do I delete my account?' })).toBeInTheDocument();
    expect(screen.getByText(/Profile → Delete My Account/)).toBeInTheDocument();
  });

  it('links to the password reset, sign-up and privacy pages', () => {
    renderPage();
    expect(screen.getByRole('link', { name: 'password reset page' })).toHaveAttribute('href', '/forgot-password');
    expect(screen.getByRole('link', { name: 'solidevbooks.com' })).toHaveAttribute('href', '/signup');
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy');
  });
});
