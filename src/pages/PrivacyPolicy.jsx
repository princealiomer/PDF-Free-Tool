import React from 'react';
import SEO from '../components/common/SEO';

const PrivacyPolicy = () => {
    return (
        <>
            <SEO
                title="Privacy Policy"
                description="Privacy Policy for PDF Tools. Learn how we handle your data and ensure your document security."
            />
            <div className="container" style={{ padding: '4rem 1rem', maxWidth: '800px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>Privacy Policy</h1>

                <div style={{ color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <p>Last updated: {new Date().toLocaleDateString()}</p>

                    <section>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>1. Introduction</h2>
                        <p>Welcome to PDF Tools. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your data when you visit our website via your browser and tell you about your privacy rights and how the law protects you.</p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>2. Data Processing</h2>
                        <p><strong>Client-Side Processing:</strong> Our core value proposition is security. The majority of our PDF tools operate entirely client-side. This means your files are processed directly in your web browser and are NOT uploaded to our servers. We do not view, store, or copy your documents.</p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>3. Analytics</h2>
                        <p>We may use anonymous analytics tools to understand how users interact with our website to improve usability. No personally identifiable information is collected through these analytics.</p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>4. Contact Us</h2>
                        <p>If you have any questions about this privacy policy or our privacy practices, please contact us via our Contact page.</p>
                    </section>
                </div>
            </div>
        </>
    );
};

export default PrivacyPolicy;
