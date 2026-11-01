import React, { useEffect, useState } from 'react';
import {
  Box, Button, Chip, Container, Divider, Stack, Typography,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { HeroBadge } from '../components/Layout/PublicHeroSection';
import SeoHead from '../seo/SeoHead';
import { getPublicPlans } from '../services/subscriptionService';

const CONTACT_EMAIL = 'sales@solidevbooks.com';

const MAX_W = '1240px';

// ── Section wrapper (matches About/Features) ─────────────────────────────────
const SectionFrame = ({ children, bg, borderTop = false, py }) => (
  <Box sx={{ py: py || { xs: 7, md: 9 }, background: bg || 'transparent', borderTop: borderTop ? '1px solid rgba(15,23,42,0.06)' : 'none' }}>
    <Box sx={{ maxWidth: MAX_W, mx: 'auto', px: { xs: 2, sm: 3, md: 4 } }}>{children}</Box>
  </Box>
);

// ── Section title (matches About/Features) ────────────────────────────────────
const SectionTitle = ({ title, subtitle, maxWidth = 760 }) => (
  <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 5 } }}>
    <Typography sx={{ fontSize: { xs: '1.95rem', md: '2.6rem' }, fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a', lineHeight: 1.13, mb: 1.4 }}>
      {title}
    </Typography>
    <Typography sx={{ maxWidth, mx: 'auto', color: '#475569', fontSize: { xs: '1rem', md: '1.08rem' }, lineHeight: 1.7 }}>
      {subtitle}
    </Typography>
  </Box>
);

// ── Plan card ─────────────────────────────────────────────────────────────────
const PlanCard = ({ name, badge, price, priceSuffix, subline, features, cta, ctaVariant = 'outlined', dark = false, highlighted = false, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 32 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    style={{ height: '100%' }}
  >
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: 3,
        border: highlighted ? '2px solid' : '1px solid',
        borderColor: highlighted ? 'primary.main' : dark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.1)',
        background: dark
          ? 'linear-gradient(160deg,#0f172a 0%,#1e3a5f 100%)'
          : highlighted
          ? 'linear-gradient(165deg,rgba(255,255,255,0.99) 0%,rgba(239,246,255,0.97) 100%)'
          : 'linear-gradient(165deg,rgba(255,255,255,0.97) 0%,rgba(244,248,255,0.95) 100%)',
        boxShadow: highlighted
          ? '0 20px 40px rgba(37,99,235,0.15)'
          : '0 8px 24px rgba(15,23,42,0.07)',
        p: { xs: 3, md: 3.5 },
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: highlighted ? '0 24px 48px rgba(37,99,235,0.2)' : '0 14px 32px rgba(15,23,42,0.12)' },
      }}
    >
      {/* Badge */}
      {badge && (
        <Chip label={badge} size="small" color="primary" sx={{ mb: 1.5, alignSelf: 'flex-start', fontWeight: 700, fontSize: '0.72rem' }} />
      )}

      {/* Name + price */}
      <Typography variant="h5" fontWeight={800} sx={{ color: dark ? 'common.white' : '#0f172a', mb: 0.5 }}>
        {name}
      </Typography>
      <Box sx={{ mb: 2, mt: 1 }}>
        <Typography component="span" sx={{ fontSize: { xs: '2.2rem', md: '2.6rem' }, fontWeight: 900, color: dark ? 'common.white' : '#0f172a', lineHeight: 1 }}>
          {price}
        </Typography>
        {priceSuffix && (
          <Typography component="span" sx={{ ml: 0.5, color: dark ? 'rgba(255,255,255,0.6)' : '#64748b', fontSize: '0.95rem' }}>
            {priceSuffix}
          </Typography>
        )}
      </Box>
      {subline && (
        <Typography variant="body2" sx={{ color: dark ? 'rgba(255,255,255,0.55)' : '#64748b', mb: 2 }}>
          {subline}
        </Typography>
      )}

      <Divider sx={{ mb: 2.5, borderColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)' }} />

      {/* Feature list */}
      <Stack spacing={1.1} sx={{ flex: 1, mb: 3 }}>
        {features.map(f => (
          <Stack key={f} direction="row" spacing={1} alignItems="flex-start">
            <CheckIcon fontSize="small" sx={{ color: dark ? '#34d399' : 'success.main', mt: 0.15, flexShrink: 0 }} />
            <Typography variant="body2" sx={{ color: dark ? 'rgba(255,255,255,0.78)' : '#334155' }}>{f}</Typography>
          </Stack>
        ))}
      </Stack>

      {/* CTA */}
      <Button
        fullWidth
        variant={ctaVariant}
        size="large"
        onClick={cta.onClick}
        href={cta.href}
        sx={{
          borderRadius: '10px',
          py: 1.3,
          fontWeight: 700,
          fontSize: '0.95rem',
          ...(dark && ctaVariant === 'outlined' && {
            borderColor: 'rgba(255,255,255,0.35)',
            color: 'common.white',
            '&:hover': { borderColor: 'common.white', background: 'rgba(255,255,255,0.06)' },
          }),
        }}
      >
        {cta.label}
      </Button>
      {cta.caption && (
        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1, color: dark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>
          {cta.caption}
        </Typography>
      )}
    </Box>
  </motion.div>
);

// ── Feature comparison row ────────────────────────────────────────────────────
const CompareRow = ({ label, starter, growth, enterprise, isHeader = false }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: '2fr 1fr 1fr 1fr',
      py: isHeader ? 1.5 : 1,
      borderBottom: '1px solid rgba(15,23,42,0.06)',
      alignItems: 'center',
      bgcolor: isHeader ? 'rgba(239,246,255,0.6)' : 'transparent',
      borderRadius: isHeader ? 1 : 0,
    }}
  >
    <Typography variant={isHeader ? 'subtitle2' : 'body2'} fontWeight={isHeader ? 700 : 400} color={isHeader ? '#0f172a' : 'text.secondary'}>
      {label}
    </Typography>
    {[starter, growth, enterprise].map((val, i) => (
      <Box key={i} sx={{ textAlign: 'center' }}>
        {val === true ? (
          <CheckIcon fontSize="small" sx={{ color: 'success.main' }} />
        ) : val === false ? (
          <CloseIcon fontSize="small" sx={{ color: 'text.disabled' }} />
        ) : (
          <Typography variant="body2" fontWeight={isHeader ? 700 : 500} color={isHeader ? '#0f172a' : 'inherit'}>
            {val}
          </Typography>
        )}
      </Box>
    ))}
  </Box>
);

// ─────────────────────────────────────────────────────────────────────────────

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const [plans, setPlans] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getPublicPlans().then(d => setPlans(d.plans || [])).catch(() => {});
  }, []);

  const starterMonthly = plans.find(p => p.id === 'starter_monthly');
  const starterAnnual = plans.find(p => p.id === 'starter_annual');
  const activePlan = annual ? starterAnnual : starterMonthly;
  const monthlyEquiv = annual
    ? Math.round((activePlan?.pricing?.inr_annual || 5999) / 12)
    : (activePlan?.pricing?.inr_monthly || 599);
  const annualTotal = activePlan?.pricing?.inr_annual || 5999;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <SeoHead
        title="Pricing — Solidev Books"
        description="Simple, transparent pricing for Indian businesses. Start free for 30 days. Starter from ₹599/month."
        canonicalPath="/pricing"
      />
      <Header />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0a1628 0%, #0f2347 55%, #0d1f3c 100%)',
          py: { xs: 8, md: 10 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-30%',
            right: '-10%',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <HeroBadge icon={<LocalOfferIcon sx={{ color: '#bfdbfe !important', fontSize: 18 }} />} label="Simple, transparent pricing" />
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Typography
                sx={{
                  fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.5rem' },
                  fontWeight: 800,
                  color: 'common.white',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.08,
                  mb: 2,
                }}
              >
                Built for Indian businesses.
                <Box component="span" sx={{ display: 'block', color: '#93c5fd' }}>
                  No surprises.
                </Box>
              </Typography>
              <Typography sx={{ fontSize: { xs: '1rem', md: '1.15rem' }, color: 'rgba(232,239,255,0.8)', maxWidth: 560, mx: 'auto', mb: 4, lineHeight: 1.7 }}>
                Start free for 30 days — no credit card required. Upgrade when you're ready.
              </Typography>
            </motion.div>

            {/* Annual toggle */}
            <Stack direction="row" spacing={1.5} justifyContent="center" alignItems="center">
              <Typography variant="body2" sx={{ color: !annual ? 'common.white' : 'rgba(255,255,255,0.45)', fontWeight: !annual ? 700 : 400 }}>
                Monthly
              </Typography>
              <Box
                onClick={() => setAnnual(v => !v)}
                sx={{
                  width: 48,
                  height: 26,
                  borderRadius: '13px',
                  bgcolor: annual ? 'primary.main' : 'rgba(255,255,255,0.2)',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background-color 0.2s',
                }}
              >
                <Box sx={{
                  position: 'absolute',
                  top: 3,
                  left: annual ? 25 : 3,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  bgcolor: 'common.white',
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                }} />
              </Box>
              <Stack direction="row" spacing={0.75} alignItems="center">
                <Typography variant="body2" sx={{ color: annual ? 'common.white' : 'rgba(255,255,255,0.45)', fontWeight: annual ? 700 : 400 }}>
                  Annual
                </Typography>
                <Chip label="Save 17%" size="small" sx={{ bgcolor: '#22c55e', color: 'common.white', fontWeight: 700, fontSize: '0.7rem', height: 20 }} />
              </Stack>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* ── Plan cards ─────────────────────────────────────────────────────── */}
      <SectionFrame py={{ xs: 6, md: 8 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: { xs: 2.5, md: 3 },
            alignItems: 'stretch',
          }}
        >
          {/* Starter */}
          <PlanCard
            name="Starter"
            badge="Most popular"
            price={`₹${monthlyEquiv}`}
            priceSuffix="/month"
            subline={annual ? `Billed ₹${annualTotal.toLocaleString('en-IN')}/year` : undefined}
            features={activePlan?.display_features || [
              '3 users included',
              '100 invoices/month',
              '50 quotes/month',
              'GST reports',
              'Bank reconciliation',
              'Customer portal',
              'Email support (72h SLA)',
            ]}
            highlighted
            cta={{ label: 'Start Free Trial', onClick: () => navigate('/login?register=1'), caption: '30-day free trial · No credit card required' }}
            ctaVariant="contained"
            delay={0}
          />

          {/* Growth */}
          <PlanCard
            name="Growth"
            price="₹1,499"
            priceSuffix="/month"
            subline="Starting from · 5–15 users"
            features={['5–15 users', 'Unlimited invoices', 'API access', '5 automation rules', 'Advanced reports', 'Priority support (24h SLA)']}
            cta={{ label: 'Contact Sales', href: `mailto:${CONTACT_EMAIL}?subject=Solidev Books Growth Plan`, caption: 'Custom quote based on your team size' }}
            delay={0.1}
          />

          {/* Enterprise */}
          <PlanCard
            name="Enterprise"
            price="Custom"
            subline="Pricing tailored to your business"
            features={['Custom user seats', 'Unlimited everything', 'Custom domain', 'Multi-GSTIN', 'Dedicated CSM', 'SLA-backed support', 'White-glove onboarding']}
            dark
            cta={{ label: 'Contact Sales', href: `mailto:${CONTACT_EMAIL}?subject=Solidev Books Enterprise`, caption: "Let's build a plan that fits" }}
            ctaVariant="outlined"
            delay={0.2}
          />
        </Box>
      </SectionFrame>

      {/* ── Feature comparison ──────────────────────────────────────────────── */}
      <SectionFrame bg="white" borderTop py={{ xs: 7, md: 9 }}>
        <SectionTitle
          title="Full feature comparison"
          subtitle="See exactly what's included in each plan before you decide."
          maxWidth={600}
        />
        <Box sx={{ borderRadius: 3, border: '1px solid rgba(15,23,42,0.08)', overflow: 'hidden', bgcolor: 'white' }}>
          <Box sx={{ p: { xs: 2, md: 3 } }}>
            <CompareRow label="" starter="Starter" growth="Growth" enterprise="Enterprise" isHeader />
            <CompareRow label="Users" starter="3" growth="5–15" enterprise="Custom" />
            <CompareRow label="Invoices/month" starter="100" growth="Unlimited" enterprise="Unlimited" />
            <CompareRow label="Quotes/month" starter="50" growth="Unlimited" enterprise="Unlimited" />
            <CompareRow label="Products" starter="500" growth="Unlimited" enterprise="Unlimited" />
            <CompareRow label="GST reports" starter={true} growth={true} enterprise={true} />
            <CompareRow label="Bank reconciliation" starter={true} growth={true} enterprise={true} />
            <CompareRow label="Customer portal" starter={true} growth={true} enterprise={true} />
            <CompareRow label="Invoice branding" starter={true} growth={true} enterprise={true} />
            <CompareRow label="API access" starter={false} growth={true} enterprise={true} />
            <CompareRow label="Automation rules" starter={false} growth="5 rules" enterprise="Unlimited" />
            <CompareRow label="Advanced reports" starter={false} growth={true} enterprise={true} />
            <CompareRow label="Custom domain" starter={false} growth={false} enterprise={true} />
            <CompareRow label="Multi-GSTIN" starter={false} growth={false} enterprise={true} />
            <CompareRow label="Support" starter="Email (72h)" growth="Priority (24h)" enterprise="Dedicated CSM" />
          </Box>
        </Box>
      </SectionFrame>

      {/* ── FAQ / trust strip ───────────────────────────────────────────────── */}
      <SectionFrame py={{ xs: 6, md: 8 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: { xs: 2, md: 3 } }}>
          {[
            { q: 'Do I need a credit card to start?', a: 'No. Your 30-day free trial starts immediately with no payment information required.' },
            { q: 'Can I change plans later?', a: 'Yes. Upgrade or downgrade at any time. Unused days are prorated automatically.' },
            { q: 'Is GST included in the price?', a: '₹599/month is the base price. 18% GST (SAC 998314) is added at checkout. A tax invoice is issued for every payment.' },
          ].map(({ q, a }) => (
            <motion.div
              key={q}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
            >
              <Box
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: '1px solid rgba(15,23,42,0.08)',
                  background: 'linear-gradient(165deg,rgba(255,255,255,0.97) 0%,rgba(244,248,255,0.95) 100%)',
                  boxShadow: '0 8px 24px rgba(15,23,42,0.06)',
                  height: '100%',
                }}
              >
                <Typography fontWeight={700} color="#0f172a" mb={1} fontSize="0.95rem">{q}</Typography>
                <Typography variant="body2" color="#475569" lineHeight={1.65}>{a}</Typography>
              </Box>
            </motion.div>
          ))}
        </Box>
      </SectionFrame>

      {/* ── Bottom CTA ─────────────────────────────────────────────────────── */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0a1628 0%, #0f2347 60%, #0d1f3c 100%)',
          py: { xs: 8, md: 10 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            bottom: '-20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '700px',
            height: '400px',
            background: 'radial-gradient(ellipse, rgba(37,99,235,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <Typography sx={{ fontSize: { xs: '1.9rem', md: '2.4rem' }, fontWeight: 800, color: 'common.white', letterSpacing: '-0.02em', mb: 1.5 }}>
              Not sure yet?
            </Typography>
            <Typography sx={{ color: 'rgba(232,239,255,0.75)', fontSize: { xs: '1rem', md: '1.05rem' }, mb: 3.5, lineHeight: 1.7 }}>
              Try Solidev Books free for 30 days — full access, no credit card, cancel anytime.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/login?register=1')}
                sx={{ borderRadius: '12px', px: 4, py: 1.4, fontWeight: 700, fontSize: '0.95rem' }}
              >
                Start Free Trial
              </Button>
              <Button
                variant="outlined"
                size="large"
                href={`mailto:${CONTACT_EMAIL}`}
                sx={{ borderRadius: '12px', px: 4, py: 1.4, fontWeight: 700, fontSize: '0.95rem', borderColor: 'rgba(255,255,255,0.3)', color: 'common.white', '&:hover': { borderColor: 'common.white', background: 'rgba(255,255,255,0.06)' } }}
              >
                Talk to Sales
              </Button>
            </Stack>
            <Stack direction="row" spacing={2.5} justifyContent="center" mt={3}>
              {['No credit card', 'Setup in 2 min', 'Cancel anytime'].map(t => (
                <Typography key={t} variant="caption" sx={{ color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
                  · {t}
                </Typography>
              ))}
            </Stack>
          </motion.div>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
