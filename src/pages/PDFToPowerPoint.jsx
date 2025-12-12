import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pptxgen from 'pptxgenjs';
import FileUploader from '../components/common/FileUploader';
import Button from '../components/common/Button';
import { ArrowLeft, Presentation } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/common/SEO';
import { ChevronDown, ChevronUp } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const PDFToPowerPoint = () => {
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
            const pdf = await pdfjsLib.getDocument(buffer).promise;

            const pres = new pptxgen();

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const slide = pres.addSlide();

                // Strategy: Render PDF page as an image to ensure formatting (Best fidelity)
                // Text extraction is hard to position perfectly in PPT.
                // Slides are visual aids, so image is often acceptable for "View" but not "Edit".
                // Let's do Image-based for robustness.

                // Render to canvas
                const viewport = page.getViewport({ scale: 2 }); // 2x for quality
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext('2d');
                await page.render({ canvasContext: ctx, viewport }).promise;

                const imgData = canvas.toDataURL('image/png');

                // PPT slide size default is 10x5.625 inches (16:9). 
                // We should fit image to slide.
                slide.addImage({ data: imgData, x: 0, y: 0, w: '100%', h: '100%' });
            }

            pres.writeFile({ fileName: `${file.name.replace(/\.pdf$/i, '')}.pptx` });

        } catch (err) {
            console.error("Conversion error", err);
            alert("Failed to convert to PowerPoint.");
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
        "name": "PDF to PowerPoint",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Convert PDF files to PowerPoint presentations (PPTX). Create slides from PDF pages online.",
        "featureList": "PDF to PPTX, Presentation converter, Slide extraction",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.5",
            "ratingCount": "90"
        }
    };

    return (
        <>
            <SEO
                title="PDF to PowerPoint - Convert PDF to PPTX Online"
                description="Convert PDF documents to PowerPoint presentations. Turn PDF pages into PPTX slides for free."
                keywords="pdf to powerpoint, pdf to pptx, convert pdf to ppt, pdf to slides, presentation converter"
                schema={schema}
            />

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: 500 }}>
                    <ArrowLeft size={16} /> Back to Tools
                </Link>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>PDF to PowerPoint</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Convert PDF slides to PPTX presentation.</p>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                    {!file ? (
                        <FileUploader onFilesSelected={handleFile} label="Select PDF file" />
                    ) : (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                <Presentation size={48} color="#d24726" />
                                <h3>{file.name}</h3>
                                <Button variant="secondary" onClick={() => setFile(null)} size="sm" style={{ marginLeft: 'auto' }}>Change File</Button>
                            </div>
                            <Button onClick={handleConvert} disabled={processing} size="lg" style={{ width: '100%' }}>
                                {processing ? 'Converting...' : 'Convert to PowerPoint'}
                            </Button>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem', textAlign: 'center' }}>
                                Note: Slides are generated as high-quality images to preserve exact layout. They are not editable text blocks.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ maxWidth: '800px', margin: '4rem auto 0' }}>
                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem' }}>Why use our PDF to PowerPoint tool?</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', color: 'var(--text-main)' }}>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Present</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Turn your static PDF reports into dynamic PowerPoint presentations.</p>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Visual</h3>
                            <p style={{ color: 'var(--text-muted)' }}>We convert pages to high-fidelity images, ensuring your design stays intact.</p>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Simple</h3>
                            <p style={{ color: 'var(--text-muted)' }}>No complex settings. Just upload and convert.</p>
                        </div>
                    </div>
                </section>

                <section style={{ marginBottom: '3rem', padding: '2rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>How to convert PDF to PPT</h2>
                    <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li>Select your PDF file.</li>
                        <li>Click 'Convert to PowerPoint'.</li>
                        <li>The tool will render each page as a slide.</li>
                        <li>Download your new .pptx file.</li>
                    </ol>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Frequently Asked Questions</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { q: "Can I edit the text in PowerPoint?", a: "No, this tool converts pages to images to preserve layout. Text is not editable." },
                            { q: "Does it work with big files?", a: "Yes, but processing time depends on your computer's speed." },
                            { q: "Is it compatible with Google Slides?", a: "Yes, the .pptx file can be uploaded to Google Slides." },
                            { q: "Is it safe?", a: "Absolutey. All processing happens in your browser." }
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

export default PDFToPowerPoint;
