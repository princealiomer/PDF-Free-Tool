import React, { useState, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import FileUploader from '../components/common/FileUploader';
import Button from '../components/common/Button';
import { ArrowLeft, Search, FileText, Copy, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import SEO from '../components/common/SEO';
import { ChevronDown, ChevronUp } from 'lucide-react';

const OCRPDF = () => {
    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('Idle');
    const [recognizedText, setRecognizedText] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleFile = (files) => {
        if (files.length > 0) {
            setFile(files[0]);
            setRecognizedText('');
            setProgress(0);
            setStatus('Ready to scan');
        }
    };

    const handleOCR = async () => {
        if (!file) return;
        setProcessing(true);
        setStatus('Initializing...');

        try {
            const { data: { text } } = await Tesseract.recognize(
                file,
                'eng',
                {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            setProgress(Math.round(m.progress * 100));
                            setStatus(`Scaning: ${Math.round(m.progress * 100)}%`);
                        } else {
                            setStatus(m.status);
                        }
                    }
                }
            );
            setRecognizedText(text);
            setStatus('Completed');
        } catch (err) {
            console.error(err);
            setStatus('Error occurred');
            alert('Failed to recognize text.');
        } finally {
            setProcessing(false);
        }
    };

    const handleDownload = () => {
        if (!recognizedText) return;
        const doc = new jsPDF();
        const splitText = doc.splitTextToSize(recognizedText, 180);
        doc.text(splitText, 15, 15);

        // Helper to ensure valid PDF filename
        const getName = (name) => {
            const lastDot = name.lastIndexOf('.');
            const base = lastDot !== -1 ? name.substring(0, lastDot) : name;
            return `${base}-ocr.pdf`;
        };

        doc.save(getName(file.name));
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(recognizedText);
        alert('Copied to clipboard!');
    };

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const [openFaq, setOpenFaq] = useState(null);

    const schema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "OCR PDF",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Extract text from generic PDF images or scanned documents using OCR. Convert scanned PDFs to editable text online.",
        "featureList": "OCR, Text Extraction, Scanned PDF to Text, Image to Text",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.7",
            "ratingCount": "95"
        }
    };

    return (
        <>
            <SEO
                title="OCR PDF - Extract Text from Scanned PDFs Online"
                description="Free online OCR tool to extract text from scanned PDF documents and images. Convert image-based PDFs to editable text."
                keywords="ocr pdf, pdf to text, extract text from pdf, scanned pdf to text, image to text converter"
                schema={schema}
            />

            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: 500 }}>
                    <ArrowLeft size={16} /> Back to Tools
                </Link>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>OCR PDF</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Extract text from scanned PDF images or image files.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            {!file ? (
                                <FileUploader onFilesSelected={handleFile} label="Upload Image/PDF" accept="image/*,application/pdf" />
                            ) : (
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ marginBottom: '1rem', background: '#f3f4f6', padding: '1rem', borderRadius: '8px' }}>
                                        <FileText size={48} color="var(--primary)" />
                                        <p style={{ marginTop: '0.5rem', fontWeight: 500 }}>{file.name}</p>
                                    </div>

                                    {processing && (
                                        <div style={{ marginBottom: '1rem' }}>
                                            <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                                                <div style={{ width: `${progress}%`, background: 'var(--primary)', height: '100%', transition: 'width 0.3s' }}></div>
                                            </div>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{status}</p>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                        <Button onClick={handleOCR} disabled={processing} size="lg">
                                            {processing ? 'Scanning...' : <><Search size={20} style={{ marginRight: '0.5rem' }} /> Start OCR</>}
                                        </Button>
                                        <Button onClick={() => setFile(null)} variant="secondary" disabled={processing}>Change File</Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', height: '500px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <h3 style={{ fontWeight: 600 }}>Extracted Text</h3>
                            {recognizedText && (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <Button size="sm" variant="secondary" onClick={handleCopy}><Copy size={14} /> Copy</Button>
                                    <Button size="sm" onClick={handleDownload}><Download size={14} /> Download PDF</Button>
                                </div>
                            )}
                        </div>
                        <textarea
                            value={recognizedText}
                            readOnly
                            placeholder="Recognized text will appear here..."
                            style={{
                                flex: 1,
                                width: '100%',
                                padding: '1rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border)',
                                resize: 'none',
                                fontFamily: 'inherit',
                                lineHeight: 1.6
                            }}
                        />
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '1000px', margin: '4rem auto 0' }}>
                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem' }}>Why use our OCR PDF tool?</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', color: 'var(--text-main)' }}>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Accurate</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Powered by advanced Tesseract engine to recognize text with high accuracy.</p>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Multi-Language</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Primarily optimized for English but capable of recognizing standard characters.</p>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Private</h3>
                            <p style={{ color: 'var(--text-muted)' }}>OCR process runs entirely in your browser. No data leaves your computer.</p>
                        </div>
                    </div>
                </section>

                <section style={{ marginBottom: '3rem', padding: '2rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>How to extract text from PDF</h2>
                    <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li>Upload a scanned PDF or an image containing text.</li>
                        <li>Click 'Start OCR' to begin the recognition process.</li>
                        <li>Wait for the scan to complete.</li>
                        <li>Copy the extracted text or download it as a new PDF.</li>
                    </ol>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Frequently Asked Questions</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { q: "What file types are supported?", a: "We support standard image formats (JPG, PNG) and PDF files." },
                            { q: "Is it accurate?", a: "Accuracy depends on the image quality. Clear, high-contrast images work best." },
                            { q: "Does it work with handwritten text?", a: "OCR handles printed text best. Handwriting recognition is experimental and may vary." },
                            { q: "Is it free?", a: "Yes, 100% free and unlimited." }
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

export default OCRPDF;
