import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SectionHeader from '../../components/common/SectionHeader';

const theme = createTheme();
const renderHeader = (props) =>
  render(
    <ThemeProvider theme={theme}>
      <SectionHeader {...props} />
    </ThemeProvider>
  );

describe('SectionHeader', () => {
  it('renders title', () => {
    renderHeader({ title: 'Invoices' });
    expect(screen.getByText('Invoices')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    renderHeader({ title: 'Invoices', subtitle: 'Manage your invoices' });
    expect(screen.getByText('Manage your invoices')).toBeInTheDocument();
  });

  it('renders primary action button', () => {
    const onClick = jest.fn();
    renderHeader({
      title: 'Invoices',
      primaryAction: { label: 'New Invoice', onClick },
    });
    const btn = screen.getByRole('button', { name: 'New Invoice' });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders secondary action buttons', () => {
    const onExport = jest.fn();
    renderHeader({
      title: 'Invoices',
      secondaryActions: [{ label: 'Export', onClick: onExport }],
    });
    const btn = screen.getByRole('button', { name: 'Export' });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onExport).toHaveBeenCalled();
  });

  it('does not render subtitle when not provided', () => {
    renderHeader({ title: 'Products' });
    expect(screen.queryByText('Manage')).not.toBeInTheDocument();
  });

  it('disables malformed primary action handlers', () => {
    renderHeader({
      title: 'Invoices',
      primaryAction: { label: 'Broken Action', onClick: { bad: true } },
    });

    const btn = screen.getByRole('button', { name: 'Broken Action' });
    expect(btn).toBeDisabled();
    expect(() => fireEvent.click(btn)).not.toThrow();
  });

  it('disables malformed secondary action handlers', () => {
    renderHeader({
      title: 'Invoices',
      secondaryActions: [{ label: 'Broken Secondary', onClick: null }],
    });

    const btn = screen.getByRole('button', { name: 'Broken Secondary' });
    expect(btn).toBeDisabled();
    expect(() => fireEvent.click(btn)).not.toThrow();
  });
});
