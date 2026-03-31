import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import EmptyState from '../../components/common/EmptyState';
import { Search as SearchIcon } from '@mui/icons-material';

const theme = createTheme();
const renderEmpty = (props) =>
  render(
    <ThemeProvider theme={theme}>
      <EmptyState {...props} />
    </ThemeProvider>
  );

describe('EmptyState', () => {
  it('renders title and subtitle', () => {
    renderEmpty({ title: 'No invoices', subtitle: 'Create your first invoice' });
    expect(screen.getByText('No invoices')).toBeInTheDocument();
    expect(screen.getByText('Create your first invoice')).toBeInTheDocument();
  });

  it('renders action button when action prop provided', () => {
    const onClick = jest.fn();
    renderEmpty({
      title: 'No data',
      action: { label: 'Add New', onClick },
    });
    const btn = screen.getByRole('button', { name: 'Add New' });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not render button when no action prop', () => {
    renderEmpty({ title: 'Empty' });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders custom icon', () => {
    renderEmpty({ icon: <SearchIcon data-testid="custom-icon" />, title: 'No results' });
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('renders default icon when no icon provided', () => {
    renderEmpty({ title: 'No items' });
    // Default InboxOutlined icon should render
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
