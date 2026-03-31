import React from 'react';
import { TextField } from '@mui/material';
import { ZohoRow, fieldSx, C } from './formStyles';

/**
 * FormInput — ZohoRow + TextField wrapper with inline error support.
 *
 * Usage:
 *   <FormInput label="Vendor Name" required name="name" value={form.name} onChange={handleChange} />
 *   <FormInput label="Notes" multiline rows={3} alignStart ... />
 *   <FormInput label="Email" error={!!errors.email} helperText={errors.email} ... />
 */
const FormInput = ({
  label,
  required,
  hint,
  noDivider,
  alignStart,
  error,
  helperText,
  ...textFieldProps
}) => {
  const errorFieldSx = error
    ? {
        ...fieldSx,
        '& .MuiOutlinedInput-root': {
          ...fieldSx['& .MuiOutlinedInput-root'],
          '& fieldset': { borderColor: C.red },
          '&:hover fieldset': { borderColor: C.red },
        },
      }
    : fieldSx;

  return (
    <ZohoRow
      label={label}
      required={required}
      hint={hint}
      noDivider={noDivider}
      alignStart={alignStart || !!textFieldProps.multiline}
    >
      <TextField
        size="small"
        fullWidth
        sx={errorFieldSx}
        error={error}
        helperText={helperText}
        {...textFieldProps}
      />
    </ZohoRow>
  );
};

export default FormInput;
