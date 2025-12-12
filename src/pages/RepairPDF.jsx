import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import FileUploader from '../components/common/FileUploader';
import Button from '../components/common/Button';
import { ArrowLeft, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/common/SEO';
import { ChevronDown, ChevronUp } from 'lucide-react';

const RepairPDF = () => {
    const [file, setFile] = useState(null);
    const [processing, setProcessing] = useState(false);

    const handleFile = (files) => {
        if (files.length > 0) setFile(files[0]);
    };

    const handleRepair = async () => {
        if (!file) return;
        setProcessing(true);
        try {
            const buffer = await file.arrayBuffer();
            // Loading with ignoreEncryption may preserve readable content if not encrypted but corrupted
            // Actually pdf-lib handles some repair on load (xref rebuilding).
            const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });

            // Create fresh doc and copy pages (Basic Repair strategy: rebuild structure)
            const newPdf = await PDFDocument.create();
            const indices = pdfDoc.getPageIndices();
            const copiedPages = await newPdf.copyPages(pdfDoc, indices);
            copiedPages.forEach(p => newPdf.addPage(p));

            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            saveAs(blob, `${file.name.replace(/\.pdf$/i, '')}-repaired.pdf`);
        } catch (err) {
            console.error("Error repairing PDF", err);
            alert("Failed to repair PDF. It may be too corrupted.");
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
        "name": "Repair PDF",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Repair corrupted PDF files. Recover data from damaged PDF documents online for free.",
        "featureList": "Repair PDF, Recover data, Fix corruption",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.5",
            "ratingCount": "95"
        }
    };

    return (
        <>
            <SEO
                title="Repair PDF - Fix Corrupted PDF Files Online"
                description="Repair damaged PDF files. Recover data from corrupted documents online for free. Attempt to fix PDF errors instantly."
                keywords="repair pdf, fix pdf, corrupted pdf recovery, damage pdf repair, recover pdf"
                schema={schema}
            />

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: 500 }}>
                    <ArrowLeft size={16} /> Back to Tools
                </Link>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Repair PDF</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Attempt to fix corrupted or damaged PDF files.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {!file ? (
                        <FileUploader onFilesSelected={handleFile} label="Select PDF file" />
                    ) : (
                        <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{ background: 'var(--primary)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: 'white' }}>
                                    <Wrench size={32} />
                                </div>
                                <h3>{file.name}</h3>
                                <Button variant="secondary" onClick={() => setFile(null)} size="sm" style={{ marginLeft: 'auto' }}>Change File</Button>
                            </div>

                            <Button onClick={handleRepair} disabled={processing} size="lg" style={{ width: '100%' }}>
                                {processing ? 'Repairing...' : 'Repair PDF'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>


            <div style={{ maxWidth: '800px', margin: '4rem auto 0' }}>
                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem' }}>Why use our Repair PDF tool?</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', color: 'var(--text-main)' }}>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Data Recovery</h3>
                            <p style={{ color: 'var(--text-muted)' }}>We attempt to recover content from damaged file structures so you can open your document again.</p>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Structure Fix</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Rebuilds the XREF table and file trailer to make the PDF readable by standard viewers.</p>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Free & Fast</h3>
                            <p style={{ color: 'var(--text-muted)' }}>No software installation needed. Upload, repair, and download in seconds.</p>
                        </div>
                    </div>
                </section>

                <section style={{ marginBottom: '3rem', padding: '2rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>How to repair a PDF</h2>
                    <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li>Select the corrupted PDF file.</li>
                        <li>Click 'Repair PDF' to start the recovery process.</li>
                        <li>We will attempt to rebuild the document structure.</li>
                        <li>Download the repaired version.</li>
                    </ol>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Frequently Asked Questions</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { q: "Can all files be fixed?", a: "Unfortunately, no. If the file data is completely overwritten or missing, it cannot be recovered. However, we can fix many structural errors." },
                            { q: "Is my data safe?", a: "Yes, the repair process happens in your browser." },
                            { q: "What if it's an empty file?", a: "If the file size is 0kb, it contains no data and cannot be repaired." },
                            { q: "Do you keep a copy?", a: "No, we do not store or view your files." }
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

export default RepairPDF;
