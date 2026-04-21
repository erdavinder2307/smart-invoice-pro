import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  useTheme
} from '@mui/material';
import { Receipt, TrendingUp } from '@mui/icons-material';

// Example component demonstrating theme usage
const ThemeExampleCard = () => {
  useTheme();

  return (
    <Box sx={{ p: 4, bgcolor: 'background.default' }}>
      <Typography variant="h4" sx={{ mb: 4, textAlign: 'center' }}>
        Theme Example Components
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Example Card 1 */}
        <Card sx={{ maxWidth: 300 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Receipt sx={{ color: 'primary.main', mr: 1, fontSize: 32 }} />
              <Typography variant="h6" component="h2">
                Smart Invoicing
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              This card demonstrates the theme's typography, colors, and card styling. 
              Notice the rounded corners, soft shadows, and consistent color palette.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip label="Primary" color="primary" size="small" />
              <Chip label="Secondary" color="secondary" size="small" />
              <Chip label="Warning" color="warning" size="small" />
            </Box>
          </CardContent>
          <CardActions>
            <Button color="primary" variant="contained">
              Primary Action
            </Button>
            <Button color="secondary" variant="outlined">
              Secondary
            </Button>
          </CardActions>
        </Card>

        {/* Example Card 2 */}
        <Card sx={{ maxWidth: 300 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUp sx={{ color: 'secondary.main', mr: 1, fontSize: 32 }} />
              <Typography variant="h6" component="h2">
                Analytics Dashboard
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              Button styles include rounded corners (8px), bold text, and hover effects. 
              The theme ensures consistent spacing and typography across all components.
            </Typography>
            <Box sx={{ 
              p: 2, 
              bgcolor: 'grey.50', 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'grey.200'
            }}>
              <Typography variant="caption" color="text.secondary">
                Background colors and borders use theme palette values for consistency
              </Typography>
            </Box>
          </CardContent>
          <CardActions>
            <Button color="error" variant="contained">
              Error State
            </Button>
            <Button color="warning" variant="text">
              Warning
            </Button>
          </CardActions>
        </Card>
      </Box>

      {/* Typography Examples */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Typography Hierarchy
        </Typography>
        <Typography variant="h4" color="primary.main" sx={{ mb: 1 }}>
          Heading 4 (Inter font, Primary color)
        </Typography>
        <Typography variant="h5" color="secondary.main" sx={{ mb: 1 }}>
          Heading 5 (Inter font, Secondary color)
        </Typography>
        <Typography variant="h6" color="text.primary" sx={{ mb: 2 }}>
          Heading 6 (Inter font, Text primary)
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Body 1: This is the default body text using Roboto font family
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Body 2: Secondary text with muted color for descriptions and captions
        </Typography>
      </Box>

      {/* Button Examples */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button variant="contained" color="primary">
          Primary Button
        </Button>
        <Button variant="outlined" color="secondary">
          Secondary Outlined
        </Button>
        <Button variant="text" color="warning">
          Warning Text
        </Button>
        <Button variant="contained" color="error">
          Error Button
        </Button>
      </Box>
    </Box>
  );
};

export default ThemeExampleCard;
