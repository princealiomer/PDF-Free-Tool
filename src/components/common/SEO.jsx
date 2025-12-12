import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SEO = ({
    title,
    description,
    keywords,
    canonicalUrl,
    canonicalUrl,
    schema,
    children
}) => {
    const location = useLocation();
    const siteUrl = 'https://pdftools.com'; // Replace with actual domain
    const currentUrl = canonicalUrl || `${siteUrl}${location.pathname}`;

    const defaultTitle = 'PDF Tools - Free Online PDF Utilities';
    const defaultDescription = 'Free and secure online PDF tools. Merge, split, compress, and edit PDF files directly in your browser without uploading to a server.';
    const defaultKeywords = 'pdf tools, merge pdf, split pdf, compress pdf, free pdf editor, online pdf converter';

    const fullTitle = title ? `${title} | PDF Tools` : defaultTitle;

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="title" content={fullTitle} />
            <meta name="description" content={description || defaultDescription} />
            <meta name="keywords" content={keywords || defaultKeywords} />

            {/* Canonical URL */}
            <link rel="canonical" href={currentUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description || defaultDescription} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={currentUrl} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={description || defaultDescription} />

            {/* Structured Data */}
            {schema && (
                <script type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            )}

            {/* Custom Children */}
            {children}

        </Helmet>
    );
};

export default SEO;
