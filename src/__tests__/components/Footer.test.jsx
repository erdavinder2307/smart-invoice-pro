import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer, { LEGAL_ENTITY } from '../../components/Layout/Footer';

jest.mock('../../components/common/Logo', () => () => null);
jest.mock('@mui/material/useMediaQuery', () => jest.fn(() => false));

describe('Footer', () => {
  it('names the company behind Solidev Books with its CIN, GSTIN and registered office', () => {
    render(<Footer />);
    const line = screen.getByTestId('footer-legal-entity');
    expect(line).toHaveTextContent(`Solidev Books is a product of ${LEGAL_ENTITY.name}`);
    expect(line).toHaveTextContent('CIN U72900PB2018OPC048155');
    expect(line).toHaveTextContent('GSTIN 03ABACS5873R2ZP');
    expect(line).toHaveTextContent('Mohali, Punjab 140308');
  });

  it('links the pricing, refund and support pages', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'Pricing' })).toHaveAttribute('href', '/pricing');
    expect(screen.getByRole('link', { name: 'Refund Policy' })).toHaveAttribute('href', '/refund');
    expect(screen.getByRole('link', { name: 'Support' })).toHaveAttribute('href', '/support');
    expect(screen.getByRole('link', { name: 'Contact Support' })).toHaveAttribute('href', '/support');
  });
});
