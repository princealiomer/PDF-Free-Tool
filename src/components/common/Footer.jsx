import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', padding: '3rem 0', marginTop: 'auto' }}>
            <div className="container" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <p style={{ fontWeight: 500, marginBottom: '0.5rem' }}>© {new Date().getFullYear()} PDF Tools</p>
                <p style={{ fontSize: '0.875rem' }}>Secure, client-side PDF processing. Your files never leave your device.</p>
                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    Developed by <a href="https://www.facebook.com/omerthelinkbuilder" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: '600' }}>Omer Y.</a>
                </p>
                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '2rem', fontSize: '0.875rem' }}>
                    <Link to="/privacy-policy">Privacy Policy</Link>
                    <Link to="/terms-of-service">Terms of Service</Link>
                    <Link to="/contact">Contact</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
