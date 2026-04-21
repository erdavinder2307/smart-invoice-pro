import React from 'react';
import { Grid } from '@mui/material';

const FormRow = ({ children, spacing = 2, sx, testId }) => (
  <Grid container spacing={spacing} sx={sx} data-testid={testId}>
    {children}
  </Grid>
);

export default FormRow;