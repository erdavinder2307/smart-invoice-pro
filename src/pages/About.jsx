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
    {
      name: 'ReactJS',
      color: '#61dafb',
      description: 'Modern frontend framework',
      icon: (
        <svg viewBox="0 0 24 24" width="36" height="36" fill="#61dafb">
          <path d="M12 9.861A2.139 2.139 0 1 0 12 14.139 2.139 2.139 0 1 0 12 9.861zM6.008 16.255l-.472-.12C2.018 15.246 0 13.737 0 11.996s2.018-3.25 5.536-4.139l.472-.119.133.468a23.53 23.53 0 0 0 1.363 3.578l.101.213-.101.213a23.307 23.307 0 0 0-1.363 3.578l-.133.467zM5.317 8.95c-2.674.751-4.315 1.9-4.315 3.046 0 1.145 1.641 2.294 4.315 3.046a24.95 24.95 0 0 1 1.182-3.046A24.752 24.752 0 0 1 5.317 8.95zM17.992 16.255l-.133-.469a23.357 23.357 0 0 0-1.364-3.577l-.101-.213.101-.213a23.42 23.42 0 0 0 1.364-3.578l.133-.468.473.119c3.517.889 5.535 2.398 5.535 4.14s-2.018 3.25-5.535 4.139l-.473.12zm-.491-4.259c.48 1.039.877 2.06 1.182 3.046 2.675-.752 4.315-1.901 4.315-3.046 0-1.146-1.641-2.294-4.315-3.046a24.788 24.788 0 0 1-1.182 3.046zM5.31 8.945l-.133-.467C4.188 5.008 4.488 2.744 6 1.87c1.483-.861 3.574.037 5.64 2.271l.34.368-.368.34a23.582 23.582 0 0 0-2.62 3.182l-.135.207-.247.023a23.787 23.787 0 0 0-3.778.635l-.522.069zm1.43-5.683c-.465 0-.876.102-1.218.306-1.01.587-1.275 2.433-.784 5.082a24.66 24.66 0 0 1 3.232-.544 24.7 24.7 0 0 1 2.248-2.72c-1.33-1.45-2.583-2.124-3.478-2.124zM18.69 8.945l-.522-.07a23.786 23.786 0 0 0-3.778-.635l-.247-.023-.135-.207a23.622 23.622 0 0 0-2.62-3.182l-.368-.34.34-.368C13.974 1.907 16.065 1.01 17.548 1.87c1.512.874 1.812 3.138.823 6.608l-.133.467zm-4.483-1.378a24.7 24.7 0 0 1 3.232.544c.491-2.649.226-4.495-.784-5.082-.88-.51-2.167.094-3.496 1.818a24.58 24.58 0 0 1 2.248 2.72zM12 21.658c-1.048 0-2.088-.316-3.108-.949l-.34-.368.368-.34a23.582 23.582 0 0 0 2.62-3.182l.135-.207.247-.023a23.787 23.787 0 0 0 3.778-.635l.522-.069.133.467c.989 3.47.689 5.734-.823 6.608-.51.295-1.076.698-1.532.698zm-2.248-1.43c1.33 1.45 2.583 2.124 3.478 2.124.465 0 .876-.102 1.218-.306 1.01-.587 1.275-2.433.784-5.082a24.66 24.66 0 0 1-3.232.544 24.7 24.7 0 0 1-2.248 2.72zm5.756-1.43l-.133-.467c-.305-.986-.702-2.007-1.182-3.046a24.788 24.788 0 0 1-3.232.544 24.7 24.7 0 0 1-2.248 2.72c1.33 1.45 2.583 2.124 3.478 2.124.465 0 .876-.102 1.218-.306 1.01-.587 1.275-2.433.784-5.082z" />
        </svg>
      )
    },
    {
      name: 'Material UI',
      color: '#0081cb',
      description: 'Elegant component library',
      icon: (
        <svg viewBox="0 0 24 24" width="36" height="36" fill="#0081cb">
          <path d="M8 16.57L1 12.46V4.23L8 8.34V16.57ZM9 8.34L16 4.23V12.46L9 16.57V8.34ZM16.5 13.26L23 9.34V17.57L16.5 21.46V13.26ZM8.5 17.67L15.5 13.56V21.79L8.5 25.9V17.67Z" transform="scale(0.85) translate(1, -1)" />
          <path d="M1 4.23L8 0.12L15 4.23L8 8.34L1 4.23Z" transform="scale(0.85) translate(1, -1)" />
          <path d="M16 4.23L23 0.12L23 8.34L16 12.46L16 4.23Z" transform="scale(0.85) translate(1, -1)" />
        </svg>
      )
    },
    {
      name: 'Flask',
      color: '#333333',
      description: 'Lightweight Python backend',
      icon: (
        <svg viewBox="0 0 24 24" width="36" height="36" fill="#333333">
          <path d="M10.168 0v6.674L5.146 16.5C4.398 17.94 4 19.5 4 21c0 1.657 1.343 3 3 3h10c1.657 0 3-1.343 3-3 0-1.5-.398-3.06-1.146-4.5L13.832 6.674V0h-3.664zm1.832 1.5h.5v5.5l5.25 10.5c.6 1.2.918 2.5.918 3.5 0 .828-.672 1.5-1.5 1.5H7c-.828 0-1.5-.672-1.5-1.5 0-1 .318-2.3.918-3.5L11.5 7V1.5h.5zM9 14.5c0 .828.672 1.5 1.5 1.5S12 15.328 12 14.5 11.328 13 10.5 13 9 13.672 9 14.5zm4 2.5c0 .552.448 1 1 1s1-.448 1-1-.448-1-1-1-1 .448-1 1z" />
        </svg>
      )
    },
    {
      name: 'Azure Cosmos DB',
      color: '#0078d4',
      description: 'Globally distributed database',
      icon: (
        <svg viewBox="0 0 24 24" width="36" height="36" fill="#0078d4">
          <path d="M12 2C6.48 2 2 4.69 2 8v8c0 3.31 4.48 6 10 6s10-2.69 10-6V8c0-3.31-4.48-6-10-6zm0 2c4.97 0 8 2.24 8 4s-3.03 4-8 4-8-2.24-8-4 3.03-4 8-4zm0 14c-4.97 0-8-2.24-8-4v-2.22C5.56 13.13 8.58 14 12 14s6.44-.87 8-2.22V16c0 1.76-3.03 4-8 4zm0-6c-4.97 0-8-2.24-8-4v-2.22C5.56 7.13 8.58 8 12 8s6.44-.87 8-2.22V12c0 1.76-3.03 4-8 4z" />
        </svg>
      )
    },
    {
      name: 'Azure Cloud',
      color: '#0078d4',
      description: 'Enterprise-grade hosting',
      icon: (
        <svg viewBox="0 0 24 24" width="36" height="36" fill="#0078d4">
          <path d="M13.5 2C10.46 2 7.9 3.93 6.92 6.62 4.17 6.97 2 9.24 2 12c0 3.31 2.69 6 6 6h9.5c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96C17.08 5.16 15.45 2 13.5 2zm0 2c1.4 0 2.64.81 3.24 2.06l.42.94.97-.28c.28-.08.57-.12.87-.12 1.65 0 3 1.35 3 3s-1.35 3-3 3H8c-2.21 0-4-1.79-4-4 0-2.05 1.55-3.76 3.57-3.97l.87-.09.28-.83C9.31 4.78 11.3 4 13.5 4z" />
        </svg>
      )
    },
    {
      name: 'REST APIs',
      color: '#e91e63',
      description: 'Seamless data integration',
      icon: (
        <svg viewBox="0 0 24 24" width="36" height="36" fill="#e91e63">
          <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
          <path d="M20 2H4C2.9 2 2 2.9 2 4v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H4V4h16v16z" />
        </svg>
      )
    },
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
      description: 'From freelancers to large enterprises, our platform grows with your business. Built on modern cloud architecture, Solidev Books can handle your expanding needs without compromising performance.'
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
                letterSpacing: '-0.02em',
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' }
              }}
            >
              About Solidev Books
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
            <Box component={motion.div} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} sx={{ px: { xs: 1, md: 0 } }}>
              <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 1.5 }}>
                OUR MISSION
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 3, color: 'text.primary', mt: 1 }}>
                Simplifying Business Finance
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary', lineHeight: 1.8, fontSize: '1.1rem' }}>
                Solidev Books is built with cutting-edge technologies to deliver a seamless
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
            justifyContent="center"
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
                          width: 72,
                          height: 72,
                          borderRadius: 3,
                          bgcolor: `${tech.color}15`,
                          mx: 'auto',
                          mb: 3,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {tech.icon}
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
                    <Box sx={{ background: 'linear-gradient(135deg, #2563EB 0%, #1e3a8a 100%)', height: 80, mb: -5 }} />
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
                          bgcolor: 'primary.main',
                          color: 'white',
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
