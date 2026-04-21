import React from 'react';
import { Box, Grid } from '@mui/material';
import { FieldLabel } from '../formStyles';

export const FORM_FIELD_LAYOUTS = {
  full: 12,
  half: { xs: 12, md: 6 },
};

export const resolveFormFieldSize = (layout = 'full') => FORM_FIELD_LAYOUTS[layout] || layout;

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
const FormField = ({
  label,
  required,
  hint,
  children,
  sx,
  fieldSx,
  layout = 'full',
  size,
  testId,
}) => {
  const resolvedSize = size || resolveFormFieldSize(layout);

  return (
    <Grid size={resolvedSize} sx={sx} data-testid={testId} data-layout={layout}>
      {label && (
        <FieldLabel required={required} hint={hint}>
          {label}
        </FieldLabel>
      )}
      <Box sx={fieldSx}>{children}</Box>
    </Grid>
  );
};

export default FormField;
