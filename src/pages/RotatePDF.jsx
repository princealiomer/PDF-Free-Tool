import React, { useState } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import { saveAs } from 'file-saver';
import FileUploader from '../components/common/FileUploader';
import Button from '../components/common/Button';
import { ArrowLeft, RotateCw, RefreshCw, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/common/SEO';
import { ChevronDown, ChevronUp } from 'lucide-react';

const RotatePDF = () => {
    const [file, setFile] = useState(null);
    const [rotation, setRotation] = useState(0); // 0, 90, 180, 270 relative add
    const [processing, setProcessing] = useState(false);

    const handleFile = (files) => {
        if (files.length > 0) {
            setFile(files[0]);
            setRotation(0);
        }
    };

    const rotateAll = () => {
        setRotation(prev => (prev + 90) % 360);
    };

    const handleProcess = async () => {
        if (!file) return;
        setProcessing(true);
        try {
            const buffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(buffer);
            const pages = pdfDoc.getPages();

            pages.forEach(page => {
                // Add rotation to existing rotation
                const current = page.getRotation().angle;
                page.setRotation(degrees(current + rotation));
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            saveAs(blob, `${file.name.replace(/\.pdf$/i, '')}-rotated.pdf`);
        } catch (err) {
            console.error("Error rotating PDF", err);
            alert("Failed to rotate PDF.");
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
        "name": "Rotate PDF",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Rotate PDF pages permanently. Save your PDF with the correct orientation online for free.",
        "featureList": "Rotate pages, Permanent save, Client-side processing",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "215"
        }
    };

    return (
        <>
            <SEO
                title="Rotate PDF - Rotate PDF Pages Left or Right Online"
                description="Rotate PDF pages 90, 180 or 270 degrees. Permanently change the orientation of your PDF document online for free."
                keywords="rotate pdf, rotate pdf pages, turn pdf, change pdf orientation, free pdf rotator"
                schema={schema}
            />

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: 500 }}>
                    <ArrowLeft size={16} /> Back to Tools
                </Link>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Rotate PDF</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Rotate your PDF pages permanently.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {!file ? (
                        <FileUploader onFilesSelected={handleFile} label="Select PDF file" />
                    ) : (
                        <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{ background: 'var(--primary)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: 'white' }}>
                                    <RotateCw size={32} />
                                </div>
                                <h3>{file.name}</h3>
                                <Button variant="secondary" onClick={() => setFile(null)} size="sm" style={{ marginLeft: 'auto' }}>Change File</Button>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2rem', padding: '3rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
                                <div style={{
                                    transition: 'transform 0.3s ease',
                                    transform: `rotate(${rotation}deg)`,
                                    background: 'white',
                                    width: '120px',
                                    height: '160px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: 'var(--shadow-md)',
                                    border: '1px solid var(--border)'
                                }}>
                                    <FileText size={40} color="var(--primary)" />
                                </div>

                                <Button onClick={rotateAll}>
                                    <RefreshCw size={20} style={{ marginRight: '0.5rem' }} /> Rotate +90°
                                </Button>
                            </div>

                            <Button onClick={handleProcess} disabled={processing} size="lg" style={{ width: '100%' }}>
                                {processing ? 'Saving...' : 'Save Rotated PDF'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>


            <div style={{ maxWidth: '800px', margin: '4rem auto 0' }}>
                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem' }}>Why use our Rotate PDF tool?</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', color: 'var(--text-main)' }}>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Permanent Rotation</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Unlike simple view rotation, this tool permanently saves the new rotation angle to the file.</p>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Secure Processing</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Your files are rotated directly in your browser. No upload required.</p>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Simple & Fast</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Just select, click rotate, and save. No complex software needed.</p>
                        </div>
                    </div>
                </section>

                <section style={{ marginBottom: '3rem', padding: '2rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>How to rotate PDF pages</h2>
                    <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li>Select the PDF file you need to rotate.</li>
                        <li>Click the 'Rotate' button to change orientation (90° increments).</li>
                        <li>Preview the orientation on the screen.</li>
                        <li>Click 'Save Rotated PDF' to download the fixed file.</li>
                    </ol>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Frequently Asked Questions</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { q: "Can I rotate specific pages?", a: "Currently, this tool applies the rotation to all pages in the document." },
                            { q: "Is the rotation permanent?", a: "Yes, when you save the file, the pages will stay rotated in any PDF viewer." },
                            { q: "Does this affect the quality?", a: "No, rotating pages does not change the quality or content of the document." },
                            { q: "Is it free?", a: "Yes, you can rotate unlimited files for free." }
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

export default RotatePDF;
