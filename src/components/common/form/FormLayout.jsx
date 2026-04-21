import React from 'react';
import { Grid } from '@mui/material';

const FormLayout = ({ children, spacing = 2, sx, testId }) => (
  <Grid container spacing={spacing} sx={{ width: '100%', ...sx }} data-testid={testId}>
    {children}
  </Grid>
);

export default FormLayout;