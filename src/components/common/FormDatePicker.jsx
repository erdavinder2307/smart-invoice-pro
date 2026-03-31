import React from 'react';
import { TextField } from '@mui/material';
import { ZohoRow, fieldSx, C } from './formStyles';

/**
 * FormDatePicker — ZohoRow + date TextField wrapper.
 *
 * Usage:
 *   <FormDatePicker label="Due Date" required name="due_date"
 *     value={form.due_date} onChange={handleChange} />
 */
const FormDatePicker = ({
  label,
  required,
  hint,
  noDivider,
  value,
  onChange,
  name,
  min,
  max,
  disabled,
  error,
  helperText,
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
    <ZohoRow label={label} required={required} hint={hint} noDivider={noDivider}>
      <TextField
        type="date"
        size="small"
        fullWidth
        name={name}
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        error={error}
        helperText={helperText}
        sx={errorFieldSx}
        inputProps={{ min, max }}
        InputLabelProps={{ shrink: true }}
      />
    </ZohoRow>
  );
};

export default FormDatePicker;
