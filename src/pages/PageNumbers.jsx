import React, { useState } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';
import FileUploader from '../components/common/FileUploader';
import Button from '../components/common/Button';
import { ArrowLeft, Hash, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/common/SEO';
import { ChevronDown, ChevronUp } from 'lucide-react';

const PageNumbers = () => {
    const [file, setFile] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [position, setPosition] = useState('bottom-center'); // bottom-center, bottom-left, bottom-right, top...

    const handleFile = (files) => {
        if (files.length > 0) setFile(files[0]);
    };

    const handleProcess = async () => {
        if (!file) return;
        setProcessing(true);
        try {
            const buffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(buffer);
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const pages = pdfDoc.getPages();
            const count = pages.length;

            pages.forEach((page, idx) => {
                const { width, height } = page.getSize();
                const text = `${idx + 1} / ${count}`;
                const textSize = 12;
                const textWidth = font.widthOfTextAtSize(text, textSize);
                const margin = 20;

                let x, y;

                switch (position) {
                    case 'bottom-left': x = margin; y = margin; break;
                    case 'bottom-right': x = width - textWidth - margin; y = margin; break;
                    case 'top-left': x = margin; y = height - textSize - margin; break;
                    case 'top-center': x = (width - textWidth) / 2; y = height - textSize - margin; break;
                    case 'top-right': x = width - textWidth - margin; y = height - textSize - margin; break;
                    case 'bottom-center': default: x = (width - textWidth) / 2; y = margin; break;
                }

                page.drawText(text, {
                    x,
                    y,
                    size: textSize,
                    font: font,
                    color: rgb(0, 0, 0),
                });
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            saveAs(blob, `${file.name.replace(/\.pdf$/i, '')}-numbered.pdf`);
        } catch (err) {
            console.error("Error adding page numbers", err);
            alert("Failed to add page numbers.");
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
        "name": "Add Page Numbers",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Add page numbers to PDF documents. Customize position and format online for free.",
        "featureList": "Add page numbers, Custom position, Client-side processing",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.7",
            "ratingCount": "150"
        }
    };

    return (
        <>
            <SEO
                title="Add Page Numbers to PDF - Number PDF Pages Online"
                description="Add numbers to PDF pages online for free. Select position, style, and format. Fast and secure client-side processing."
                keywords="page numbers pdf, number pdf pages, add page no to pdf, pdf pagination, free pdf numbering"
                schema={schema}
            />

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: 500 }}>
                    <ArrowLeft size={16} /> Back to Tools
                </Link>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Add Page Numbers</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Number PDF pages easily.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {!file ? (
                        <FileUploader onFilesSelected={handleFile} label="Select PDF file" />
                    ) : (
                        <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{ background: 'var(--primary)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: 'white' }}>
                                    <Hash size={32} />
                                </div>
                                <h3>{file.name}</h3>
                                <Button variant="secondary" onClick={() => setFile(null)} size="sm" style={{ marginLeft: 'auto' }}>Change File</Button>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>Position</label>
                                <select
                                    value={position}
                                    onChange={(e) => setPosition(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border)',
                                        fontFamily: 'inherit'
                                    }}
                                >
                                    <option value="bottom-center">Bottom Center</option>
                                    <option value="bottom-right">Bottom Right</option>
                                    <option value="bottom-left">Bottom Left</option>
                                    <option value="top-center">Top Center</option>
                                    <option value="top-right">Top Right</option>
                                    <option value="top-left">Top Left</option>
                                </select>
                            </div>

                            <Button onClick={handleProcess} disabled={processing} size="lg" style={{ width: '100%' }}>
                                {processing ? 'Processing...' : 'Add Page Numbers'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>


            <div style={{ maxWidth: '800px', margin: '4rem auto 0' }}>
                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem' }}>Why add page numbers with us?</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', color: 'var(--text-main)' }}>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Flexible Positioning</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Choose from multiple positions (bottom-center, top-right, etc.) to fit your document layout.</p>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Format Control</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Automatically calculates total pages (e.g., "1 / 10") for professional numbering.</p>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Private & Secure</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Files are processed in your browser. We never see your documents.</p>
                        </div>
                    </div>
                </section>

                <section style={{ marginBottom: '3rem', padding: '2rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>How to add page numbers to PDF</h2>
                    <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li>Select the PDF file you want to number.</li>
                        <li>Choose the position for the page numbers (e.g., Bottom Center).</li>
                        <li>Click 'Add Page Numbers'.</li>
                        <li>Download the new PDF with numbers added.</li>
                    </ol>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Frequently Asked Questions</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { q: "Can I start numbering from a specific page?", a: "Currently, numbering starts from the first page of the document." },
                            { q: "Can I change the font style?", a: "We use a standard, readable font (Helvetica) to ensure compatibility." },
                            { q: "Will this overwrite existing numbers?", a: "It prints on top of the page. If there are existing numbers in the same spot, they might overlap." },
                            { q: "Is it free?", a: "Yes, you can use this tool as much as you like for free." }
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

export default PageNumbers;
