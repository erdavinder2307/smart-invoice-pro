import React from 'react';
import { within } from '@testing-library/react';
import { renderWithProviders, screen, fireEvent, waitFor } from '../../test-utils';
import FirstRunWizard, { firstRunDoneKey } from '../../components/FirstRunWizard';
import { getOrgProfile, updateOrgProfile } from '../../services/organizationProfileService';
import { useOrgGst } from '../../context/OrgGstContext';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../services/organizationProfileService', () => ({
  getOrgProfile: jest.fn(),
  updateOrgProfile: jest.fn(),
}));

const admin = { id: 'u1', username: 'owner@example.com', role: 'Admin', tenant_id: 't-1' };

const emptyProfile = {
  organization_name: '',
  industry: '',
  country: '',
  gstin: '',
  website_url: '',
  logo_url: '/uploads/org_logos/logo.png',
  address: { line1: '12 Market Road', line2: '', city: 'Pune', state: '', pincode: '', phone: '', fax: '' },
};

const pickOption = (label, option) => {
  fireEvent.mouseDown(screen.getByRole('combobox', { name: label }));
  fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: option }));
};

const goToGstStep = async () => {
  expect(await screen.findByText('Set up Solidev Books')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Business name'), { target: { value: '  Sharma Traders ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  expect(screen.getByRole('combobox', { name: 'GST registration' })).toBeInTheDocument();
};

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  getOrgProfile.mockResolvedValue(emptyProfile);
  updateOrgProfile.mockResolvedValue({});
});

describe('FirstRunWizard', () => {
  it('walks a new admin from business name to GST and state to the first invoice', async () => {
    renderWithProviders(<FirstRunWizard />, { authValue: { user: admin } });
    const reload = jest.fn();
    useOrgGst.mockReturnValue({ reload });

    await goToGstStep();
    fireEvent.change(screen.getByLabelText('GSTIN'), { target: { value: '27aabcu9603r1zx' } });
    pickOption('State', 'Maharashtra');
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));

    expect(await screen.findByRole('button', { name: 'Create your first invoice' })).toBeInTheDocument();
    expect(updateOrgProfile).toHaveBeenCalledWith({
      organization_name: 'Sharma Traders',
      industry: '',
      country: 'India',
      gstin: '27AABCU9603R1ZX',
      gst_registration_type: 'regular',
      website_url: '',
      logo_url: '/uploads/org_logos/logo.png',
      address: { ...emptyProfile.address, state: 'Maharashtra' },
    });
    expect(reload).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Create your first invoice' }));
    expect(mockNavigate).toHaveBeenCalledWith('/invoices/add');
    expect(localStorage.getItem(firstRunDoneKey('t-1'))).toBe('1');
    expect(screen.queryByText('Set up Solidev Books')).not.toBeInTheDocument();
  });

  it('requires a business name, a valid GSTIN and a state before saving', async () => {
    renderWithProviders(<FirstRunWizard />, { authValue: { user: admin } });

    expect(await screen.findByText('Set up Solidev Books')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Enter your business name.')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Business name'), { target: { value: 'Sharma Traders' } });
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.change(screen.getByLabelText('GSTIN'), { target: { value: '27AABCU' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));

    expect(screen.getByText(/Invalid GST number/)).toBeInTheDocument();
    expect(screen.getByText('Choose your state.')).toBeInTheDocument();
    expect(updateOrgProfile).not.toHaveBeenCalled();
  });

  it('saves an unregistered business without a GSTIN', async () => {
    renderWithProviders(<FirstRunWizard />, { authValue: { user: admin } });

    await goToGstStep();
    pickOption('GST registration', 'Not registered for GST');
    expect(screen.queryByLabelText('GSTIN')).not.toBeInTheDocument();
    pickOption('State', 'Punjab');
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));

    await waitFor(() => expect(updateOrgProfile).toHaveBeenCalled());
    expect(updateOrgProfile.mock.calls[0][0]).toMatchObject({
      gstin: '',
      gst_registration_type: 'unregistered',
      address: expect.objectContaining({ state: 'Punjab' }),
    });
  });

  it('shows the API error and stays on the GST step', async () => {
    updateOrgProfile.mockRejectedValue(
      Object.assign(new Error('bad'), { response: { data: { error: 'Invalid GSTIN format.' } } }),
    );
    renderWithProviders(<FirstRunWizard />, { authValue: { user: admin } });

    await goToGstStep();
    fireEvent.change(screen.getByLabelText('GSTIN'), { target: { value: '27AABCU9603R1ZX' } });
    pickOption('State', 'Maharashtra');
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));

    expect(await screen.findByText('Invalid GSTIN format.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Create your first invoice' })).not.toBeInTheDocument();
  });

  it('reminds an unverified user to verify before the first invoice', async () => {
    renderWithProviders(<FirstRunWizard />, { authValue: { user: { ...admin, email_verified: false } } });

    await goToGstStep();
    fireEvent.change(screen.getByLabelText('GSTIN'), { target: { value: '27AABCU9603R1ZX' } });
    pickOption('State', 'Maharashtra');
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));

    expect(await screen.findByText(/Verify your email first/)).toBeInTheDocument();
  });

  it('remembers "Skip for now" for this organisation', async () => {
    const { unmount } = renderWithProviders(<FirstRunWizard />, { authValue: { user: admin } });
    fireEvent.click(await screen.findByRole('button', { name: 'Skip for now' }));
    expect(screen.queryByText('Set up Solidev Books')).not.toBeInTheDocument();
    unmount();

    getOrgProfile.mockClear();
    renderWithProviders(<FirstRunWizard />, { authValue: { user: admin } });
    expect(getOrgProfile).not.toHaveBeenCalled();
  });

  it('stays hidden when the organisation already has a name', async () => {
    getOrgProfile.mockResolvedValue({ ...emptyProfile, organization_name: 'Acme' });
    renderWithProviders(<FirstRunWizard />, { authValue: { user: admin } });

    await waitFor(() => expect(getOrgProfile).toHaveBeenCalled());
    expect(screen.queryByText('Set up Solidev Books')).not.toBeInTheDocument();
  });

  it('is not shown to non-admin users', () => {
    renderWithProviders(<FirstRunWizard />, {
      authValue: { user: { ...admin, role: 'Viewer' }, isAdmin: false },
    });
    expect(getOrgProfile).not.toHaveBeenCalled();
  });
});
