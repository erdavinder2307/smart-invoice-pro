import React from 'react';
import { Autocomplete, TextField, MenuItem } from '@mui/material';
import { ZohoRow, AppSelect, fieldSx, menuItemSx, C } from './formStyles';

/**
 * FormSelect — ZohoRow + Select/Autocomplete wrapper.
 *
 * Usage (basic):
 *   <FormSelect label="Status" name="status" value={form.status} onChange={handleChange}
 *     options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
 *
 * Usage (searchable — renders MUI Autocomplete):
 *   <FormSelect label="Country" searchable value={form.country}
 *     onChange={(e, val) => setForm({ ...form, country: val })}
 *     options={countries.map(c => ({ value: c.code, label: c.name }))} />
 */
const FormSelect = ({
  label,
  required,
  hint,
  labelWidth,
  noDivider,
  options = [],
  value,
  onChange,
  name,
  searchable,
  disabled,
  displayEmpty,
  placeholder,
  error,
  helperText,
  fullWidth = true,
  width,
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

  if (searchable) {
    const selectedOption = options.find((o) => o.value === value) || null;

    return (
      <ZohoRow label={label} required={required} hint={hint} labelWidth={labelWidth} noDivider={noDivider}>
        <Autocomplete
          size="small"
          fullWidth={fullWidth}
          disabled={disabled}
          options={options}
          getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.label || '')}
          isOptionEqualToValue={(opt, val) => opt.value === val?.value}
          value={selectedOption}
          onChange={(e, newVal) => {
            if (onChange) {
              onChange(
                { target: { name, value: newVal ? newVal.value : '' } },
                newVal
              );
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={placeholder}
              sx={errorFieldSx}
              error={error}
              helperText={helperText}
            />
          )}
        />
      </ZohoRow>
    );
  }

  return (
    <ZohoRow label={label} required={required} hint={hint} labelWidth={labelWidth} noDivider={noDivider}>
      <AppSelect
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        displayEmpty={displayEmpty}
        fullWidth={fullWidth}
        width={width}
      >
        {placeholder && (
          <MenuItem value="" disabled sx={menuItemSx}>
            {placeholder}
          </MenuItem>
        )}
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value} sx={menuItemSx}>
            {opt.label}
          </MenuItem>
        ))}
      </AppSelect>
      {helperText && (
        <span style={{ fontSize: '0.75rem', color: error ? C.red : C.hint, marginTop: 3 }}>
          {helperText}
        </span>
      )}
    </ZohoRow>
  );
};

export default FormSelect;
