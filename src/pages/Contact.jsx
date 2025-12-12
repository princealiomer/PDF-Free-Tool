import React from 'react';
import SEO from '../components/common/SEO';
import { Mail, MessageSquare } from 'lucide-react';

const Contact = () => {
    return (
        <>
            <SEO
                title="Contact Us"
                description="Get in touch with the PDF Tools team. We value your feedback and support inquiries."
            />
            <div className="container" style={{ padding: '4rem 1rem', maxWidth: '800px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Contact Us</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '3rem' }}>
                    Have questions, suggestions, or need support? We're here to help.
                </p>

                <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                    <div style={{
                        padding: '2rem',
                        background: 'var(--bg-card)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                    }}>
                        <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', width: 'fit-content', padding: '1rem', borderRadius: '50%' }}>
                            <Mail size={32} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Email Us</h2>
                        <p style={{ color: 'var(--text-muted)' }}>For general inquiries and support.</p>
                        <a href="mailto:support@pdftools.com" style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.1rem' }}>support@pdftools.com</a>
                    </div>

                    <div style={{
                        padding: '2rem',
                        background: 'var(--bg-card)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                    }}>
                        <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', width: 'fit-content', padding: '1rem', borderRadius: '50%' }}>
                            <MessageSquare size={32} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Social Media</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Follow us for updates and tips.</p>
                        <a href="https://twitter.com/pdftools" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.1rem' }}>@pdftools</a>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Contact;
