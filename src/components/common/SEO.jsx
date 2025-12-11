import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const routeTitles = {
    '/': 'PDF Tools - All-in-One PDF Solution',
    '/merge-pdf': 'Merge PDF - Combine PDF Files Online',
    '/split-pdf': 'Split PDF - Separate Files Online',
    '/remove-pages': 'Remove Pages - Delete PDF Pages',
    '/extract-pages': 'Extract Pages - Select PDF Pages',
    '/organize-pdf': 'Organize PDF - Sort and Reorder Pages',
    '/protect-pdf': 'Protect PDF - Encrypt with Password',
    '/unlock-pdf': 'Unlock PDF - Remove Password Security',
    '/rotate-pdf': 'Rotate PDF - Rotate Pages Permanently',
    '/page-numbers': 'Page Numbers - Add Page Numbers to PDF',
    '/watermark': 'Watermark PDF - Add Text Stamp',
    '/jpg-to-pdf': 'JPG to PDF - Convert Images to Documents',
    '/pdf-to-jpg': 'PDF to JPG - Extract Images from PDF',
    '/compress-pdf': 'Compress PDF - Reduce File Size',
    '/scan-pdf': 'Scan to PDF - Camera Capture',
    '/sign-pdf': 'Sign PDF - Digital Signature',
    '/repair-pdf': 'Repair PDF - Fix Corrupted Files',
    '/redact-pdf': 'Redact PDF - Hide Sensitive Info',
    '/html-to-pdf': 'HTML to PDF - Convert Webpages',
    '/compare-pdf': 'Compare PDF - Side by Side View',
    '/text-to-pdf': 'Text to PDF - Convert Text Files'
};

const SEO = () => {
    const location = useLocation();

    useEffect(() => {
        const title = routeTitles[location.pathname] || 'PDF Tools - Free Online Utilities';
        document.title = title;

        // Basic meta description update (optional, might not work for crawlers without SSR but good for history/tabs)
        // const metaDesc = document.querySelector('meta[name="description"]');
        // if (metaDesc) {
        //     metaDesc.setAttribute('content', "Free and secure online PDF tools...");
        // }
    }, [location]);

    return null;
};

export default SEO;
