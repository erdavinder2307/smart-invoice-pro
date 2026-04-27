import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import StatCard from '../../components/common/StatCard';
import { People as PeopleIcon } from '@mui/icons-material';

const theme = createTheme();
const renderCard = (props) =>
  render(
    <ThemeProvider theme={theme}>
      <StatCard {...props} />
    </ThemeProvider>
  );

describe('StatCard', () => {
  it('renders label and value', () => {
    renderCard({ label: 'Total Customers', value: 42, icon: <PeopleIcon /> });
    expect(screen.getByText('Total Customers')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('shows loading spinner when loading', () => {
    renderCard({ label: 'Revenue', value: '', loading: true });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders positive trend indicator', () => {
    renderCard({ label: 'Revenue', value: '$1,000', trend: 15, icon: <PeopleIcon /> });
    expect(screen.getByText(/15/)).toBeInTheDocument();
  });

  it('renders negative trend indicator', () => {
    renderCard({ label: 'Expenses', value: '$500', trend: -10, icon: <PeopleIcon /> });
    expect(screen.getByText(/10/)).toBeInTheDocument();
  });

  it('renders without trend', () => {
    renderCard({ label: 'Items', value: 100, icon: <PeopleIcon /> });
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.queryByText(/from last month/)).not.toBeInTheDocument();
  });

  it('does not attach invalid click handlers', () => {
    const { container } = renderCard({
      label: 'Broken',
      value: 1,
      icon: <PeopleIcon />,
      onClick: { bad: true },
    });

    expect(screen.queryByRole('button', { name: 'Broken' })).not.toBeInTheDocument();
    expect(() => fireEvent.click(container.firstChild)).not.toThrow();
  });
});
