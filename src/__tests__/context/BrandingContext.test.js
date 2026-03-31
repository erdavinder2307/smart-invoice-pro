import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { BrandingProvider, useBranding, BRANDING_DEFAULTS } from '../../context/BrandingContext';
import { getBranding } from '../../services/brandingService';

jest.mock('../../services/brandingService');

afterEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

function BrandingConsumer() {
  const { branding } = useBranding();
  return (
    <div>
      <span data-testid="primary">{branding.primary_color}</span>
      <span data-testid="secondary">{branding.secondary_color}</span>
    </div>
  );
}

describe('BrandingContext', () => {
  it('provides default branding colors', async () => {
    getBranding.mockRejectedValue(new Error('no token'));

    await act(async () => {
      render(
        <BrandingProvider>
          <BrandingConsumer />
        </BrandingProvider>
      );
    });

    expect(screen.getByTestId('primary')).toHaveTextContent(BRANDING_DEFAULTS.primary_color);
    expect(screen.getByTestId('secondary')).toHaveTextContent(BRANDING_DEFAULTS.secondary_color);
  });

  it('loads custom branding from API when token exists', async () => {
    localStorage.setItem('token', 'test-token');
    getBranding.mockResolvedValue({
      primary_color: '#FF0000',
      secondary_color: '#00FF00',
    });

    await act(async () => {
      render(
        <BrandingProvider>
          <BrandingConsumer />
        </BrandingProvider>
      );
    });

    expect(screen.getByTestId('primary')).toHaveTextContent('#FF0000');
    expect(screen.getByTestId('secondary')).toHaveTextContent('#00FF00');
  });

  it('exports BRANDING_DEFAULTS with expected keys', () => {
    expect(BRANDING_DEFAULTS).toHaveProperty('primary_color');
    expect(BRANDING_DEFAULTS).toHaveProperty('secondary_color');
    expect(BRANDING_DEFAULTS).toHaveProperty('accent_color');
    expect(BRANDING_DEFAULTS).toHaveProperty('logo_url');
    expect(BRANDING_DEFAULTS).toHaveProperty('invoice_template_settings');
  });

  it('useBranding throws when used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    function BadComponent() {
      useBranding();
      return null;
    }

    expect(() => render(<BadComponent />)).toThrow('useBranding must be used inside BrandingProvider');
    consoleSpy.mockRestore();
  });
});
