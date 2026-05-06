import React from 'react';
import { Box, Typography } from '@mui/material';
import {
  AutoMode,
  ReceiptLong,
  SyncAlt,
  Insights
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import WorkflowFeatureCard from '../common/WorkflowFeatureCard';
import { homeTokens } from './homepageTokens';

const featureCards = [
  {
    icon: <AutoMode sx={{ fontSize: 24 }} />,
    title: 'Workflow Automation',
    description: 'Automate repetitive financial tasks and reduce manual operations.',
    metricValue: 'Rule-based orchestration',
    metricLabel: 'repeatable workflow execution',
    capabilityStatus: 'stable',
    accent: '#2563eb'
  },
  {
    icon: <ReceiptLong sx={{ fontSize: 24 }} />,
    title: 'Invoice-to-Payment Tracking',
    description: 'Track the complete customer payment lifecycle with clear handoff states.',
    metricValue: 'Lifecycle visibility',
    metricLabel: 'quote, invoice, payment continuity',
    capabilityStatus: 'stable',
    accent: '#0ea5e9'
  },
  {
    icon: <SyncAlt sx={{ fontSize: 24 }} />,
    title: 'Connected Inventory & Purchases',
    description: 'Keep stock, vendors, purchases, and sales synchronized automatically.',
    metricValue: 'Synchronized records',
    metricLabel: 'stock and purchasing alignment',
    capabilityStatus: 'expanding',
    accent: '#059669'
  },
  {
    icon: <Insights sx={{ fontSize: 24 }} />,
    title: 'Financial Visibility',
    description: 'Monitor cash flow, receivables, and business performance from one dashboard.',
    metricValue: 'Unified reporting',
    metricLabel: 'operations and finance context',
    capabilityStatus: 'stable',
    accent: '#4f46e5'
  }
];

const sectionFade = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: 'easeOut' }
  }
};

const WhyChooseSection = () => {
  return (
    <Box
      sx={{
        py: homeTokens.sectionPy,
        position: 'relative',
        background: 'linear-gradient(180deg, #fdfefe 0%, #f6faff 100%)',
        borderTop: '1px solid rgba(15, 23, 42, 0.06)',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(15,23,42,0.06) 1px, transparent 0)',
          backgroundSize: '26px 26px',
          opacity: 0.35
        }
      }}
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '1240px',
          px: { xs: 2, sm: 3, md: 4 },
          mx: 'auto'
        }}
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={sectionFade}
        >
          <Box sx={{ textAlign: 'center', mb: { xs: 4.2, md: 5.2 } }}>
            <Typography sx={{ ...homeTokens.heading.section, color: '#0f172a', mb: 1.5 }}>
              Built for Modern Financial Workflows
            </Typography>
            <Typography sx={{ ...homeTokens.heading.bodyLead, maxWidth: 780, mx: 'auto' }}>
              Manage quotes, invoices, payments, inventory, and financial operations from one connected platform.
            </Typography>
          </Box>
        </motion.div>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            gap: { xs: 2, md: 2.5 },
            alignItems: 'stretch'
          }}
        >
          {featureCards.map((feature, index) => (
            <Box key={feature.title} sx={{ display: 'flex' }}>
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.42, delay: index * 0.08 }}
                style={{ width: '100%', display: 'flex' }}
              >
                <WorkflowFeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  metricValue={feature.metricValue}
                  metricLabel={feature.metricLabel}
                  capabilityStatus={feature.capabilityStatus}
                  accent={feature.accent}
                />
              </motion.div>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default WhyChooseSection;
