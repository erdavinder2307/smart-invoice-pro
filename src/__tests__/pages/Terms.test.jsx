import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Terms from '../../pages/Terms';
import { LEGAL_ENTITY } from '../../config/legalEntity';
import { TRIAL_DAYS } from '../../config/plans';

jest.mock('../../components/Layout/Header', () => () => null);
jest.mock('../../components/Layout/Footer', () => () => null);
jest.mock('../../seo/SeoHead', () => () => null);

describe('Terms', () => {
  const renderPage = () =>
    render(
      <MemoryRouter>
        <Terms />
      </MemoryRouter>
    );

  it('is a draft naming the Indian company as the seller', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 1, name: 'Terms of Service' })).toBeInTheDocument();
    expect(screen.getByText('Draft — pending legal review')).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`CIN ${LEGAL_ENTITY.cin}, GSTIN ${LEGAL_ENTITY.gstin}`))).toBeInTheDocument();
  });

  it('uses Indian law and Mohali courts, not the old US terms', () => {
    renderPage();
    expect(screen.getByText(/governed by the laws of India/)).toBeInTheDocument();
    expect(screen.getByText(/courts at Mohali \(SAS Nagar\), Punjab/)).toBeInTheDocument();
    expect(screen.queryByText(/California/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Solidev Books Inc/)).not.toBeInTheDocument();
  });

  it('covers trial, GST, refunds, privacy and pricing with links', () => {
    renderPage();
    expect(screen.getByText(new RegExp(`${TRIAL_DAYS}-day free trial`))).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'pricing page' })).toHaveAttribute('href', '/pricing');
    expect(screen.getByRole('link', { name: 'refund and cancellation policy' })).toHaveAttribute('href', '/refund');
    expect(screen.getAllByRole('link', { name: 'privacy policy' })[0]).toHaveAttribute('href', '/privacy');
  });
});
