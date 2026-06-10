jest.unmock('../../context/OrgGstContext');

import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { OrgGstProvider, useOrgGst } from '../../context/OrgGstContext';

jest.mock('../../config/api', () => ({
  createApiUrl: (path) => `http://test.local${path}`,
}));

function GstConsumer() {
  const {
    loading,
    gst_mode,
    isSalesTaxAllowed,
    isComposition,
    isUnregistered,
    error,
  } = useOrgGst();

  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="gst-mode">{gst_mode}</span>
      <span data-testid="sales-tax">{String(isSalesTaxAllowed)}</span>
      <span data-testid="composition">{String(isComposition)}</span>
      <span data-testid="unregistered">{String(isUnregistered)}</span>
      <span data-testid="error">{error || ''}</span>
    </div>
  );
}

describe('OrgGstContext', () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn();
  });

  it('throws when useOrgGst is used outside OrgGstProvider', () => {
    const Broken = () => {
      useOrgGst();
      return null;
    };

    expect(() => render(<Broken />)).toThrow('useOrgGst must be used inside OrgGstProvider');
  });

  it('loads gst config and exposes derived flags for composition mode', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        gst_mode: 'COMPOSITION',
        gst_registration_type: 'composition',
        gst_enabled: true,
        gstin: '22AAAAA0000A1Z5',
        seller_state: 'Punjab',
      }),
    });

    await act(async () => {
      render(
        <OrgGstProvider>
          <GstConsumer />
        </OrgGstProvider>
      );
    });

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('gst-mode')).toHaveTextContent('COMPOSITION');
    expect(screen.getByTestId('sales-tax')).toHaveTextContent('false');
    expect(screen.getByTestId('composition')).toHaveTextContent('true');
    expect(screen.getByTestId('unregistered')).toHaveTextContent('false');
  });

  it('falls back to safe defaults when gst config fetch fails', async () => {
    fetch.mockResolvedValue({ ok: false, status: 500 });

    await act(async () => {
      render(
        <OrgGstProvider>
          <GstConsumer />
        </OrgGstProvider>
      );
    });

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('gst-mode')).toHaveTextContent('FULL_GST');
    expect(screen.getByTestId('error')).toHaveTextContent('HTTP 500');
  });
});
