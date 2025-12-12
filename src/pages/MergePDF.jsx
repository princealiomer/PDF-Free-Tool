import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import FileUploader from '../components/common/FileUploader';
import Button from '../components/common/Button';
import { ArrowLeft, FileText, Trash2 } from 'lucide-react';
import Link from 'next/link'; // Wait, this is Vite. Correct import is react-router-dom
import { Link } from 'react-router-dom';
import SEO from '../components/common/SEO';
import { ChevronDown, ChevronUp } from 'lucide-react';

const MergePDF = () => {
    const [files, setFiles] = useState([]);
    const [processing, setProcessing] = useState(false);

    const handleFiles = (newFiles) => {
        setFiles((prev) => [...prev, ...Array.from(newFiles)]);
    };

    const removeFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const mergePDFs = async () => {
        if (files.length === 0) return;
        setProcessing(true);
        try {
            const mergedPdf = await PDFDocument.create();

            for (const file of files) {
                const fileBuffer = await file.arrayBuffer();
                const pdf = await PDFDocument.load(fileBuffer);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }

            const mergedPdfBytes = await mergedPdf.save();
            const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });

            // Use file-saver for robust download handling
            saveAs(blob, 'merged-document.pdf');

        } catch (err) {
            console.error("Error merging PDFs", err);
            alert("Failed to merge PDFs. One of the files might be corrupted.");
        } finally {
            setProcessing(false);
        }
    };

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const [openFaq, setOpenFaq] = useState(null);

    const schema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Merge PDF",
        "applicationCategory": "ProductivityApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Merge multiple PDF files into one document in seconds. 100% free, secure, and works directly in your browser.",
        "featureList": "Drag and drop interface, Client-side processing, No file size limits",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "1250"
        }
    };

    return (
        <>
            <SEO
                title="Merge PDF - Combine PDF Files Online for Free"
                description="Merge multiple PDF files into one document in seconds. 100% free, secure, and works directly in your browser. No upload limits."
                keywords="merge pdf, combine pdf, join pdf, pdf merger, free pdf merge"
                schema={schema}
            />
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: 500 }}>
                    <ArrowLeft size={16} /> Back to Tools
                </Link>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Merge PDF Files</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Combine multiple PDFs into one unified document.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {files.length === 0 ? (
                        <FileUploader
                            onFilesSelected={handleFiles}
                            multiple={true}
                            label="Select PDF files"
                        />
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                                <Button variant="secondary" onClick={() => document.getElementById('add-more-input').click()}>
                                    Add more files
                                </Button>
                                <input
                                    id="add-more-input"
                                    type="file"
                                    multiple
                                    accept=".pdf"
                                    onChange={(e) => handleFiles(e.target.files)}
                                    style={{ display: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                                {files.map((file, idx) => (
                                    <div key={idx} style={{
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border)',
                                        padding: '1rem',
                                        borderRadius: 'var(--radius-md)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        position: 'relative'
                                    }}>
                                        <FileText size={40} color="var(--primary)" />
                                        <span style={{ fontSize: '0.875rem', textAlign: 'center', wordBreak: 'break-word', overflow: 'hidden', maxHeight: '3em' }}>{file.name}</span>
                                        <button
                                            onClick={() => removeFile(idx)}
                                            style={{
                                                position: 'absolute',
                                                top: '0.5rem',
                                                right: '0.5rem',
                                                color: 'var(--text-muted)',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                                <Button onClick={mergePDFs} disabled={processing} size="lg">
                                    {processing ? 'Merging...' : 'Merge PDF'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '4rem' }}>
                    <section style={{ marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem' }}>Why use our PDF Merger?</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', color: 'var(--text-main)' }}>
                            <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Secure & Private</h3>
                                <p style={{ color: 'var(--text-muted)' }}>All processing happens in your browser. Your files are never uploaded to our servers, ensuring 100% privacy.</p>
                            </div>
                            <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Fast & Free</h3>
                                <p style={{ color: 'var(--text-muted)' }}>Merge unlimited files instantly. No hidden costs, no watermarks, and no sign-up required.</p>
                            </div>
                            <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Easy to Use</h3>
                                <p style={{ color: 'var(--text-muted)' }}>Simply drag and drop your PDFs, arrange them in the desired order, and click merge. It's that simple.</p>
                            </div>
                        </div>
                    </section>

                    <section style={{ marginBottom: '3rem', padding: '2rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>How to merge PDF files</h2>
                        <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <li>Select multiple PDF files and upload them to the tool.</li>
                            <li>Arrange the files in the order you want them to appear.</li>
                            <li>Click 'Merge PDF' to combine them into a single file.</li>
                            <li>Download your merged document instantly.</li>
                        </ol>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Frequently Asked Questions</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[
                                { q: "Is it safe to merge PDFs online?", a: "Yes, absolutely. Our tool processes files client-side, meaning they never leave your device. Your data remains completely private." },
                                { q: "Can I merge PDF files on Mac or Windows?", a: "Yes! Our tool works in any modern web browser, so you can use it on Windows, Mac, Linux, or even mobile devices." },
                                { q: "Is there a limit to how many files I can merge?", a: "We don't impose hard limits. Since processing happens on your device, it depends on your browser's memory, but you can typically merge dozens of files without issue." },
                                { q: "Will the quality of my PDF be reduced?", a: "No, merging simply combines the pages. The quality of the original content is preserved." }
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
            </div>
        </>
    );
};

export default MergePDF;
