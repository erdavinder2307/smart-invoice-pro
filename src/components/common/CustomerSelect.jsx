import React from 'react';
import { Autocomplete, Box, TextField, Typography } from '@mui/material';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import { useNavigate } from 'react-router-dom';
import { C, fieldSx } from './formStyles';

/**
 * CustomerSelect — Searchable customer Autocomplete for use in any form.
 *
 * Props:
 *   customers   — Array of customer objects from GET /api/customers
 *   value       — Currently selected customer_id (string)
 *   onChange    — (event) => void — fires a synthetic { target: { name, value: id } }
 *   name        — Form field name (default: 'customer_id')
 *   required    — Boolean, marks the input as required
 *   error       — Boolean, shows error styling
 *   helperText  — String, shown below the field
 *
 * Filters across: display_name, name, company_name, email
 * Displays:  primary display name + secondary email
 * Footer:    "+ New Customer" shortcut — navigates to /customers/add
 *
 * Reuse in: AddEditInvoice, AddEditQuote, AddEditSalesOrder, AddEditBill, etc.
 */

const ADD_NEW_SENTINEL = '__add_new_customer__';

const getDisplayName = (customer) =>
  customer.display_name || customer.name || customer.company_name || customer.email || '';

const CustomerSelect = ({
  customers = [],
  value = '',
  onChange,
  name = 'customer_id',
  required = false,
  error = false,
  helperText,
}) => {
  const navigate = useNavigate();

  // Build options: existing customers + sentinel "add new" option at the end
  const options = [
    ...customers,
    { id: ADD_NEW_SENTINEL, _isAddNew: true },
  ];

  // Resolve which customer object is currently selected
  const selectedOption = customers.find((c) => c.id === value) || null;

  const handleChange = (_event, newValue) => {
    if (!newValue) {
      // Cleared
      onChange({ target: { name, value: '' } });
      return;
    }
    if (newValue._isAddNew) {
      navigate('/customers/add');
      return;
    }
    onChange({ target: { name, value: newValue.id } });
  };

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
    <Autocomplete
      size="small"
      options={options}
      value={selectedOption}
      onChange={handleChange}
      getOptionLabel={(option) => {
        if (option._isAddNew) return '';
        return getDisplayName(option);
      }}
      isOptionEqualToValue={(option, val) => option.id === val?.id}
      filterOptions={(opts, { inputValue }) => {
        const term = inputValue.trim().toLowerCase();
        const filtered = term
          ? opts.filter((opt) => {
              if (opt._isAddNew) return true; // always show sentinel
              return (
                (opt.display_name || '').toLowerCase().includes(term) ||
                (opt.name || '').toLowerCase().includes(term) ||
                (opt.company_name || '').toLowerCase().includes(term) ||
                (opt.email || '').toLowerCase().includes(term)
              );
            })
          : opts;
        return filtered;
      }}
      ListboxProps={{ style: { maxHeight: 300, overflow: 'auto' } }}
      renderOption={(props, option) => {
        if (option._isAddNew) {
          const { key, ...rest } = props;
          return (
            <Box
              key={key}
              component="li"
              {...rest}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                py: '10px !important',
                px: '14px !important',
                borderTop: `1px solid ${C.border}`,
                color: C.primary,
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <PersonAddAltIcon sx={{ fontSize: 17 }} />
              New Customer
            </Box>
          );
        }

        const displayName = getDisplayName(option);
        const email = option.email && option.email !== '-' ? option.email : null;
        const { key, ...rest } = props;

        return (
          <Box
            key={key}
            component="li"
            {...rest}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start !important',
              py: '8px !important',
              px: '14px !important',
              gap: 0,
            }}
          >
            <Typography sx={{ fontSize: '0.875rem', color: '#1f2937', fontWeight: 500, lineHeight: 1.4 }}>
              {displayName}
            </Typography>
            {email && (
              <Typography sx={{ fontSize: '0.75rem', color: C.hint, lineHeight: 1.3 }}>
                {email}
              </Typography>
            )}
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          required={required}
          placeholder="Search by name, company, or email"
          error={error}
          helperText={helperText}
          sx={errorFieldSx}
        />
      )}
      noOptionsText="No customers found"
    />
  );
};

export default CustomerSelect;
