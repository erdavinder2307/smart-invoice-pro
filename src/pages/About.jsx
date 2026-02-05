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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          py: { xs: 8, md: 12 }
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant={isMobile ? 'h3' : 'h2'}
              sx={{
                fontWeight: 700,
                mb: 3,
                lineHeight: 1.2,
                color: 'white'
              }}
            >
              About Smart Invoice Pro
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 4,
                color: 'grey.100',
                maxWidth: 800,
                mx: 'auto',
                lineHeight: 1.6
              }}
            >
              Empowering businesses with cutting-edge technology to streamline their 
              invoicing and financial management processes
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Mission Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
              Our Mission
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', lineHeight: 1.7 }}>
              Smart Invoice Pro is built with cutting-edge technologies to deliver a seamless 
              bookkeeping and invoicing experience. Our mission is to help businesses save time, 
              reduce errors, and gain financial clarity through intelligent automation and 
              intuitive design.
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', lineHeight: 1.7 }}>
              We understand that managing finances can be overwhelming for business owners. 
              That's why we've created a platform that combines the power of modern technology 
              with simplicity, making professional-grade financial management accessible to 
              businesses of all sizes.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={4}
              sx={{
                p: 4,
                borderRadius: 4,
                textAlign: 'center',
                background: `linear-gradient(135deg, ${theme.palette.primary.light}20 0%, ${theme.palette.primary.light}40 100%)`
              }}
            >
              <Analytics sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                AI-Powered Insights
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Leverage machine learning to get intelligent recommendations 
                and automated financial insights for your business
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Technology Stack */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
              Built with Modern Technology
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
              Leveraging the best tools and frameworks for optimal performance
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            {technologies.map((tech, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        opacity: 0.1,
                        mx: 'auto',
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                      {tech.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {tech.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Values Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
            Our Core Values
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary' }}>
            The principles that guide everything we do
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          {values.map((value, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  p: 4,
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ mb: 3 }}>
                    {value.icon}
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                    {value.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                    {value.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Team Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
              Meet Our Team
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
              Passionate professionals dedicated to your success
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {team.map((member, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        mx: 'auto',
                        mb: 2,
                        bgcolor: 'primary.main'
                      }}
                    >
                      {member.avatar}
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                      {member.name}
                    </Typography>
                    <Chip
                      label={member.role}
                      sx={{
                        mb: 2,
                        bgcolor: 'primary.light',
                        color: 'primary.dark'
                      }}
                    />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {member.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Paper
          elevation={2}
          sx={{
            p: 6,
            borderRadius: 4,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            color: 'white',
            textAlign: 'center'
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 4, color: 'white' }}>
            Built for the Future
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={4}>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: 'white' }}>
                99.9%
              </Typography>
              <Typography variant="h6" sx={{ color: 'grey.100' }}>
                Uptime Guarantee
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: 'white' }}>
                24/7
              </Typography>
              <Typography variant="h6" sx={{ color: 'grey.100' }}>
                Customer Support
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: 'white' }}>
                100%
              </Typography>
              <Typography variant="h6" sx={{ color: 'grey.100' }}>
                Data Security
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
};

export default About;
