import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import FormInput from '../../components/common/FormInput';

const theme = createTheme();
const renderInput = (props) =>
  render(
    <ThemeProvider theme={theme}>
      <FormInput {...props} />
    </ThemeProvider>
  );

describe('FormInput', () => {
  it('renders label and text field', () => {
    renderInput({ label: 'Customer Name', name: 'name', value: '', onChange: jest.fn() });
    expect(screen.getByText('Customer Name')).toBeInTheDocument();
    expect(document.querySelector('input[name="name"]')).toBeInTheDocument();
  });

  it('shows required asterisk', () => {
    renderInput({ label: 'Email', required: true, name: 'email', value: '', onChange: jest.fn() });
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('displays error helper text', () => {
    renderInput({
      label: 'Email',
      name: 'email',
      value: '',
      onChange: jest.fn(),
      error: true,
      helperText: 'Email is required',
    });
    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });

  it('calls onChange when typing', () => {
    const handleChange = jest.fn();
    renderInput({ label: 'Name', name: 'name', value: '', onChange: handleChange });
    fireEvent.change(document.querySelector('input[name="name"]'), {
      target: { value: 'Acme' },
    });
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders multiline textarea', () => {
    renderInput({
      label: 'Notes',
      name: 'notes',
      value: '',
      onChange: jest.fn(),
      multiline: true,
      rows: 3,
    });
    expect(document.querySelector('textarea[name="notes"]')).toBeInTheDocument();
  });
});
