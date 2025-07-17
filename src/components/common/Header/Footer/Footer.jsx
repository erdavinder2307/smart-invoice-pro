import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <p>&copy; {new Date().getFullYear()} Smart Invoice Pro. All rights reserved.</p>
            <p>
                <a href="/terms">Terms of Service</a> | <a href="/privacy">Privacy Policy</a>
            </p>
        </footer>
    );
};

export default Footer;
