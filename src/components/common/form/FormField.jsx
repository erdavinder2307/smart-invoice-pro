import React from 'react';
import { Box } from '@mui/material';
import { FieldLabel } from '../formStyles';

/**
 * FormField — Composable label-above-input building block.
 *
 * Designed to be used inside <Grid item xs={...}> for consistent
 * label + field stacked layout within two-column form sections.
 *
 * Features:
 *  - Label always top-aligned
 *  - Required indicator (*)
 *  - Hint tooltip via FieldLabel
 *  - Zero layout assumptions — caller decides width via Grid
 *
 * Example:
 *   <Grid container spacing={2}>
 *     <Grid item xs={12}>
 *       <FormField label="Selling Price" required>
 *         <TextField name="price" fullWidth size="small" sx={fieldSx} />
 *       </FormField>
 *     </Grid>
 *   </Grid>
 */
const FormField = ({ label, required, hint, children, sx }) => (
  <Box sx={sx}>
    {label && (
      <FieldLabel required={required} hint={hint}>
        {label}
      </FieldLabel>
    )}
    {children}
  </Box>
);

export default FormField;
