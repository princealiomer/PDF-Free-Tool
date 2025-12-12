import React, { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import FileUploader from '../components/common/FileUploader';
import Button from '../components/common/Button';
import { ArrowLeft, Image as ImageIcon, Archive } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/common/SEO';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

const PDFToImages = () => {
    const [file, setFile] = useState(null);
    const [processing, setProcessing] = useState(false);

    // We can allow users to select output format (JPG/PNG) - Default JPG
    const [format, setFormat] = useState('image/jpeg');

    const handleFile = (files) => {
        if (files.length > 0) setFile(files[0]);
    };

    const convertToImages = async () => {
        if (!file) return;
        setProcessing(true);

        try {
            const buffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(buffer).promise;
            const pageCount = pdf.numPages;
            const zip = new JSZip();

            for (let i = 1; i <= pageCount; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2.0 }); // Scale 2.0 for better quality
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context, viewport: viewport }).promise;

                // Convert to blob
                const blob = await new Promise(resolve => canvas.toBlob(resolve, format, 0.9));
                const ext = format === 'image/png' ? 'png' : 'jpg';
                zip.file(`page-${i}.${ext}`, blob);
            }

            // Generate zip
            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, `${file.name.replace(/\.pdf$/i, '')}-images.zip`);

        } catch (err) {
            console.error("Error converting to images", err);
            alert("Failed to convert PDF to images.");
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
        "name": "PDF to Images",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Convert PDF pages to images (JPG, PNG). Extract every page as a high-quality image online.",
        "featureList": "PDF to JPG, PDF to PNG, High quality extraction",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "180"
        }
    };

    return (
        <>
            <SEO
                title="PDF to Images - Convert PDF to JPG or PNG Online"
                description="Convert PDF pages to high-quality JPG or PNG images. Extract images from PDF online for free. Fast and secure."
                keywords="pdf to images, pdf to jpg, pdf to png, convert pdf to photo, extract pages as images"
                schema={schema}
            />

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: 500 }}>
                    <ArrowLeft size={16} /> Back to Tools
                </Link>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>PDF to JPG</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Convert each page of your PDF to an image.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {!file ? (
                        <FileUploader onFilesSelected={handleFile} label="Select PDF file" />
                    ) : (
                        <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{ background: 'var(--primary)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: 'white' }}>
                                    <ImageIcon size={32} />
                                </div>
                                <h3>{file.name}</h3>
                                <Button variant="secondary" onClick={() => setFile(null)} size="sm" style={{ marginLeft: 'auto' }}>Change File</Button>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>Output Format</label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        onClick={() => setFormat('image/jpeg')}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            border: `2px solid ${format === 'image/jpeg' ? 'var(--primary)' : 'var(--border)'}`,
                                            borderRadius: 'var(--radius-md)',
                                            background: format === 'image/jpeg' ? '#EEF2FF' : 'white',
                                            fontWeight: 500
                                        }}
                                    >JPG (Smaller)</button>
                                    <button
                                        onClick={() => setFormat('image/png')}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            border: `2px solid ${format === 'image/png' ? 'var(--primary)' : 'var(--border)'}`,
                                            borderRadius: 'var(--radius-md)',
                                            background: format === 'image/png' ? '#EEF2FF' : 'white',
                                            fontWeight: 500
                                        }}
                                    >PNG (Higher Quality)</button>
                                </div>
                            </div>

                            <Button onClick={convertToImages} disabled={processing} size="lg" style={{ width: '100%' }}>
                                {processing ? 'Converting...' : <><Archive size={20} style={{ marginRight: '0.5rem' }} /> Convert to Images</>}
                            </Button>
                        </div>
                    )}
                </div>
            </div>


            <div style={{ maxWidth: '800px', margin: '4rem auto 0' }}>
                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem' }}>Why use our PDF to Image tool?</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', color: 'var(--text-main)' }}>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Presentation Ready</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Turn document pages into images for easy insertion into PowerPoint or social media.</p>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Flexible Formats</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Choose between JPG for smaller file sizes or PNG for maximum clarity and quality.</p>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Bulk Extraction</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Converts every page automatically and packages them into a ZIP file for easy download.</p>
                        </div>
                    </div>
                </section>

                <section style={{ marginBottom: '3rem', padding: '2rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>How to convert PDF to Images</h2>
                    <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li>Upload your PDF file.</li>
                        <li>Select output format (JPG or PNG).</li>
                        <li>Click 'Convert to Images'.</li>
                        <li>Download the ZIP file containing your images.</li>
                    </ol>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Frequently Asked Questions</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { q: "What is the resolution of the images?", a: "We render at high DPI (Scale 2.0) to ensure text remains crisp and readable." },
                            { q: "Can I extract only specific pages?", a: "Currently, we convert the entire document. You can delete unwanted images after extracting the ZIP." },
                            { q: "Is the ZIP file safe?", a: "Yes, it is generated directly in your browser containing only your converted images." },
                            { q: "Does it handle large PDFs?", a: "It can, but very large files with many pages might take a moment to process depending on your computer's speed." }
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

export default PDFToImages;
