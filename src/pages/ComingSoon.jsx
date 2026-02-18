import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button } from '@mui/material';
import { Construction, Home as HomeIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';

const ComingSoon = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Get page title from route state, or extract from pathname
    const getPageTitle = () => {
        if (location.state?.title) {
            return location.state.title;
        }

        // Map pathname to title
        const titleMap = {
            '/api-docs': 'API Documentation',
            '/support': 'Support',
            '/privacy': 'Privacy Policy',
            '/terms': 'Terms of Service',
            '/cookies': 'Cookie Policy',
            '/pricing': 'Pricing'
        };

        return titleMap[location.pathname] || 'Coming Soon';
    };

    const pageTitle = getPageTitle();

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: 'easeOut' }
        }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.1
            }
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />

            <Box
                component={motion.div}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                sx={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #0a0e27 0%, #1e3a8a 50%, #0f172a 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    py: { xs: 8, md: 12 },
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Background decoration */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: '10%',
                        right: '-5%',
                        width: '400px',
                        height: '400px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(30,58,138,0.3) 0%, transparent 70%)',
                        filter: 'blur(60px)',
                        pointerEvents: 'none'
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: '10%',
                        left: '-5%',
                        width: '350px',
                        height: '350px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)',
                        filter: 'blur(60px)',
                        pointerEvents: 'none'
                    }}
                />

                <Container maxWidth="md">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        style={{ textAlign: 'center' }}
                    >
                        {/* Icon */}
                        <motion.div variants={fadeInUp}>
                            <Box
                                sx={{
                                    display: 'inline-flex',
                                    p: 3,
                                    borderRadius: '50%',
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    backdropFilter: 'blur(10px)',
                                    mb: 4
                                }}
                            >
                                <Construction sx={{ fontSize: { xs: 60, md: 80 }, color: 'primary.main' }} />
                            </Box>
                        </motion.div>

                        {/* Page Title */}
                        <motion.div variants={fadeInUp}>
                            <Typography
                                variant="h2"
                                sx={{
                                    fontWeight: 700,
                                    mb: 2,
                                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                                    lineHeight: 1.2
                                }}
                            >
                                {pageTitle}
                            </Typography>
                        </motion.div>

                        {/* Coming Soon Message */}
                        <motion.div variants={fadeInUp}>
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 600,
                                    mb: 3,
                                    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                                    color: 'primary.light'
                                }}
                            >
                                Coming Soon
                            </Typography>
                        </motion.div>

                        {/* Description */}
                        <motion.div variants={fadeInUp}>
                            <Typography
                                variant="h6"
                                sx={{
                                    mb: 5,
                                    opacity: 0.9,
                                    lineHeight: 1.6,
                                    maxWidth: '600px',
                                    mx: 'auto',
                                    fontSize: { xs: '1rem', sm: '1.1rem' }
                                }}
                            >
                                We're working hard to bring you this feature. Stay tuned for updates as we continue to enhance Smart Invoice Pro with new capabilities.
                            </Typography>
                        </motion.div>

                        {/* CTA Button */}
                        <motion.div variants={fadeInUp}>
                            <Button
                                component={motion.button}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                variant="contained"
                                size="large"
                                startIcon={<HomeIcon />}
                                onClick={() => navigate('/')}
                                sx={{
                                    bgcolor: 'white',
                                    color: 'primary.main',
                                    px: 4,
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                                    '&:hover': {
                                        bgcolor: 'grey.50',
                                        boxShadow: '0 12px 32px rgba(0,0,0,0.3)'
                                    }
                                }}
                            >
                                Back to Home
                            </Button>
                        </motion.div>
                    </motion.div>
                </Container>
            </Box>

            <Footer />
        </Box>
    );
};

export default ComingSoon;
