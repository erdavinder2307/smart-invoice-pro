import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import StatusBadge from '../../components/common/StatusBadge';

const theme = createTheme();
const renderBadge = (props) =>
  render(
    <ThemeProvider theme={theme}>
      <StatusBadge {...props} />
    </ThemeProvider>
  );

describe('StatusBadge', () => {
  it.each([
    ['paid', 'Paid'],
    ['overdue', 'Overdue'],
    ['draft', 'Draft'],
    ['pending', 'Pending'],
    ['issued', 'Issued'],
    ['active', 'Active'],
    ['inactive', 'Inactive'],
    ['partially paid', 'Partially Paid'],
  ])('renders "%s" status as "%s" label', (status, expectedLabel) => {
    renderBadge({ status });
    expect(screen.getByText(expectedLabel)).toBeInTheDocument();
  });

  it('renders unknown status with original text', () => {
    renderBadge({ status: 'Custom Status' });
    expect(screen.getByText('Custom Status')).toBeInTheDocument();
  });

  it('renders empty string status without crashing', () => {
    renderBadge({});
    // Should render a chip with empty/default label
    const chip = document.querySelector('.MuiChip-root');
    expect(chip).toBeInTheDocument();
  });

  it('applies small size by default', () => {
    renderBadge({ status: 'Paid' });
    const chip = document.querySelector('.MuiChip-sizeSmall');
    expect(chip).toBeInTheDocument();
  });

  it('applies medium size when specified', () => {
    renderBadge({ status: 'Paid', size: 'medium' });
    const chip = document.querySelector('.MuiChip-sizeMedium');
    expect(chip).toBeInTheDocument();
  });
});
