import React from 'react';
import { Box, Container, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import SeoHead from '../seo/SeoHead';

const Terms = () => {
  const sections = [
    {
      title: '1. Agreement to Terms',
      content: (
        <>
          <Typography paragraph>
            By accessing and using Solidev Books ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to abide by the above, please do not use this service.
          </Typography>
          <Typography paragraph>
            These Terms apply to all users of the Service, including but not limited to users who are browsers, vendors, customers, merchants, and/or contributors of content.
          </Typography>
        </>
      )
    },
    {
      title: '2. Use License',
      content: (
        <>
          <Typography paragraph>
            Permission is granted to temporarily download one copy of the materials (information or software) on Solidev Books for personal, non-commercial transactional use only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </Typography>
          <List sx={{ ml: 2 }}>
            <ListItem>
              <ListItemText primary="Modify or copy the materials" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Use the materials for any commercial purpose or for any public display (commercial or non-commercial)" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Attempt to decompile or reverse engineer any software contained on the Service" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Remove any copyright or other proprietary notations from the materials" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Transfer the materials to another person or 'mirror' the materials on any other server" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Service" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Rent, lease, loan, sell, assign, or otherwise transfer your rights to use the Service" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Violate any applicable laws or regulations" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Attempt unauthorized access to the Service or related systems" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Attempt to probe, scan, or test the vulnerability of the Service or related systems" />
            </ListItem>
          </List>
        </>
      )
    },
    {
      title: '3. Acceptable Use Policy',
      content: (
        <>
          <Typography paragraph>
            You agree not to use the Service:
          </Typography>
          <List sx={{ ml: 2 }}>
            <ListItem>
              <ListItemText primary="For any illegal or unauthorized purpose" />
            </ListItem>
            <ListItem>
              <ListItemText primary="To transmit obscene or offensive content" />
            </ListItem>
            <ListItem>
              <ListItemText primary="To disrupt the normal flow of dialogue within Solidev Books" />
            </ListItem>
            <ListItem>
              <ListItemText primary="To harass or cause distress or inconvenience to any person" />
            </ListItem>
            <ListItem>
              <ListItemText primary="To impersonate or pretend to be anyone or anything" />
            </ListItem>
            <ListItem>
              <ListItemText primary="To insert your own or third-party advertising, promotion, or solicitation" />
            </ListItem>
            <ListItem>
              <ListItemText primary="To create false or misleading information" />
            </ListItem>
          </List>
        </>
      )
    },
    {
      title: '4. Disclaimer of Warranties',
      content: (
        <>
          <Typography paragraph>
            The materials on Solidev Books are provided on an 'as-is' basis. Solidev Books makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </Typography>
          <Typography paragraph>
            Further, Solidev Books does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.
          </Typography>
        </>
      )
    },
    {
      title: '5. Limitations of Liability',
      content: (
        <>
          <Typography paragraph>
            In no event shall Solidev Books or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Solidev Books, even if Solidev Books or an authorized representative has been notified orally or in writing of the possibility of such damage.
          </Typography>
          <Typography paragraph>
            In particular, Solidev Books shall not be liable for:
          </Typography>
          <List sx={{ ml: 2 }}>
            <ListItem>
              <ListItemText primary="Loss of profits or revenue" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Loss of business or contracts" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Loss of anticipated savings" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Loss of data" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Any indirect, incidental, special, or consequential damages" />
            </ListItem>
          </List>
          <Typography paragraph sx={{ mt: 2 }}>
            Some jurisdictions do not allow the limitation or exclusion of liability for incidental or consequential damages, so some of the above limitations may not apply to you.
          </Typography>
        </>
      )
    },
    {
      title: '6. Service Availability',
      content: (
        <>
          <Typography paragraph>
            Solidev Books is provided on an "as available" basis. We do not guarantee:
          </Typography>
          <List sx={{ ml: 2 }}>
            <ListItem>
              <ListItemText primary="Uninterrupted or error-free access" />
            </ListItem>
            <ListItem>
              <ListItemText primary="99.9% uptime or any specific uptime guarantee" />
            </ListItem>
            <ListItem>
              <ListItemText primary="That defects will be corrected" />
            </ListItem>
            <ListItem>
              <ListItemText primary="That the Service is free of viruses or harmful components" />
            </ListItem>
          </List>
          <Typography paragraph sx={{ mt: 2 }}>
            We may perform maintenance or updates that temporarily interrupt Service. We will attempt to provide advance notice of planned maintenance.
          </Typography>
        </>
      )
    },
    {
      title: '7. Accuracy of Materials',
      content: (
        <>
          <Typography paragraph>
            The materials appearing on Solidev Books could include technical, typographical, or photographic errors. Solidev Books does not warrant that any of the materials on this website are accurate, complete, or current. Solidev Books may make changes to the materials contained on its website at any time without notice.
          </Typography>
        </>
      )
    },
    {
      title: '8. Materials License',
      content: (
        <>
          <Typography paragraph>
            Solidev Books grants you a limited license to access and use the Service for your organization's legitimate business purposes. This license is:
          </Typography>
          <List sx={{ ml: 2 }}>
            <ListItem>
              <ListItemText primary="Non-exclusive" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Non-transferable" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Revocable" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Subject to termination if you violate these Terms" />
            </ListItem>
          </List>
        </>
      )
    },
    {
      title: '9. Intellectual Property Rights',
      content: (
        <>
          <Typography paragraph>
            All content included as part of the Service, such as text, graphics, logos, images, as well as the compilation thereof, and any software used on the website, is the property of Solidev Books or its content suppliers and is protected by international copyright laws.
          </Typography>
          <Typography paragraph>
            You retain all rights to any data or content you provide to Solidev Books ("Your Content"). You grant Solidev Books a license to use Your Content solely to provide the Service and to improve the Service.
          </Typography>
          <Typography paragraph>
            You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the Service without express written permission by Solidev Books.
          </Typography>
        </>
      )
    },
    {
      title: '10. Links',
      content: (
        <>
          <Typography paragraph>
            Solidev Books has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Solidev Books of the site. Use of any such linked website is at the user's own risk.
          </Typography>
          <Typography paragraph>
            If you have concerns about external links, please contact support@solidevbooks.com.
          </Typography>
        </>
      )
    },
    {
      title: '11. Modifications of Terms',
      content: (
        <>
          <Typography paragraph>
            Solidev Books may revise these Terms of Service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these Terms of Service.
          </Typography>
          <Typography paragraph>
            We will post changes to these Terms on this page. If the changes are material, we will provide at least 30 days' notice before the changes take effect.
          </Typography>
        </>
      )
    },
    {
      title: '12. Governing Law',
      content: (
        <>
          <Typography paragraph>
            These Terms and Conditions are governed by and construed in accordance with the laws of the State of California, and you irrevocably submit to the exclusive jurisdiction of the courts located in California.
          </Typography>
        </>
      )
    },
    {
      title: '13. Subscription and Billing',
      content: (
        <>
          <Typography paragraph>
            If you subscribe to a paid plan:
          </Typography>
          <List sx={{ ml: 2 }}>
            <ListItem>
              <ListItemText primary="Billing occurs according to your subscription plan (monthly, annual, etc.)" />
            </ListItem>
            <ListItem>
              <ListItemText primary="You authorize us to charge your payment method on a recurring basis" />
            </ListItem>
            <ListItem>
              <ListItemText primary="You agree to keep your payment information current and accurate" />
            </ListItem>
            <ListItem>
              <ListItemText primary="If a payment fails, you remain responsible for any charges incurred" />
            </ListItem>
            <ListItem>
              <ListItemText primary="You may cancel your subscription at any time" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Refunds are not provided for partial months or unused portions of paid subscriptions" />
            </ListItem>
          </List>
        </>
      )
    },
    {
      title: '14. Termination',
      content: (
        <>
          <Typography paragraph>
            We may terminate or suspend your account and right to use the Service immediately, without prior notice or liability, for any reason whatsoever, including if you breach the Terms.
          </Typography>
          <Typography paragraph>
            Upon termination:
          </Typography>
          <List sx={{ ml: 2 }}>
            <ListItem>
              <ListItemText primary="Your right to access the Service ceases immediately" />
            </ListItem>
            <ListItem>
              <ListItemText primary="You may request export of your data within 30 days" />
            </ListItem>
            <ListItem>
              <ListItemText primary="After the export period, data will be deleted per our retention policy" />
            </ListItem>
          </List>
        </>
      )
    },
    {
      title: '15. Contact',
      content: (
        <>
          <Typography paragraph>
            If you have any questions about these Terms, please contact:
          </Typography>
          <Typography paragraph>
            <strong>Email:</strong> support@solidevbooks.com<br />
            <strong>Mailing Address:</strong><br />
            Solidev Books Inc.<br />
            San Francisco, CA<br />
            United States
          </Typography>
        </>
      )
    }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <SeoHead
        title="Terms of Service | Solidev Books"
        description="Read the Terms of Service for Solidev Books. Understand the rules, acceptable use, and legal terms for using our invoicing and financial management platform."
        canonicalPath="/terms"
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
              Terms of Service
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
              Please read these Terms of Service carefully before using Solidev Books. By accessing and using Solidev Books, you acknowledge that you have read, understood, and agree to be bound by all the terms.
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

export default Terms;
