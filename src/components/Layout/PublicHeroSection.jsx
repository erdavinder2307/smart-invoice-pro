import React from 'react';
import { Box, Button, Chip, Container, Stack, Typography } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { motion } from 'framer-motion';

const riseInLeft = {
  hidden: { opacity: 0, y: 24, x: -16 },
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    transition: { duration: 0.65, ease: 'easeOut' }
  }
};

const riseInRight = {
  hidden: { opacity: 0, y: 24, x: 16 },
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    transition: { duration: 0.65, ease: 'easeOut', delay: 0.12 }
  }
};

export const HeroBadge = ({ icon, label }) => (
  <Chip
    icon={icon}
    label={label}
    variant="outlined"
    sx={{
      mb: 2.5,
      color: '#dbeafe',
      borderColor: 'rgba(191,219,254,0.35)',
      backgroundColor: 'rgba(30,64,175,0.25)',
      backdropFilter: 'blur(8px)',
      '& .MuiChip-label': { fontWeight: 700 }
    }}
  />
);

export const HeroActions = ({ primaryAction, secondaryAction }) => (
  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.75} sx={{ mb: 2.5 }}>
    {primaryAction && (
      <Button
        component={motion.button}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        variant="contained"
        endIcon={primaryAction.endIcon || <ArrowForward />}
        onClick={primaryAction.onClick}
        href={primaryAction.href}
        target={primaryAction.target}
        rel={primaryAction.rel}
        sx={{
          px: 3.4,
          py: 1.4,
          borderRadius: '12px',
          fontSize: '1rem',
          fontWeight: 700,
          color: '#0a1530',
          textTransform: 'none',
          background:
            'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(230,239,255,1) 100%)',
          boxShadow: '0 18px 40px rgba(0,0,0,0.28)',
          '&:hover': {
            background:
              'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(214,230,255,1) 100%)'
          },
          ...primaryAction.sx
        }}
      >
        {primaryAction.label}
      </Button>
    )}

    {secondaryAction && (
      <Button
        component={motion.button}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        variant="outlined"
        onClick={secondaryAction.onClick}
        href={secondaryAction.href}
        target={secondaryAction.target}
        rel={secondaryAction.rel}
        startIcon={secondaryAction.startIcon}
        endIcon={secondaryAction.endIcon}
        sx={{
          px: 3.2,
          py: 1.35,
          borderRadius: '12px',
          fontSize: '1rem',
          fontWeight: 600,
          color: '#e9f1ff',
          textTransform: 'none',
          borderColor: 'rgba(221,231,255,0.42)',
          backgroundColor: 'rgba(255,255,255,0.02)',
          '&:hover': {
            borderColor: 'rgba(240,246,255,0.78)',
            backgroundColor: 'rgba(255,255,255,0.08)'
          },
          ...secondaryAction.sx
        }}
      >
        {secondaryAction.label}
      </Button>
    )}
  </Stack>
);

const PublicHeroSection = ({
  containerMax = 'lg',
  badgeIcon,
  badgeLabel,
  title,
  titleComponent = 'h1',
  description,
  descriptionComponent = 'p',
  primaryAction,
  secondaryAction,
  tags = [],
  rightContent,
  rootSx,
  titleSx,
  descriptionSx,
  leftContent
}) => {
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        color: 'white',
        background: 'linear-gradient(135deg, #0a0e1f 0%, #0d1b4b 40%, #0a1628 100%)',
        pt: { xs: 7, md: 10 },
        pb: { xs: 8, md: 10 },
        borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.09) 1px, transparent 0)',
          backgroundSize: '24px 24px',
          opacity: 0.25,
          pointerEvents: 'none'
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          width: { xs: 240, md: 520 },
          height: { xs: 240, md: 520 },
          borderRadius: '50%',
          right: { xs: -100, md: -140 },
          top: { xs: -80, md: -140 },
          background: 'radial-gradient(circle, rgba(83,156,255,0.35) 0%, rgba(83,156,255,0) 68%)',
          pointerEvents: 'none'
        },
        ...rootSx
      }}
    >
      <Container maxWidth={containerMax} sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.02fr 0.98fr' },
            alignItems: 'center',
            gap: { xs: 4, md: 6 }
          }}
        >
          <motion.div initial="hidden" animate="visible" variants={riseInLeft}>
            {badgeLabel && <HeroBadge icon={badgeIcon} label={badgeLabel} />}

            <Typography
              component={titleComponent}
              sx={{
                fontSize: { xs: '2.1rem', sm: '2.7rem', md: '3.4rem' },
                fontWeight: 800,
                letterSpacing: '-0.025em',
                lineHeight: 1.08,
                mb: 2.2,
                color: '#f8fafc',
                ...titleSx
              }}
            >
              {title}
            </Typography>

            <Typography
              component={descriptionComponent}
              sx={{
                fontSize: { xs: '1rem', md: '1.15rem' },
                lineHeight: 1.62,
                color: 'rgba(226, 232, 240, 0.88)',
                maxWidth: 640,
                mb: 3.5,
                ...descriptionSx
              }}
            >
              {description}
            </Typography>

            <HeroActions primaryAction={primaryAction} secondaryAction={secondaryAction} />

            {tags.length > 0 && (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {tags.map((badge) => (
                  <Chip
                    key={badge}
                    label={badge}
                    sx={{
                      color: '#e9f1ff',
                      borderRadius: '999px',
                      border: '1px solid rgba(219,232,255,0.24)',
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      backdropFilter: 'blur(8px)',
                      fontWeight: 600,
                      '& .MuiChip-label': { px: 1.2 }
                    }}
                  />
                ))}
              </Stack>
            )}

            {leftContent}
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={riseInRight}>
            {rightContent}
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
};

export default PublicHeroSection;
