import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import FormSelect from '../../components/common/FormSelect';

const theme = createTheme();
const options = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const renderSelect = (props) =>
  render(
    <ThemeProvider theme={theme}>
      <FormSelect {...props} />
    </ThemeProvider>
  );

describe('FormSelect', () => {
  it('renders label', () => {
    renderSelect({ label: 'Status', name: 'status', value: 'active', onChange: jest.fn(), options });
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('shows required asterisk', () => {
    renderSelect({ label: 'Status', required: true, name: 'status', value: '', onChange: jest.fn(), options });
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('displays selected value', () => {
    renderSelect({ label: 'Status', name: 'status', value: 'active', onChange: jest.fn(), options });
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('displays error helper text', () => {
    renderSelect({
      label: 'Status',
      name: 'status',
      value: '',
      onChange: jest.fn(),
      options,
      error: true,
      helperText: 'Status is required',
    });
    expect(screen.getByText('Status is required')).toBeInTheDocument();
  });
});
