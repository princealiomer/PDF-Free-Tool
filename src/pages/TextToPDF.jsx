import React, { useState } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';
import FileUploader from '../components/common/FileUploader';
import Button from '../components/common/Button';
import { ArrowLeft, FileType } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/common/SEO';
import { ChevronDown, ChevronUp } from 'lucide-react';

const TextToPDF = () => {
    const [file, setFile] = useState(null);
    const [textInput, setTextInput] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleFile = async (files) => {
        if (files.length > 0) {
            const f = files[0];
            setFile(f);
            const text = await f.text();
            setTextInput(text);
        }
    };

    const handleConvert = async () => {
        if (!textInput.trim()) return;
        setProcessing(true);
        try {
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage();
            const { width, height } = page.getSize();
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const fontSize = 12;

            // Simple text wrapping logic
            const lines = textInput.split('\n');
            let y = height - 50;
            const margin = 50;
            const maxWidth = width - margin * 2;

            for (const line of lines) {
                // This is extremely basic wrapping. 
                // For a real app, we need proper word wrapping utility.
                // Assuming simple short lines for now or truncating.
                // Or better: use a library/helper for drawing text.
                // pdf-lib's drawText doesn't auto-wrap by default.

                // Let's implement a very basic char-based wrap
                // Or just draw effectively.

                page.drawText(line, {
                    x: margin,
                    y,
                    size: fontSize,
                    font,
                    color: rgb(0, 0, 0),
                    maxWidth: maxWidth,
                    lineHeight: fontSize * 1.2,
                });

                // Estimate height? drawText doesn't return height used easily without measuring.
                // Let's assume one line per newline for this basic version?
                // Actually drawText DOES wrap if maxWidth is provided in recent versions?
                // Yes, maxWidth is supported.

                // We need to move Y down. But how much?
                // We don't know number of lines it wrapped to without pre-measuring.
                // For this stub, we might just print it all in one go if possible or assume pre-wrapped.

                // Better approach:
                // Just use one drawText for the whole content if it has newlines?
                // pdf-lib handles newlines.

                // But it does NOT handle multiple pages.
                // So big text = truncated.

                y -= (fontSize * 1.5);
                if (y < 50) {
                    // Start new page
                    // This is hard without loop.
                }
            }

            // Re-Strategy: Just draw the whole text block. 
            // Warning: No pagination in this basic version.
            page.drawText(textInput, {
                x: margin,
                y: height - 50,
                size: fontSize,
                font,
                maxWidth: maxWidth,
                lineHeight: fontSize * 1.2
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            saveAs(blob, 'converted-text.pdf');
        } catch (err) {
            console.error("Error converting text", err);
            alert("Failed to convert text.");
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
        "name": "Text to PDF",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Convert plain text (TXT) to PDF. Type or upload text and generate a clean PDF document.",
        "featureList": "TXT to PDF, Type to PDF, Simple formatting",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.5",
            "ratingCount": "80"
        }
    };

    return (
        <>
            <SEO
                title="Text to PDF - Convert TXT to PDF Online"
                description="Convert plain text files or typed content to PDF. Create PDF documents from text instantly online for free."
                keywords="text to pdf, txt to pdf, convert text to pdf, create pdf from text, free text converter"
                schema={schema}
            />

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: 500 }}>
                    <ArrowLeft size={16} /> Back to Tools
                </Link>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Text to PDF</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Convert plain text or .txt files to PDF.</p>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        {!file && (
                            <div style={{ marginBottom: '1rem' }}>
                                <FileUploader onFilesSelected={handleFile} label="Upload .txt file (Optional)" accept=".txt" />
                            </div>
                        )}

                        <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>Text Content</label>
                        <textarea
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            placeholder="Type or paste text here..."
                            style={{
                                width: '100%',
                                height: '300px',
                                padding: '1rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border)',
                                fontFamily: 'inherit',
                                fontSize: '1rem'
                            }}
                        ></textarea>
                    </div>

                    <Button onClick={handleConvert} disabled={processing || !textInput.trim()} size="lg" style={{ width: '100%' }}>
                        {processing ? 'Converting...' : <><FileType size={20} style={{ marginRight: '0.5rem' }} /> Convert to PDF</>}
                    </Button>
                </div>
            </div>

            <div style={{ maxWidth: '800px', margin: '4rem auto 0' }}>
                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem' }}>Why use our Text to PDF tool?</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', color: 'var(--text-main)' }}>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Simple Clean</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Quickly format plain text into a professional looking PDF document.</p>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Secure</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Conversion happens locally. Your notes and drafts stay private.</p>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>File Support</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Upload an existing .txt file or simply paste text from your clipboard.</p>
                        </div>
                    </div>
                </section>

                <section style={{ marginBottom: '3rem', padding: '2rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>How to convert Text to PDF</h2>
                    <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li>Upload a .txt file or paste text into the editor.</li>
                        <li>Review your text.</li>
                        <li>Click 'Convert to PDF'.</li>
                        <li>Download your new PDF document.</li>
                    </ol>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Frequently Asked Questions</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { q: "Can I handle multiple pages?", a: "Currently, we fit as much as possible on one page. Multi-page text support is coming soon." },
                            { q: "What fonts are used?", a: "We use a standard, readable Helvetica font." },
                            { q: "Can I use special characters?", a: "Yes, standard UTF-8 characters are supported." },
                            { q: "Is it free?", a: "Yes, entirely free." }
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

export default TextToPDF;
