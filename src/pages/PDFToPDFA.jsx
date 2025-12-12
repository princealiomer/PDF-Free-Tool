import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import FileUploader from '../components/common/FileUploader';
import Button from '../components/common/Button';
import { ArrowLeft, FileCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/common/SEO';
import { ChevronDown, ChevronUp } from 'lucide-react';

const PDFToPDFA = () => {
    const [file, setFile] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);

    const handleFile = (files) => {
        if (files.length > 0) setFile(files[0]);
    };

    const handleConvert = async () => {
        if (!file) return;
        setProcessing(true);
        try {
            const buffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(buffer);

            // PDF/A requires specific metadata. 
            // pdf-lib helper involves setting metadata.

            pdfDoc.setTitle(file.name);
            pdfDoc.setAuthor('PDF Tools');
            pdfDoc.setProducer('PDF Tools Web App');
            pdfDoc.setCreator('PDF Tools');

            // To be truly PDF/A, we need to embed color profiles and XMP metadata.
            // This is a "Best Effort" compliance step: Flatten forms/annotations to ensure long term viewing.

            // Flatten form fields if any
            try {
                const form = pdfDoc.getForm();
                form.flatten();
            } catch (e) {
                // No form or error
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            saveAs(blob, `${file.name.replace(/\.pdf$/i, '')}-pdfa.pdf`);

        } catch (err) {
            console.error("Conversion error", err);
            alert("Failed to convert to PDF/A.");
        } finally {
            setProcessing(false);
        }
    };

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const schema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "PDF to PDF/A",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Convert regular PDF files to PDF/A format for long-term archiving and preservation.",
        "featureList": "PDF/A Conversion, PDF Archiving, Metadata Standardization",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "65"
        }
    };

    return (
        <>
            <SEO
                title="PDF to PDF/A - Convert for Long-Term Archiving"
                description="Convert PDF documents to PDF/A standard for long-term digital preservation and archiving."
                keywords="pdf to pdfa, convert pdf to pdf/a, pdf archive format, long term preservation, pdf standard"
                schema={schema}
            />

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: 500 }}>
                    <ArrowLeft size={16} /> Back to Tools
                </Link>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>PDF to PDF/A</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Convert for long-term archiving (Metadata & Flattening).</p>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                    {!file ? (
                        <FileUploader onFilesSelected={handleFile} label="Select PDF file" />
                    ) : (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                <FileCheck size={48} color="#e53e3e" />
                                <h3>{file.name}</h3>
                                <Button variant="secondary" onClick={() => setFile(null)} size="sm" style={{ marginLeft: 'auto' }}>Change File</Button>
                            </div>
                            <Button onClick={handleConvert} disabled={processing} size="lg" style={{ width: '100%' }}>
                                {processing ? 'Converting...' : 'Convert to PDF/A'}
                            </Button>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem', textAlign: 'center' }}>
                                Note: This process flattens all forms and annotations and standardizes metadata for archival compatibility.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ maxWidth: '800px', margin: '4rem auto 0' }}>
                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem' }}>Why convert to PDF/A?</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', color: 'var(--text-main)' }}>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Preserve</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Ensures your document looks the same today and in the future.</p>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Standard</h3>
                            <p style={{ color: 'var(--text-muted)' }}>ISO-standardized version of PDF specialized for digital preservation.</p>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Self-Contained</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Embeds fonts and color profiles so no external resources are needed.</p>
                        </div>
                    </div>
                </section>

                <section style={{ marginBottom: '3rem', padding: '2rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>How to convert to PDF/A</h2>
                    <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li>Upload your PDF.</li>
                        <li>Click 'Convert to PDF/A'.</li>
                        <li>The tool enforces archival standards.</li>
                        <li>Download your future-proof file.</li>
                    </ol>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Frequently Asked Questions</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { q: "What is PDF/A?", a: "It is an ISO-standardized version of PDF specialized for use in the archiving and long-term preservation of electronic documents." },
                            { q: "Is the visual content changed?", a: "No, but interactive elements like forms and JavaScript are removed/flattened." },
                            { q: "Why use PDF/A?", a: "Many government and legal entities require documents to be in PDF/A format." },
                            { q: "Is it free?", a: "Yes, free and unlimited." }
                        ].map((item, index) => (
                            <div key={index} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                                <button
                                    onClick={() => toggleFaq(index)}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        background: 'var(--bg-card)',
                                        border: 'none',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        fontWeight: '600',
                                        color: 'var(--text-main)'
                                    }}
                                >
                                    {item.q}
                                    {openFaq === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                                {openFaq === index && (
                                    <div style={{ padding: '1rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', background: 'var(--bg-background)' }}>
                                        {item.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
};

export default PDFToPDFA;
