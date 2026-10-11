import React from 'react';
import { Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LegalPage from '../components/Layout/LegalPage';
import { LEGAL_ENTITY } from '../config/legalEntity';
import { SUPPORT_EMAIL } from './Support';

export const GRIEVANCE_OFFICER = {
  name: 'Davinder Pal',
  email: 'admin@solidevelectrosoft.com',
};

export const PROCESSORS = [
  { name: 'Microsoft Azure', purpose: 'hosting, database and file storage in the Central India region, and sending emails (Azure Communication Services)' },
  { name: 'Razorpay', purpose: 'collecting subscription payments; card, UPI and bank details are entered with Razorpay and never stored by us' },
  { name: 'Google Firebase', purpose: 'usage analytics and push notifications' },
  { name: 'Anthropic', purpose: 'reading bank statements you upload and suggesting reconciliation matches (only the content you send to that feature)' },
];

const mail = (address) => <Link href={`mailto:${address}`}>{address}</Link>;

const Privacy = () => {
  const sections = [
    {
      title: '1. Who we are',
      paragraphs: [
        `Solidev Books is run by ${LEGAL_ENTITY.name} (CIN ${LEGAL_ENTITY.cin}), ${LEGAL_ENTITY.address} ("we", "us"). This policy explains what personal data we collect when you use the Solidev Books website and apps, why, and the rights you have under the Digital Personal Data Protection Act, 2023 ("DPDP Act").`,
      ],
    },
    {
      title: '2. Our two roles',
      bullets: [
        'For your own account (the people who sign up and use Solidev Books), we decide why and how the data is used, so we are the Data Fiduciary.',
        'For the data you keep in your books about other people (your customers, vendors and employees), your business is the Data Fiduciary and we process it only on your instructions to provide the service.',
      ],
    },
    {
      title: '3. What we collect',
      bullets: [
        'Account data: name, email address, phone number if you give it, and your password (stored only as a secure hash).',
        'Business data: business name, address, GSTIN, PAN and bank details you enter for your invoices.',
        'Books data: customers, vendors, items, invoices, quotes, payments, expenses and the bank statements you upload.',
        'Payment data: plan, amount, date and payment reference from Razorpay. We do not see or store full card numbers, UPI PINs or bank passwords.',
        'Usage and device data: pages used, actions, IP address, browser and device type, error logs, and a notification token if you allow notifications.',
        'Messages you send us, for example support emails.',
      ],
    },
    {
      title: '4. Why we use it',
      paragraphs: ['We use personal data only for these purposes:'],
      bullets: [
        'to create your account, sign you in and run the features you use;',
        'to bill your subscription and issue GST tax invoices;',
        'to send service emails and notifications (for example password resets, payment receipts and important changes);',
        'to keep the service secure, prevent fraud and fix problems;',
        'to understand how the product is used so we can improve it;',
        'to meet our legal duties, for example keeping tax records.',
      ],
      after: [
        'We rely on the consent you give when you sign up, and on the legitimate uses the DPDP Act allows, such as meeting legal obligations. We do not sell personal data and do not use it for advertising.',
      ],
    },
    {
      title: '5. Withdrawing consent',
      paragraphs: [
        `You can withdraw your consent at any time by writing to ${GRIEVANCE_OFFICER.email}. We will then stop processing your data, except what the law requires us to keep. Withdrawing consent does not affect processing already done, and without it we may not be able to keep your account running.`,
      ],
    },
    {
      title: '6. Where your data is stored',
      paragraphs: [
        'Your account and books data are stored on Microsoft Azure in the Central India region. Some providers listed below may process data outside India; we only use providers in countries the Government of India has not restricted under the DPDP Act, and each must protect the data under a contract with us.',
      ],
    },
    {
      title: '7. Who processes data for us',
      bullets: PROCESSORS.map((p) => `${p.name}: ${p.purpose}.`),
      after: [
        'We share data with no one else, except when the law or a court or government order requires it.',
      ],
    },
    {
      title: '8. Cookies and similar storage',
      paragraphs: [
        'We use storage in your browser that is needed to keep you signed in, and analytics (Google Firebase) to count visits and feature use. You can block or delete cookies in your browser settings; the app may then not keep you signed in.',
      ],
    },
    {
      title: '9. How long we keep data',
      bullets: [
        'While your account is open, we keep your data so the service works.',
        'After you close your account, you have 30 days to export your data. We then delete it from the live service, and from backups when they expire.',
        'We keep the tax invoices we issued to you, and the payment records behind them, for as long as GST law requires (currently 72 months from the due date of the annual return for that year).',
        'Security and error logs are kept for a limited time and then deleted.',
      ],
    },
    {
      title: '10. Your rights',
      paragraphs: ['Under the DPDP Act you can:'],
      bullets: [
        'get a summary of the personal data we hold about you and how we use it;',
        'have it corrected, completed or updated;',
        'have it erased when it is no longer needed, unless the law requires us to keep it;',
        'nominate another person to use these rights for you if you die or cannot act;',
        'complain to our Grievance Officer, and then to the Data Protection Board of India if you are not satisfied.',
      ],
      after: [
        <>To use a right, email {mail(GRIEVANCE_OFFICER.email)} from the email of your account. If your data is in another business’s books (for example you are one of their customers), please contact that business first; we will help them answer you.</>,
      ],
    },
    {
      title: '11. Grievance Officer',
      paragraphs: [
        `${GRIEVANCE_OFFICER.name}, Grievance Officer, ${LEGAL_ENTITY.name}, ${LEGAL_ENTITY.address}.`,
        <>Email: {mail(GRIEVANCE_OFFICER.email)}. We acknowledge every complaint within 24 hours and resolve it within 15 days.</>,
      ],
    },
    {
      title: '12. Security',
      paragraphs: [
        'Data is encrypted in transit (HTTPS), passwords are hashed, every organisation’s data is kept separate, and only staff who need it for support or operations can access production data. If a personal data breach happens, we will inform the Data Protection Board of India and the people affected, as the DPDP Act requires.',
      ],
    },
    {
      title: '13. Children',
      paragraphs: [
        'Solidev Books is for businesses and is not meant for anyone under 18. We do not knowingly collect personal data of children.',
      ],
    },
    {
      title: '14. Changes to this policy',
      paragraphs: [
        'If we make important changes, we will tell you by email or in the app before they apply. The date at the top shows the latest version.',
      ],
    },
    {
      title: '15. Contact',
      paragraphs: [
        <>Questions about this policy: {mail(GRIEVANCE_OFFICER.email)}. General help: {mail(SUPPORT_EMAIL)} or our <Link component={RouterLink} to="/support">support page</Link>.</>,
      ],
    },
  ];

  return (
    <LegalPage
      title="Privacy Policy"
      seoTitle="Privacy Policy"
      seoDescription="How Solidev Books collects, uses and protects personal data under India's Digital Personal Data Protection Act, 2023, and how to reach our Grievance Officer."
      canonicalPath="/privacy"
      intro="In short: your data is stored in India, we use it only to run Solidev Books, we never sell it, and you can ask us to see, correct or delete it."
      sections={sections}
    />
  );
};

export default Privacy;
