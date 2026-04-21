import React from 'react';
import { renderWithProviders, screen, waitFor } from '../../test-utils';
import { useAuth } from '../../context/AuthContext';
import OrganizationProfile from '../../pages/OrganizationProfile';

jest.mock('../../components/Layout/MainLayout', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../services/organizationProfileService', () => ({
  getOrgProfile: jest.fn(async () => ({
    organization_name: 'Acme Corp',
    industry: 'Technology',
    country: 'India',
    gstin: '22AAAAA0000A1Z5',
    website_url: 'https://acme.test',
    address: {
      line1: '123 Main St',
      line2: 'Floor 2',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      phone: '+91-9999999999',
      fax: '020-123456',
    },
  })),
  updateOrgProfile: jest.fn(),
  uploadOrgLogo: jest.fn(),
}));

describe('OrganizationProfile layout', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ isAdmin: true });
  });

  it('renders shared layout hooks for organization profile fields', async () => {
    renderWithProviders(<OrganizationProfile />, { route: '/settings/organization-profile' });

    await waitFor(() => {
      expect(screen.getByTestId('org-profile-field-name')).toBeInTheDocument();
    });

    expect(screen.getByTestId('org-profile-field-name')).toHaveAttribute('data-layout', 'full');
    expect(screen.getByTestId('org-profile-field-line1')).toHaveAttribute('data-layout', 'full');
    expect(screen.getByTestId('org-profile-field-line2')).toHaveAttribute('data-layout', 'full');

    [
      'org-profile-field-industry',
      'org-profile-field-country',
      'org-profile-field-gstin',
      'org-profile-field-website',
      'org-profile-field-city',
      'org-profile-field-state',
      'org-profile-field-pincode',
      'org-profile-field-phone',
      'org-profile-field-fax',
    ].forEach((testId) => {
      expect(screen.getByTestId(testId)).toHaveAttribute('data-layout', 'half');
    });
  });
});