import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Support from '../../pages/Support';
import Refund from '../../pages/Refund';
import Privacy from '../../pages/Privacy';
import Terms from '../../pages/Terms';

jest.mock('../../components/Layout/Header', () => () => null);
jest.mock('../../components/Layout/Footer', () => () => null);
// SeoHead appends " | Solidev Books" itself, so pages must pass the bare title.
jest.mock('../../seo/SeoHead', () => ({ title }) => <span data-testid="seo-title">{title}</span>);

describe.each([
  ['Support', Support, 'Support'],
  ['Refund', Refund, 'Refund and cancellation policy'],
  ['Privacy', Privacy, 'Privacy Policy'],
  ['Terms', Terms, 'Terms of Service']
])('%s page title', (_name, Page, expected) => {
  it('passes the title without the site name suffix', () => {
    render(
      <MemoryRouter>
        <Page />
      </MemoryRouter>
    );
    expect(screen.getByTestId('seo-title')).toHaveTextContent(new RegExp(`^${expected}$`));
  });
});
