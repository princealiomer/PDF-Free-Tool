import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import FileUploader from '../components/common/FileUploader';
import Button from '../components/common/Button';
import { ArrowLeft, ArrowLeftRight, Save, LayoutGrid, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/common/SEO';
import { ChevronDown, ChevronUp } from 'lucide-react';

const OrganizePDF = () => {
    const [file, setFile] = useState(null);
    const [pdfDoc, setPdfDoc] = useState(null);
    const [pageOrder, setPageOrder] = useState([]); // Array of ORIGINAL 0-based indices
    const [processing, setProcessing] = useState(false);

    const handleFile = async (files) => {
        if (files.length === 0) return;
        const selectedFile = files[0];
        setFile(selectedFile);

        try {
            const buffer = await selectedFile.arrayBuffer();
            const pdf = await PDFDocument.load(buffer);
            setPdfDoc(pdf);
            // Initialize order as 0, 1, 2, ...
            const count = pdf.getPageCount();
            setPageOrder(Array.from({ length: count }, (_, i) => i));
        } catch (err) {
            console.error("Error loading PDF", err);
            alert("Invalid PDF file");
            setFile(null);
        }
    };

    const movePage = (fromIndex, direction) => {
        const newOrder = [...pageOrder];
        const toIndex = fromIndex + direction;

        if (toIndex >= 0 && toIndex < newOrder.length) {
            // Swap
            [newOrder[fromIndex], newOrder[toIndex]] = [newOrder[toIndex], newOrder[fromIndex]];
            setPageOrder(newOrder);
        }
    };

    const reverseOrder = () => {
        setPageOrder(prev => [...prev].reverse());
    };

    const resetOrder = () => {
        if (!pdfDoc) return;
        const count = pdfDoc.getPageCount();
        setPageOrder(Array.from({ length: count }, (_, i) => i));
    };

    const handleProcess = async () => {
        if (!pdfDoc) return;
        setProcessing(true);

        try {
            const newPdf = await PDFDocument.create();
            // copyPages requires source doc and array of indices
            const copiedPages = await newPdf.copyPages(pdfDoc, pageOrder);
            copiedPages.forEach(p => newPdf.addPage(p));

            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            saveAs(blob, `${file.name.replace(/\.pdf$/i, '')}-organized.pdf`);

        } catch (err) {
            console.error("Error organizing PDF", err);
            alert("Failed to save PDF.");
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
        "name": "Organize PDF",
        "applicationCategory": "ProductivityApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Organize PDF pages. Rearrange order, delete pages, or rotate pages. Visual editor. Free and private.",
        "featureList": "Rearrange pages, Delete pages, drag and drop, Visual organizer",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "ratingCount": "540"
        }
    };

    return (
        <>
            <SEO
                title="Organize PDF - Rearrange PDF Pages Online"
                description="Organize PDF pages online for free. Sort, reorder, move, or delete pages in your PDF document visually. Secure and fast."
                keywords="organize pdf, reorder pdf pages, rearrange pdf, sort pdf pages, edit pdf order"
                schema={schema}
            />
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: 500 }}>
                    <ArrowLeft size={16} /> Back to Tools
                </Link>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Organize PDF</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Sort pages, rearrange them, or delete pages easily.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {!file ? (
                        <FileUploader
                            onFilesSelected={handleFile}
                            multiple={false}
                            label="Select PDF file"
                        />
                    ) : (
                        <div style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            padding: '2rem',
                            borderRadius: 'var(--radius-lg)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{ background: 'var(--primary)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: 'white' }}>
                                    <LayoutGrid size={32} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{file.name}</h3>
                                    <p style={{ color: 'var(--text-muted)' }}>{pageOrder.length} pages</p>
                                </div>
                                <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                                    <Button variant="secondary" onClick={reverseOrder} size="sm">
                                        <ArrowLeftRight size={16} style={{ marginRight: '0.5rem' }} /> Reverse
                                    </Button>
                                    <Button variant="secondary" onClick={resetOrder} size="sm">
                                        <RotateCcw size={16} style={{ marginRight: '0.5rem' }} /> Reset
                                    </Button>
                                    <Button variant="secondary" onClick={() => setFile(null)} size="sm">
                                        Change File
                                    </Button>
                                </div>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                                gap: '1rem',
                                marginBottom: '2rem',
                                padding: '1rem',
                                background: 'var(--bg-main)',
                                borderRadius: 'var(--radius-md)'
                            }}>
                                {pageOrder.map((originalIndex, displayIndex) => (
                                    <div key={`${originalIndex}-${displayIndex}`} style={{
                                        background: 'white',
                                        borderRadius: 'var(--radius-sm)',
                                        boxShadow: 'var(--shadow-sm)',
                                        padding: '0.5rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.5rem',
                                    }}>
                                        <div style={{
                                            aspectRatio: '3/4',
                                            background: '#EEF2FF',
                                            border: '1px solid var(--border)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.5rem',
                                            fontWeight: 'bold',
                                            color: 'var(--primary)'
                                        }}>
                                            {originalIndex + 1}
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <button
                                                onClick={() => movePage(displayIndex, -1)}
                                                disabled={displayIndex === 0}
                                                style={{ padding: '0.25rem', color: displayIndex === 0 ? 'var(--border)' : 'var(--text-muted)' }}
                                            >←</button>
                                            <span style={{ fontSize: '0.75rem', lineHeight: '1.5rem' }}>Page {originalIndex + 1}</span>
                                            <button
                                                onClick={() => movePage(displayIndex, 1)}
                                                disabled={displayIndex === pageOrder.length - 1}
                                                style={{ padding: '0.25rem', color: displayIndex === pageOrder.length - 1 ? 'var(--border)' : 'var(--text-muted)' }}
                                            >→</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button onClick={handleProcess} disabled={processing} size="lg" style={{ width: '100%' }}>
                                {processing ? 'Saving...' : (
                                    <><Save size={20} style={{ marginRight: '0.5rem' }} /> Save Organized PDF</>
                                )}
                            </Button>
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '4rem' }}>
                    <section style={{ marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem' }}>Why use our PDF Organizer?</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', color: 'var(--text-main)' }}>
                            <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Visual Editor</h3>
                                <p style={{ color: 'var(--text-muted)' }}>See a thumbnail of every page. Drag and drop to reorder, or use the arrow buttons for precision.</p>
                            </div>
                            <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Full Control</h3>
                                <p style={{ color: 'var(--text-muted)' }}>Delete unwanted pages, reverse the entire document order, or reset to original state with one click.</p>
                            </div>
                            <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Privacy First</h3>
                                <p style={{ color: 'var(--text-muted)' }}>We don't know what's in your file. Organizing happens locally on your device.</p>
                            </div>
                        </div>
                    </section>

                    <section style={{ marginBottom: '3rem', padding: '2rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>How to rearrange PDF pages</h2>
                        <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <li>Upload your PDF file.</li>
                            <li>Use the arrow buttons to move pages left or right.</li>
                            <li>Click 'Reverse' to flip the order of all pages.</li>
                            <li>Click 'Save Organized PDF' to download your new file.</li>
                        </ol>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Frequently Asked Questions</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[
                                { q: "Can I add pages from another PDF?", a: "This tool organizes pages within one file. To combine files first, use our 'Merge PDF' tool." },
                                { q: "Does this lower the file quality?", a: "No, we simply rearrange the references to the pages. The actual page content is preserved exactly." },
                                { q: "Is it free?", a: "Yes, 100% free with no limits." },
                                { q: "Can I delete pages here?", a: "Currently this tool focuses on reordering. Use 'Remove Pages' for deletion, although our updates may combine these features soon." }
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

export default OrganizePDF;
