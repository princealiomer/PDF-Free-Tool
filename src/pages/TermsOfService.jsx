import React from 'react';
import SEO from '../components/common/SEO';

const TermsOfService = () => {
    return (
        <>
            <SEO
                title="Terms of Service"
                description="Terms of Service for using PDF Tools. Read our usage guidelines and limitations."
            />
            <div className="container" style={{ padding: '4rem 1rem', maxWidth: '800px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>Terms of Service</h1>

                <div style={{ color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <p>Last updated: {new Date().toLocaleDateString()}</p>

                    <section>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>1. Acceptance of Terms</h2>
                        <p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.</p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>2. Use License</h2>
                        <p>Permission is granted to temporarily use the materials (software) on PDF Tools' website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.</p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>3. Disclaimer</h2>
                        <p>The materials on PDF Tools' website are provided on an 'as is' basis. PDF Tools makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>4. Limitations</h2>
                        <p>In no event shall PDF Tools or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on PDF Tools' website.</p>
                    </section>
                </div>
            </div>
        </>
    );
};

export default TermsOfService;
