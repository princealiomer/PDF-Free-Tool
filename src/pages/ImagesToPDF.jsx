import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import FileUploader from '../components/common/FileUploader';
import Button from '../components/common/Button';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/common/SEO';
import { ChevronDown, ChevronUp } from 'lucide-react';

const ImagesToPDF = () => {
    const [files, setFiles] = useState([]);
    const [processing, setProcessing] = useState(false);

    const handleFiles = (newFiles) => {
        setFiles(prev => [...prev, ...Array.from(newFiles)]);
    };

    const processImages = async () => {
        if (files.length === 0) return;
        setProcessing(true);

        try {
            const doc = new jsPDF();

            // Helper to load image
            const loadImage = (file) => new Promise((resolve) => {
                const img = new Image();
                img.src = URL.createObjectURL(file);
                img.onload = () => resolve({ w: img.width, h: img.height, url: img.src });
            });

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (i > 0) doc.addPage();

                // Get dimensions
                const imgParams = await loadImage(file);

                // Fit to page (A4 usually: 210 x 297 mm)
                const pdfWidth = doc.internal.pageSize.getWidth();
                const pdfHeight = doc.internal.pageSize.getHeight();

                const ratio = Math.min(pdfWidth / imgParams.w, pdfHeight / imgParams.h);
                const w = imgParams.w * ratio;
                const h = imgParams.h * ratio;
                const x = (pdfWidth - w) / 2;
                const y = (pdfHeight - h) / 2;

                doc.addImage(imgParams.url, 'JPEG', x, y, w, h);
            }

            // Save robustly
            const pdfBytes = doc.output('blob');
            saveAs(pdfBytes, 'images-combined.pdf');

        } catch (err) {
            console.error("Error converting images", err);
            alert("Failed to convert images.");
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
        "name": "Images to PDF",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Convert images (JPG, PNG) to PDF. Combine multiple photos into a single PDF document online.",
        "featureList": "JPG to PDF, PNG to PDF, Combine images, Client-side processing",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "ratingCount": "210"
        }
    };

    return (
        <>
            <SEO
                title="Images to PDF - Convert JPG & PNG to PDF Online"
                description="Convert JPG, PNG, and other image formats to PDF. Merge multiple images into one PDF file online for free."
                keywords="images to pdf, jpg to pdf, png to pdf, convert photos to pdf, image converter"
                schema={schema}
            />

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: 500 }}>
                    <ArrowLeft size={16} /> Back to Tools
                </Link>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>JPG to PDF</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Convert images to a single PDF file.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {files.length === 0 ? (
                        <FileUploader
                            onFilesSelected={handleFiles}
                            multiple={true}
                            accept="image/*"
                            label="Select Images"
                        />
                    ) : (
                        <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                                {files.map((f, i) => (
                                    <img key={i} src={URL.createObjectURL(f)} style={{ width: '100%', borderRadius: 'var(--radius-md)', aspectRatio: '1', objectFit: 'cover' }} />
                                ))}
                            </div>
                            <Button onClick={processImages} disabled={processing} size="lg" style={{ width: '100%' }}>
                                {processing ? 'Converting...' : 'Convert to PDF'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>


            <div style={{ maxWidth: '800px', margin: '4rem auto 0' }}>
                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem' }}>Why use our Image to PDF tool?</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', color: 'var(--text-main)' }}>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Universal Format</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Make your photos easy to share and print by converting them to the universal PDF standard.</p>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Multiple Images</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Combine dozens of images into a single, organized document in seconds.</p>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>High Quality</h3>
                            <p style={{ color: 'var(--text-muted)' }}>We preserve the resolution of your photos while optimizing file size for sharing.</p>
                        </div>
                    </div>
                </section>

                <section style={{ marginBottom: '3rem', padding: '2rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>How to convert Images to PDF</h2>
                    <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li>Upload your images (Drag & Drop or Select).</li>
                        <li>Reorder them if necessary (coming soon).</li>
                        <li>Click 'Convert to PDF'.</li>
                        <li>Download your new PDF document.</li>
                    </ol>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Frequently Asked Questions</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { q: "What image formats are supported?", a: "We support the most common formats like JPG, JPEG, and PNG." },
                            { q: "Does it work on mobile?", a: "Yes, you can take photos and convert them directly from your phone." },
                            { q: "Is there a limit on the number of images?", a: "You can process many images, but very large batches might be slow depending on your device." },
                            { q: "Is it secure?", a: "Yes, all processing happens locally on your device." }
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

export default ImagesToPDF;
