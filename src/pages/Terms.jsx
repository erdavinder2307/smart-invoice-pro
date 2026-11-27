import React from 'react';
import { Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LegalPage from '../components/Layout/LegalPage';
import { LEGAL_ENTITY } from '../config/legalEntity';
import { SUPPORT_EMAIL } from './Support';
import { TRIAL_DAYS, gstPercentLabel } from '../config/plans';

const mail = <Link href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</Link>;
const page = (to, label) => <Link component={RouterLink} to={to}>{label}</Link>;

const Terms = () => {
  const sections = [
    {
      title: '1. Who we are',
      paragraphs: [
        `Solidev Books is provided by ${LEGAL_ENTITY.name} ("we", "us"), a company registered in India (CIN ${LEGAL_ENTITY.cin}, GSTIN ${LEGAL_ENTITY.gstin}), with its registered office at ${LEGAL_ENTITY.address}.`,
        'These terms are a contract between us and the business or person that creates a Solidev Books account ("you"). By creating an account or using Solidev Books you accept them. If you accept them for a business, you confirm that you are at least 18 years old and allowed to bind that business.',
      ],
    },
    {
      title: '2. The service',
      paragraphs: [
        'Solidev Books is online software for invoices, quotes, payments, expenses, GST reports, bank reconciliation and related accounting work. We keep improving it, so features may change. We will not remove a main feature you are paying for during a paid period without telling you first.',
        'Solidev Books is a tool. It does not give tax, legal or accounting advice. You are responsible for the entries you make, for checking reports before you rely on them, and for your own GST returns and other statutory filings. Please check them with your CA or accountant.',
      ],
    },
    {
      title: '3. Your account and users',
      bullets: [
        'The person who creates the account is its owner and can add users up to the number of seats in your plan. Each plan includes one free seat for your CA or accountant.',
        'Keep passwords private and tell us at once if you think someone has used your account without permission.',
        'You are responsible for what your users do in your account.',
      ],
    },
    {
      title: '4. Free trial',
      paragraphs: [
        `Every new account starts with a ${TRIAL_DAYS}-day free trial with all features. No card is needed and nothing is charged during the trial.`,
        'When the trial ends you need a paid plan to keep adding new records. Your existing data stays available to view and export for 30 days, so nothing is lost while you decide.',
      ],
    },
    {
      title: '5. Plans, fees and GST',
      bullets: [
        <>Prices are shown on our {page('/pricing', 'pricing page')} in Indian rupees and exclude GST. GST (currently {gstPercentLabel}) is added to every payment, and we issue a GST tax invoice for each payment.</>,
        'Plans are paid in advance, monthly or yearly. Payments are collected by our payment partner Razorpay. When you subscribe you authorise recurring charges (for example a card or UPI AutoPay mandate) for each renewal until you cancel.',
        'We may change prices. We will tell you at least 30 days before, and a new price applies only from your next renewal.',
        'If a renewal payment fails we will tell you and try again. If it is still unpaid 15 days after the due date, we may limit the account to view and export only until it is paid.',
      ],
    },
    {
      title: '6. Cancellation and refunds',
      paragraphs: [
        <>You can cancel any time from Settings → Billing. Cancellation takes effect at the end of the period you have paid for. Refunds follow our {page('/refund', 'refund and cancellation policy')}.</>,
      ],
    },
    {
      title: '7. Your data',
      bullets: [
        'You own the data you put into Solidev Books, including your customers, vendors, items, invoices and bank records.',
        <>We use your data only to provide and support the service, as our {page('/privacy', 'privacy policy')} explains. We do not sell it or use it for advertising.</>,
        'When you enter personal data about other people (for example your customers or employees), you are responsible for having the right to do so under the Digital Personal Data Protection Act, 2023 and other laws. We process that data on your behalf.',
      ],
    },
    {
      title: '8. Export and leaving',
      paragraphs: [
        'You can export your data at any time. If your account is cancelled or closed, you have 30 days to export it. After that we delete your data from the live service, and from backups when they expire, except records we must keep by law (for example the tax invoices we issued to you).',
      ],
    },
    {
      title: '9. Acceptable use',
      paragraphs: ['You agree not to:'],
      bullets: [
        'use Solidev Books for anything illegal, including fake invoices, tax evasion or money laundering;',
        'upload malware, or try to break, overload, probe or get around the security of the service;',
        'access another organisation’s data or try to use the service without an account;',
        'copy, resell or reverse engineer the software, except where the law allows it;',
        'store content that is unlawful under Indian law.',
      ],
    },
    {
      title: '10. Availability and support',
      paragraphs: [
        <>We work to keep Solidev Books available and secure, but we cannot promise it will never be interrupted. Planned maintenance is done at quiet times where possible. For help, write to {mail} or see the {page('/support', 'support page')}.</>,
      ],
    },
    {
      title: '11. Other services',
      paragraphs: [
        'Some features rely on other providers, for example Razorpay for payments and an AI service that reads bank statements you upload for reconciliation. Their part of the service is also covered by their own terms. Our privacy policy lists the providers we use.',
      ],
    },
    {
      title: '12. Our intellectual property',
      paragraphs: [
        'The software, design, name and logo of Solidev Books belong to us. These terms give you a limited, non-exclusive, non-transferable right to use the service for your business while your account is active. If you send us suggestions, we may use them without owing you anything.',
      ],
    },
    {
      title: '13. Warranties',
      paragraphs: [
        'We provide Solidev Books with reasonable skill and care. Apart from that, and to the extent the law allows, the service is provided "as is", without other promises, for example that it will suit a particular purpose or be free of every error.',
      ],
    },
    {
      title: '14. Limit of liability',
      paragraphs: [
        'To the extent the law allows, we are not liable for indirect or consequential losses, such as lost profits, lost business or lost data that could have been restored from your own exports. Our total liability for all claims is limited to the fees you paid us in the 12 months before the event that caused the claim.',
        'Nothing in these terms limits liability that cannot be limited under Indian law, such as liability for fraud.',
      ],
    },
    {
      title: '15. Your responsibility to us',
      paragraphs: [
        'If someone makes a claim against us because of data you stored or the way you used Solidev Books in breach of these terms or the law, you will cover our reasonable losses and costs from that claim.',
      ],
    },
    {
      title: '16. Suspension and closing an account',
      paragraphs: [
        'We may suspend or close an account that breaks these terms or the law, or that puts the service or other customers at risk. Where we can, we will warn you first and give you time to fix the problem. You keep the right to export your data as described in section 8, unless the law stops us.',
      ],
    },
    {
      title: '17. Content you store and complaints',
      paragraphs: [
        <>Where we act as an intermediary under the Information Technology Act, 2000 for content stored by our users, we follow the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021. Complaints go to the Grievance Officer named in our {page('/privacy', 'privacy policy')}.</>,
      ],
    },
    {
      title: '18. Changes to these terms',
      paragraphs: [
        'We may update these terms. For important changes we will tell you by email or in the app at least 30 days before they apply. If you do not agree, you can cancel before then.',
      ],
    },
    {
      title: '19. Law and disputes',
      paragraphs: [
        'These terms are governed by the laws of India. If there is a dispute, we will both first try to settle it in good faith within 30 days of written notice. If that fails, the courts at Mohali (SAS Nagar), Punjab have exclusive jurisdiction.',
      ],
    },
    {
      title: '20. Contact',
      paragraphs: [
        <>{LEGAL_ENTITY.name}, {LEGAL_ENTITY.address}. Email: {mail}.</>,
      ],
    },
  ];

  return (
    <LegalPage
      title="Terms of Service"
      seoTitle="Terms of Service"
      seoDescription="Terms of Service for Solidev Books, online accounting and GST invoicing software by Solidev Electrosoft (OPC) Private Limited, India."
      canonicalPath="/terms"
      intro="Please read these terms before using Solidev Books. They are written in plain English; the short version is: you own your data, you can cancel any time, prices exclude GST, and Indian law applies."
      sections={sections}
    />
  );
};

export default Terms;
