import React from 'react';
import { act, render, screen } from '@testing-library/react';
import PlanLimitBanner, { PLAN_LIMIT_EVENT } from '../../components/PlanLimitBanner';

describe('PlanLimitBanner', () => {
  it('stays hidden until a plan-limit event arrives, then links to pricing', () => {
    render(<PlanLimitBanner />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    act(() => {
      window.dispatchEvent(
        new CustomEvent(PLAN_LIMIT_EVENT, { detail: { code: 'trial_ended', message: 'Your free trial has ended.' } })
      );
    });

    expect(screen.getByText('Your free trial has ended.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Choose a plan' })).toHaveAttribute('href', '/pricing');
  });
});
