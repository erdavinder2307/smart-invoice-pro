import React from 'react';
import { Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LegalPage from '../components/Layout/LegalPage';
import { SUPPORT_EMAIL } from './Support';
import { TRIAL_DAYS } from '../config/plans';

const Refund = () => {
  const sections = [
    {
      title: 'Free trial',
      paragraphs: [
        `Every plan starts with a ${TRIAL_DAYS}-day free trial. No card is needed, so nothing is charged during the trial.`,
      ],
    },
    {
      title: 'Cancelling',
      paragraphs: [
        'You can cancel any time from Settings → Billing. Your plan keeps working until the end of the period you have already paid for, and you are not charged again.',
      ],
    },
    {
      title: 'Monthly plans',
      paragraphs: [
        'We do not refund part of a month: cancelling in the middle of a month does not give a pro-rata refund.',
      ],
    },
    {
      title: 'Yearly plans',
      paragraphs: [
        'If you cancel within 7 days of your first yearly payment, we refund it in full. After that, a yearly plan runs to the end of its year and we do not refund the remaining months.',
      ],
    },
    {
      title: 'Wrong or duplicate charges',
      paragraphs: [
        'If you were charged twice for the same period, or a payment failed but money left your account, we refund it to the same card, UPI or bank account within 7–10 working days.',
        'GST on a refunded payment is reversed with a credit note against the tax invoice for that payment.',
      ],
    },
    {
      title: 'How to ask for a refund',
      paragraphs: [
        <>
          Email <Link href={`mailto:${SUPPORT_EMAIL}`} sx={{ fontWeight: 600 }}>{SUPPORT_EMAIL}</Link> from the email of your
          Solidev Books account, with the date and amount of the payment. We reply within 2 working days, and an approved
          refund reaches you in the time shown above, depending on your bank. See also our{' '}
          <Link component={RouterLink} to="/pricing">pricing</Link> and{' '}
          <Link component={RouterLink} to="/support">support</Link> pages.
        </>,
      ],
    },
  ];

  return (
    <LegalPage
      title="Refund and cancellation policy"
      seoTitle="Refund and cancellation policy | Solidev Books"
      seoDescription={`Solidev Books refund and cancellation policy: ${TRIAL_DAYS}-day free trial with no card, cancel any time, refunds for duplicate or failed payments.`}
      canonicalPath="/refund"
      sections={sections}
    />
  );
};

export default Refund;
