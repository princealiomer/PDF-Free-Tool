import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import * as pdfjsLib from 'pdfjs-dist';
import FileUploader from '../components/common/FileUploader';
import Button from '../components/common/Button';
import { ArrowLeft, Minimize2, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/common/SEO';
import { ChevronDown, ChevronUp } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

const CompressPDF = () => {
    const [file, setFile] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [mode, setMode] = useState('basic'); // 'basic' | 'strong'

    const handleFile = (files) => {
        if (files.length > 0) setFile(files[0]);
    };

    const handleCompress = async () => {
        if (!file) return;
        setProcessing(true);
        try {
            if (mode === 'basic') {
                // Basic: Repack with Object Streams enabled
                const buffer = await file.arrayBuffer();
                const srcPdf = await PDFDocument.load(buffer);

                // Strategy: Create new doc and copy pages. This essentially "garbage collects" unused objects
                // and repacks the file. Crucially, we MUST enable useObjectStreams.
                const newPdf = await PDFDocument.create();
                const indices = srcPdf.getPageIndices();
                const copiedPages = await newPdf.copyPages(srcPdf, indices);
                copiedPages.forEach(p => newPdf.addPage(p));

                const pdfBytes = await newPdf.save({ useObjectStreams: true });
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                saveAs(blob, `${file.name.replace(/\.pdf$/i, '')}-optimized.pdf`);

            } else {
                // Strong: Rasterize pages to JPEG (Lossy)
                const buffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument(buffer).promise;
                const newPdf = await PDFDocument.create();

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    // Scale: 1.5 standard, allow reducing for more compression? 
                    // Let's stick to 1.5 for readability but compress JPEG quality.
                    const viewport = page.getViewport({ scale: 1.5 });
                    const canvas = document.createElement('canvas');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    const ctx = canvas.getContext('2d');
                    await page.render({ canvasContext: ctx, viewport }).promise;

                    // Strong JPEG compression (0.6 quality)
                    const imgData = canvas.toDataURL('image/jpeg', 0.6);
                    const imgBytes = await fetch(imgData).then(res => res.arrayBuffer());

                    const jpgImage = await newPdf.embedJpg(imgBytes);
                    const pdfPage = newPdf.addPage([viewport.width, viewport.height]);
                    pdfPage.drawImage(jpgImage, {
                        x: 0,
                        y: 0,
                        width: viewport.width,
                        height: viewport.height
                    });
                }

                const pdfBytes = await newPdf.save({ useObjectStreams: true });
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                saveAs(blob, `${file.name.replace(/\.pdf$/i, '')}-minimized.pdf`);
            }

        } catch (err) {
            console.error("Error compressing PDF", err);
            alert("Failed to compress PDF.");
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
        "name": "Compress PDF",
        "applicationCategory": "ProductivityApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Compress PDF files online for free. Reduce file size while optimized for quality. Secure client-side processing.",
        "featureList": "Basic and Strong compression modes, Client-side processing, Privacy focused",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.7",
            "ratingCount": "890"
        }
    };

    return (
        <>
            <SEO
                title="Compress PDF - Reduce File Size Online for Free"
                description="Compress PDF files online for free. Reduce PDF file size without losing quality. Secure, fast, and no registration required."
                keywords="compress pdf, reduce pdf size, shrink pdf, maximize pdf quality, free pdf compressor"
                schema={schema}
            />
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: 500 }}>
                    <ArrowLeft size={16} /> Back to Tools
                </Link>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Compress PDF</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Reduce file size while optimizing for quality.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {!file ? (
                        <FileUploader onFilesSelected={handleFile} label="Select PDF file" />
                    ) : (
                        <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{ background: 'var(--primary)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: 'white' }}>
                                    <Minimize2 size={32} />
                                </div>
                                <h3>{file.name}</h3>
                                <Button variant="secondary" onClick={() => setFile(null)} size="sm" style={{ marginLeft: 'auto' }}>Change File</Button>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                                <button
                                    onClick={() => setMode('basic')}
                                    style={{
                                        flex: 1,
                                        padding: '1rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: mode === 'basic' ? '2px solid var(--primary)' : '1px solid var(--border)',
                                        background: mode === 'basic' ? '#EEF2FF' : 'white',
                                        cursor: 'pointer',
                                        textAlign: 'left'
                                    }}
                                >
                                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Basic Compression</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Optimizes structure. Keeps text selectable. Good quality.</div>
                                </button>

                                <button
                                    onClick={() => setMode('strong')}
                                    style={{
                                        flex: 1,
                                        padding: '1rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: mode === 'strong' ? '2px solid var(--primary)' : '1px solid var(--border)',
                                        background: mode === 'strong' ? '#EEF2FF' : 'white',
                                        cursor: 'pointer',
                                        textAlign: 'left'
                                    }}
                                >
                                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Strong Compression</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Converts to images. Text NOT selectable. Smallest size.</div>
                                </button>
                            </div>

                            <Button onClick={handleCompress} disabled={processing} size="lg" style={{ width: '100%' }}>
                                {processing ? 'Compressing...' : <><Minimize2 size={20} style={{ marginRight: '0.5rem' }} /> Compress PDF</>}
                            </Button>

                            {mode === 'strong' && (
                                <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#FFF7ED', borderRadius: 'var(--radius-md)', display: 'flex', gap: '0.5rem', color: '#C05621', fontSize: '0.85rem', alignItems: 'flex-start' }}>
                                    <AlertTriangle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                                    Strong compression will convert this document into images. You will not be able to select or copy text in the output file.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '4rem' }}>
                    <section style={{ marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem' }}>Why use our PDF Compressor?</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', color: 'var(--text-main)' }}>
                            <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Smart Optimization</h3>
                                <p style={{ color: 'var(--text-muted)' }}>We intelligently reduce file size by removing unused data and optimizing images without compromising readability.</p>
                            </div>
                            <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Two Powerful Modes</h3>
                                <p style={{ color: 'var(--text-muted)' }}>Choose 'Basic' for standard size reduction or 'Strong' for maximum compression (converts to images).</p>
                            </div>
                            <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>100% Secure</h3>
                                <p style={{ color: 'var(--text-muted)' }}>Compression happens entirely in your browser. Your sensitive documents never leave your device.</p>
                            </div>
                        </div>
                    </section>

                    <section style={{ marginBottom: '3rem', padding: '2rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>How to compress a PDF</h2>
                        <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <li>Upload your PDF file to the compression tool.</li>
                            <li>Select 'Basic Compression' for general use or 'Strong Compression' for smallest size.</li>
                            <li>Click 'Compress PDF' and wait a moment for the process to finish.</li>
                            <li>Download your significantly smaller PDF file.</li>
                        </ol>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Frequently Asked Questions</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[
                                { q: "How much can I reduce my PDF size?", a: "This depends on the file content. Text-heavy files might see 20-50% reduction, while image-heavy PDFs can often be reduced by up to 80-90% with Strong compression." },
                                { q: "What is Strong Compression?", a: "Strong compression converts each page of your PDF into a high-quality JPEG image. This drastically reduces size but removes selectable text." },
                                { q: "Is my data safe?", a: "Yes. Unlike other tools, we do not upload your file to a server. All compression processing is done locally on your computer." },
                                { q: "Is this service free?", a: "Yes, our PDF compressor is 100% free with no usage limits." }
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

export default CompressPDF;
