import React from 'react';
import { Box, Container, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import SeoHead from '../seo/SeoHead';

const Privacy = () => {
  const sections = [
    {
      title: '1. Introduction',
      content: (
        <>
          <Typography paragraph>
            Solidev Books Inc. ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our software-as-a-service (SaaS) platform, Solidev Books (the "Service").
          </Typography>
          <Typography paragraph>
            Please read this Privacy Policy carefully. By accessing and using Solidev Books, you acknowledge that you have read, understood, and agree to be bound by all the terms of this Privacy Policy. If you do not agree with our policies and practices, please do not use our Service.
          </Typography>
        </>
      )
    },
    {
      title: '2. Data We Collect',
      content: (
        <>
          <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
            2.1 User Data
          </Typography>
          <Typography paragraph>
            When you register for an account, we collect:
          </Typography>
          <List sx={{ ml: 2 }}>
            <ListItem>
              <ListItemText primary="Email address" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Full name" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Password (encrypted)" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Organization role and permissions" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Profile information" />
            </ListItem>
          </List>

          <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
            2.2 Organization Data
          </Typography>
          <Typography paragraph>
            Each organization using Solidev Books provides:
          </Typography>
          <List sx={{ ml: 2 }}>
            <ListItem>
              <ListItemText primary="Organization name, address, and contact information" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Tax ID and company identification" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Bank account information (for payment reconciliation)" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Branding and configuration settings" />
            </ListItem>
          </List>

          <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
            2.3 Operational Data
          </Typography>
          <Typography paragraph>
            Your organization creates and manages:
          </Typography>
          <List sx={{ ml: 2 }}>
            <ListItem>
              <ListItemText primary="Invoices, quotes, and purchase orders" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Customer and vendor information" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Product catalogs and inventory data" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Payment and transaction records" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Financial documents and reports" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Communication history (via our platform)" />
            </ListItem>
          </List>

          <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
            2.4 Audit and Activity Logs
          </Typography>
          <Typography paragraph>
            We automatically collect audit logs that include:
          </Typography>
          <List sx={{ ml: 2 }}>
            <ListItem>
              <ListItemText primary="User actions and changes made to data (create, read, update, delete)" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Timestamp and user attribution for each action" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Login and access events" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Administrative actions (user management, settings changes)" />
            </ListItem>
          </List>

          <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
            2.5 Technical Data
          </Typography>
          <Typography paragraph>
            We collect technical information to improve our Service:
          </Typography>
          <List sx={{ ml: 2 }}>
            <ListItem>
              <ListItemText primary="IP address" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Browser type and version" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Operating system" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Device information" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Session and cookie information" />
            </ListItem>
          </List>
        </>
      )
    },
    {
      title: '3. Multi-Tenant Data Isolation',
      content: (
        <>
          <Typography paragraph>
            Solidev Books is a multi-tenant SaaS platform. Each organization's data is:
          </Typography>
          <List sx={{ ml: 2 }}>
            <ListItem>
              <ListItemText primary="Logically separated and isolated from other organizations" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Accessible only by users who belong to that organization (based on role-based access control)" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Never shared with or accessible to other organizations" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Stored in the same database infrastructure but protected by tenant identifiers and access controls" />
            </ListItem>
          </List>
          <Typography paragraph sx={{ mt: 2 }}>
            Organization administrators control which users have access to what data within their organization via role-based permissions.
          </Typography>
        </>
      )
    },
    {
      title: '4. How We Use Your Data',
      content: (
        <>
          <Typography paragraph>
            We use the information we collect for:
          </Typography>
          <List sx={{ ml: 2 }}>
            <ListItem>
              <ListItemText primary="Providing and maintaining the Service" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Processing transactions and sending related information" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Sending transactional emails (password reset, notifications)" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Generating audit logs for compliance and accountability" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Automating workflows and recurring tasks (e.g., recurring invoice generation, payment reminders)" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Performing reconciliation and matching of financial transactions" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Supporting role-based access control and permissions" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Analyzing usage patterns to improve the Service (in aggregated form)" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Debugging and troubleshooting technical issues" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Complying with legal obligations" />
            </ListItem>
          </List>
        </>
      )
    },
    {
      title: '5. Data Retention',
      content: (
        <>
          <Typography paragraph>
            We retain your data according to the following schedule:
          </Typography>
          <List sx={{ ml: 2 }}>
            <ListItem>
              <ListItemText primary="Active Data: Retained while your account is active. Organization administrators can export or delete their data at any time." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Soft Deletion: When you delete data within the Service, it is marked as deleted but retained for 30 days in case of accidental deletion." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Audit Logs: Retained for 2 years for compliance, accountability, and security purposes." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Backups: Database backups are retained for 90 days." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Account Deletion: Upon request, we will permanently delete your organization's data within 30 days, except where legally required to retain (e.g., tax records)." />
            </ListItem>
          </List>
        </>
      )
    },
    {
      title: '6. Security of Your Data',
      content: (
        <>
          <Typography paragraph>
            We implement comprehensive security measures to protect your information:
          </Typography>
          <List sx={{ ml: 2 }}>
            <ListItem>
              <ListItemText primary="Encryption in Transit: All data transmitted between your device and our servers uses TLS 1.2+ encryption (HTTPS)." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Authentication: User authentication uses JWT tokens with HS256 signing, tokens expire after 2 hours." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Password Security: Passwords are hashed using industry-standard algorithms before storage." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Role-Based Access Control: Users can only access data their role permits." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Multi-Tenant Isolation: Each organization's data is logically separated and protected from others." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Hosting Infrastructure: Data is hosted on Microsoft Azure with industry-standard security practices." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Monitoring: We monitor for unauthorized access attempts and suspicious activity." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Regular Updates: We maintain current security patches and software updates." />
            </ListItem>
          </List>
          <Typography paragraph sx={{ mt: 2 }}>
            While we implement robust security measures, no system is completely secure. Please use a strong password and enable two-factor authentication if available.
          </Typography>
        </>
      )
    },
    {
      title: '7. Third-Party Services',
      content: (
        <>
          <Typography paragraph>
            Our Service uses the following third-party services:
          </Typography>
          <List sx={{ ml: 2 }}>
            <ListItem>
              <ListItemText primary="Stripe: Processes payment information. We do not store full credit card details. See Stripe's Privacy Policy for details." />
            </ListItem>
            <ListItem>
              <ListItemText primary="SendGrid: Sends transactional emails (password reset, notifications). Your email address is shared with SendGrid for email delivery." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Microsoft Azure: Hosts our infrastructure and database (Azure Cosmos DB). See Azure's Privacy Statement for details." />
            </ListItem>
          </List>
          <Typography paragraph sx={{ mt: 2 }}>
            These third parties are contractually obligated to use your information only to provide services to us and not to disclose it to unauthorized parties.
          </Typography>
        </>
      )
    },
    {
      title: '8. GDPR Rights (EU Users)',
      content: (
        <>
          <Typography paragraph>
            If you are located in the European Union, you have the following rights under the General Data Protection Regulation (GDPR):
          </Typography>
          <List sx={{ ml: 2 }}>
            <ListItem>
              <ListItemText primary="Right of Access: You can request a copy of all personal data we hold about you." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Right to Rectification: You can request correction of inaccurate data." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Right to Erasure: You can request deletion of your data (subject to legal retention requirements)." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Right to Data Portability: You can request your data in a machine-readable format." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Right to Object: You can object to certain types of data processing." />
            </ListItem>
          </List>
          <Typography paragraph sx={{ mt: 2 }}>
            To exercise these rights, contact us at privacy@solidevbooks.com. We will respond within 30 days.
          </Typography>
        </>
      )
    },
    {
      title: '9. CCPA Rights (California Users)',
      content: (
        <>
          <Typography paragraph>
            If you are located in California, you have rights under the California Consumer Privacy Act (CCPA):
          </Typography>
          <List sx={{ ml: 2 }}>
            <ListItem>
              <ListItemText primary="Right to Know: You can request what personal information we collect." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Right to Delete: You can request deletion of personal information (with exceptions)." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Right to Opt-Out: You can opt-out of the sale or sharing of personal information." />
            </ListItem>
          </List>
          <Typography paragraph sx={{ mt: 2 }}>
            To submit a CCPA request, contact us at privacy@solidevbooks.com.
          </Typography>
        </>
      )
    },
    {
      title: '10. Cookies and Tracking',
      content: (
        <>
          <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
            10.1 Session Cookies
          </Typography>
          <Typography paragraph>
            We use session cookies to maintain your authentication state:
          </Typography>
          <List sx={{ ml: 2 }}>
            <ListItem>
              <ListItemText primary="Purpose: Authentication and session management" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Duration: Session (cleared when you close your browser) or up to 2 hours of inactivity" />
            </ListItem>
          </List>

          <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
            10.2 No Tracking Technologies
          </Typography>
          <Typography paragraph>
            Solidev Books does not use tracking pixels, third-party analytics cookies, or advertisement-related tracking. We are a business workflow tool, not a consumer product.
          </Typography>
        </>
      )
    },
    {
      title: '11. Notifications System',
      content: (
        <>
          <Typography paragraph>
            Solidev Books includes a notifications system that:
          </Typography>
          <List sx={{ ml: 2 }}>
            <ListItem>
              <ListItemText primary="Sends in-app notifications about workflow events, approvals, and important updates" />
            </ListItem>
            <ListItem>
              <ListItemText primary="May send email notifications for critical events (configurable by organization admins)" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Stores notification history in your account (users can clear history)" />
            </ListItem>
          </List>
          <Typography paragraph sx={{ mt: 2 }}>
            Email notifications are sent through SendGrid and subject to SendGrid's privacy practices.
          </Typography>
        </>
      )
    },
    {
      title: '12. Contact Us',
      content: (
        <>
          <Typography paragraph>
            If you have questions about this Privacy Policy or your data, please contact us:
          </Typography>
          <Typography paragraph>
            <strong>Email:</strong> privacy@solidevbooks.com<br />
            <strong>Support:</strong> support@solidevbooks.com<br />
            <strong>Mailing Address:</strong><br />
            Solidev Books Inc.<br />
            San Francisco, CA<br />
            United States
          </Typography>
          <Typography paragraph>
            <strong>Data Protection Officer:</strong> privacy@solidevbooks.com
          </Typography>
        </>
      )
    },
    {
      title: '13. Changes to This Policy',
      content: (
        <>
          <Typography paragraph>
            We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on our website and updating the "Last Updated" date. Your continued use of the Service constitutes your acceptance of the updated Privacy Policy.
          </Typography>
        </>
      )
    }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <SeoHead
        title="Privacy Policy | Solidev Books"
        description="Learn how Solidev Books collects, uses, and protects your data. Read our comprehensive privacy policy covering GDPR, CCPA, and data security."
        canonicalPath="/privacy"
      />
      <Header />

      <Box sx={{ flex: 1, py: { xs: 6, md: 8 }, bgcolor: '#f8fafc' }}>
        <Container maxWidth="md">
          {/* Header */}
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: '2rem', md: '3rem' },
                color: '#0f172a'
              }}
            >
              Privacy Policy
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: '#64748B',
                mb: 3,
                fontSize: { xs: '1rem', md: '1.1rem' }
              }}
            >
              Last Updated: May 6, 2026
            </Typography>
            <Typography
              paragraph
              sx={{
                color: '#475569',
                fontSize: '1.05rem',
                lineHeight: 1.7
              }}
            >
              This Privacy Policy describes how Solidev Books Inc. collects, uses, and protects your information when you use our software-as-a-service (SaaS) platform.
            </Typography>
          </Box>

          {/* Sections */}
          {sections.map((section, index) => (
            <Box key={index} sx={{ mb: 4 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  color: '#0f172a',
                  fontSize: { xs: '1.5rem', md: '1.875rem' }
                }}
              >
                {section.title}
              </Typography>
              <Box sx={{ color: '#475569', lineHeight: 1.8 }}>
                {section.content}
              </Box>
              {index < sections.length - 1 && (
                <Divider sx={{ mt: 4, mb: 2 }} />
              )}
            </Box>
          ))}
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default Privacy;
