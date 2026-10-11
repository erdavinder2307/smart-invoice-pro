import React from 'react';
import { Box, Container, Typography, Divider, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import SeoHead from '../seo/SeoHead';

export const SUPPORT_EMAIL = 'admin@solidevelectrosoft.com';

const Support = () => {
  const questions = [
    {
      question: 'How do I sign up?',
      answer: (
        <Typography paragraph>
          Create an account at{' '}
          <Link component={RouterLink} to="/signup">solidevbooks.com</Link>, then sign in to the
          app with it. The same account works in both.
        </Typography>
      )
    },
    {
      question: 'I forgot my password.',
      answer: (
        <Typography paragraph>
          Reset it on the <Link component={RouterLink} to="/forgot-password">password reset page</Link>,
          or email us.
        </Typography>
      )
    },
    {
      question: 'How do I send an invoice to my customer?',
      answer: (
        <Typography paragraph>
          Open the invoice and tap "View / Share PDF". The app creates a PDF, and you can send it with any
          app on your phone, such as Mail or a messaging app.
        </Typography>
      )
    },
    {
      question: 'How do I record a payment?',
      answer: (
        <Typography paragraph>
          Open the invoice and tap Record Payment. The invoice then shows as Paid or Partly paid.
        </Typography>
      )
    },
    {
      question: 'Can I turn a quote into an invoice?',
      answer: (
        <Typography paragraph>
          Yes. Open the quote and tap Convert to Invoice.
        </Typography>
      )
    },
    {
      question: 'Where do I add my GSTIN and logo?',
      answer: <Typography paragraph>Settings → Organization Profile.</Typography>
    },
    {
      question: 'How do I delete my account?',
      answer: (
        <>
          <Typography paragraph>
            In the app: Profile → Delete My Account. This permanently deletes your account and your
            organisation's records and cannot be undone.
          </Typography>
          <Typography paragraph>You can also email us to ask for deletion.</Typography>
        </>
      )
    },
    {
      question: 'Is my data safe?',
      answer: (
        <Typography paragraph>
          Your data travels over an encrypted connection and is stored on Microsoft Azure. Each
          organisation's data is kept separate. Read our{' '}
          <Link component={RouterLink} to="/privacy">Privacy Policy</Link>.
        </Typography>
      )
    }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <SeoHead
        title="Support | Solidev Books"
        description="Get help with Solidev Books: contact support by email, common questions, and how to delete your account."
        canonicalPath="/support"
      />
      <Header />

      <Box sx={{ flex: 1, py: { xs: 6, md: 8 }, bgcolor: '#f8fafc' }}>
        <Container maxWidth="md">
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: '2rem', md: '3rem' },
                color: '#0f172a'
              }}
            >
              Solidev Books support
            </Typography>
            <Typography paragraph sx={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7 }}>
              We're here to help. Email{' '}
              <Link href={`mailto:${SUPPORT_EMAIL}`} sx={{ fontWeight: 600 }}>{SUPPORT_EMAIL}</Link>{' '}
              and we reply within 1 working day (Monday to Friday, IST).
            </Typography>
            <Typography paragraph sx={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7 }}>
              Please tell us: the email of your Solidev Books account, whether you use the iPhone app or the
              website, and what you saw (a screenshot helps). Never send us your password.
            </Typography>
            <Typography paragraph sx={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7 }}>
              You can also write to us from the <Link component={RouterLink} to="/contact">contact page</Link>.
              Questions about payments are answered in our{' '}
              <Link component={RouterLink} to="/refund">refund and cancellation policy</Link>.
            </Typography>
          </Box>

          <Typography
            variant="h4"
            component="h2"
            sx={{ fontWeight: 700, mb: 3, color: '#0f172a', fontSize: { xs: '1.5rem', md: '1.875rem' } }}
          >
            Common questions
          </Typography>

          {questions.map((item, index) => (
            <Box key={item.question} sx={{ mb: 3 }}>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1, color: '#0f172a' }}>
                {item.question}
              </Typography>
              <Box sx={{ color: '#475569', lineHeight: 1.8 }}>{item.answer}</Box>
              {index < questions.length - 1 && <Divider sx={{ mt: 3 }} />}
            </Box>
          ))}

          <Typography sx={{ mt: 6, color: '#64748B', fontSize: '0.95rem' }}>
            Solidev Books is a product of Solidev Electrosoft (OPC) Private Limited, India.
          </Typography>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default Support;
