import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Avatar,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Speed,
  Security,
  TrendingUp,
  Code,
  Cloud,
  Analytics,
  Lightbulb
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';

const About = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const technologies = [
    { name: 'ReactJS', color: '#61dafb', description: 'Modern frontend framework' },
    { name: 'Material UI', color: '#0081cb', description: 'Elegant component library' },
    { name: 'Flask', color: '#000000', description: 'Lightweight Python backend' },
    { name: 'Azure Cosmos DB', color: '#0078d4', description: 'Globally distributed database' },
    { name: 'Azure Cloud', color: '#0078d4', description: 'Enterprise-grade hosting' },
    { name: 'REST APIs', color: '#ff6b6b', description: 'Seamless data integration' }
  ];

  const values = [
    {
      icon: <Speed sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Simplicity',
      description: 'We believe in making complex business processes simple and intuitive. Our platform is designed with user experience at the forefront, ensuring that even non-technical users can navigate and utilize all features effortlessly.'
    },
    {
      icon: <Security sx={{ fontSize: 48, color: 'secondary.main' }} />,
      title: 'Security',
      description: 'Your business data is precious, and we treat it as such. With enterprise-grade encryption, secure cloud infrastructure, and regular security audits, we ensure your information is always protected.'
    },
    {
      icon: <TrendingUp sx={{ fontSize: 48, color: 'warning.main' }} />,
      title: 'Scalability',
      description: 'From freelancers to large enterprises, our platform grows with your business. Built on modern cloud architecture, Smart Invoice Pro can handle your expanding needs without compromising performance.'
    }
  ];

  const team = [
    {
      name: 'Development Team',
      role: 'Full-Stack Engineers',
      avatar: <Code sx={{ fontSize: 40 }} />,
      description: 'Expert developers with years of experience in modern web technologies'
    },
    {
      name: 'Design Team',
      role: 'UX/UI Specialists',
      avatar: <Lightbulb sx={{ fontSize: 40 }} />,
      description: 'Creative minds focused on delivering exceptional user experiences'
    },
    {
      name: 'DevOps Team',
      role: 'Infrastructure Engineers',
      avatar: <Cloud sx={{ fontSize: 40 }} />,
      description: 'Ensuring reliable, scalable, and secure cloud infrastructure'
    }
  ];

  // Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    },
    hover: {
      y: -8,
      boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
      transition: { duration: 0.3 }
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', overflowX: 'hidden' }}>
      <Header />

      {/* Hero Section */}
      <Box
        component={motion.div}
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        sx={{
          background: 'linear-gradient(135deg, #0a0e27 0%, #1e3a8a 50%, #0f172a 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <Typography
              component={motion.h2}
              variants={fadeInUp}
              variant={isMobile ? 'h3' : 'h2'}
              sx={{
                fontWeight: 800,
                mb: 3,
                lineHeight: 1.2,
                color: 'white',
                letterSpacing: '-0.02em'
              }}
            >
              About Smart Invoice Pro
            </Typography>
            <Typography
              component={motion.p}
              variants={fadeInUp}
              variant="h6"
              sx={{
                mb: 4,
                color: 'rgba(255,255,255,0.9)',
                maxWidth: 800,
                mx: 'auto',
                lineHeight: 1.6,
                fontWeight: 400
              }}
            >
              Empowering businesses with cutting-edge technology to streamline their
              invoicing and financial management processes
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Mission Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Grid container spacing={8} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box component={motion.div} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
              <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 1.5 }}>
                OUR MISSION
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 3, color: 'text.primary', mt: 1 }}>
                Simplifying Business Finance
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary', lineHeight: 1.8, fontSize: '1.1rem' }}>
                Smart Invoice Pro is built with cutting-edge technologies to deliver a seamless
                bookkeeping and invoicing experience. Our mission is to help businesses save time,
                reduce errors, and gain financial clarity through intelligent automation and
                intuitive design.
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, fontSize: '1.1rem' }}>
                We understand that managing finances can be overwhelming for business owners.
                That's why we've created a platform that combines the power of modern technology
                with simplicity, making professional-grade financial management accessible to
                businesses of all sizes.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              component={motion.div}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 6,
                  borderRadius: 6,
                  textAlign: 'center',
                  background: `linear-gradient(135deg, ${theme.palette.primary.light}15 0%, ${theme.palette.primary.light}30 100%)`,
                  border: `1px solid ${theme.palette.primary.light}40`,
                  backdropFilter: 'blur(20px)'
                }}
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                >
                  <Analytics sx={{ fontSize: 90, color: 'primary.main', mb: 3 }} />
                </motion.div>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
                  AI-Powered Insights
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                  Leverage machine learning to get intelligent recommendations
                  and automated financial insights for your business.
                </Typography>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Technology Stack */}
      <Box sx={{ bgcolor: 'grey.50', py: 10 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }} component={motion.div} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
              Built with Modern Technology
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
              We utilize a robust stack to ensure speed, security, and scalability
            </Typography>
          </Box>

          <Grid
            container
            spacing={3}
            component={motion.div}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {technologies.map((tech, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div variants={cardVariants} whileHover="hover">
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      border: '1px solid',
                      borderColor: 'grey.200',
                      borderRadius: 4,
                      bgcolor: 'background.paper',
                      overflow: 'visible'
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 4 }}>
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: 3,
                          bgcolor: `${tech.color}15`,
                          color: tech.color,
                          mx: 'auto',
                          mb: 3,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Box sx={{ width: 32, height: 32, borderRadius: '50%', border: `3px solid ${tech.color}` }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                        {tech.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {tech.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Values Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }} component={motion.div} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
          <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 700, letterSpacing: 1.5 }}>
            WHY CHOOSE US
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'text.primary', mt: 1 }}>
            Our Core Values
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary' }}>
            The principles that guide every feature we build
          </Typography>
        </Box>

        <Grid
          container
          spacing={4}
          component={motion.div}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {values.map((value, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div variants={cardVariants} whileHover="hover" style={{ height: '100%' }}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    p: 2,
                    textAlign: 'center',
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: 'grey.100',
                    background: 'linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)'
                  }}
                >
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                    <Box sx={{ mb: 3, p: 2, borderRadius: '50%', bgcolor: 'background.paper', boxShadow: '0 8px 16px rgba(0,0,0,0.05)' }}>
                      {value.icon}
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
                      {value.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                      {value.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Team Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 10 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }} component={motion.div} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
              Meet Our Team
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
              Passionate professionals dedicated to your success
            </Typography>
          </Box>

          <Grid
            container
            spacing={4}
            component={motion.div}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {team.map((member, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div variants={cardVariants} whileHover="hover">
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      textAlign: 'center',
                      borderRadius: 4,
                      border: '1px solid',
                      borderColor: 'grey.200',
                      overflow: 'hidden'
                    }}
                  >
                    <Box sx={{ p: 4, bgcolor: 'primary.main', opacity: 0.03, height: 100, mb: -7 }} />
                    <CardContent sx={{ position: 'relative', px: 4, pb: 4 }}>
                      <Avatar
                        component={motion.div}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        sx={{
                          width: 100,
                          height: 100,
                          mx: 'auto',
                          mb: 3,
                          bgcolor: 'white',
                          color: 'primary.main',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                          border: `4px solid white`
                        }}
                      >
                        {member.avatar}
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                        {member.name}
                      </Typography>
                      <Chip
                        label={member.role}
                        size="small"
                        sx={{
                          mb: 3,
                          bgcolor: 'primary.light',
                          color: 'primary.dark',
                          fontWeight: 600,
                          borderRadius: 2
                        }}
                      />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {member.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box
          component={motion.div}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <Paper
            elevation={4}
            sx={{
              p: { xs: 6, md: 8 },
              borderRadius: 6,
              background: 'linear-gradient(135deg, #0a0e27 0%, #1e3a8a 50%, #0f172a 100%)',
              color: 'white',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Background Decoration */}
            <Box sx={{ position: 'absolute', top: -50, left: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
            <Box sx={{ position: 'absolute', bottom: -30, right: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

            <Typography variant="h3" sx={{ fontWeight: 700, mb: 6, color: 'white' }}>
              Built for the Future
            </Typography>
            <Grid container spacing={6} justifyContent="center">
              <Grid item xs={12} sm={4}>
                <Typography variant="h2" sx={{ fontWeight: 800, mb: 1, color: '#61dafb' }}>
                  99.9%
                </Typography>
                <Typography variant="h6" sx={{ color: 'grey.300', fontWeight: 500 }}>
                  Uptime Guarantee
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="h2" sx={{ fontWeight: 800, mb: 1, color: '#61dafb' }}>
                  24/7
                </Typography>
                <Typography variant="h6" sx={{ color: 'grey.300', fontWeight: 500 }}>
                  Customer Support
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="h2" sx={{ fontWeight: 800, mb: 1, color: '#61dafb' }}>
                  100%
                </Typography>
                <Typography variant="h6" sx={{ color: 'grey.300', fontWeight: 500 }}>
                  Data Security
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
};

export default About;
