import React, { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import FileUploader from '../components/common/FileUploader';
import Button from '../components/common/Button';
import { ArrowLeft, Trash, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/common/SEO';
import { ChevronDown, ChevronUp } from 'lucide-react';

const RemovePages = () => {
    const [file, setFile] = useState(null);
    const [pdfDoc, setPdfDoc] = useState(null);
    const [pagesToRemove, setPagesToRemove] = useState([]); // Array of 0-based indices
    const [pageCount, setPageCount] = useState(0);
    const [processing, setProcessing] = useState(false);
    const [inputVal, setInputVal] = useState('');

    const handleFile = async (files) => {
        if (files.length === 0) return;
        const selectedFile = files[0];
        setFile(selectedFile);

        try {
            const buffer = await selectedFile.arrayBuffer();
            const pdf = await PDFDocument.load(buffer);
            setPdfDoc(pdf);
            setPageCount(pdf.getPageCount());
            setPagesToRemove([]);
            setInputVal('');
        } catch (err) {
            console.error("Error loading PDF", err);
            alert("Invalid PDF file");
            setFile(null);
        }
    };

    const handleProcess = async () => {
        if (!pdfDoc || pagesToRemove.length === 0) return;
        setProcessing(true);

        try {
            const newPdf = await PDFDocument.create();
            const allIndices = Array.from({ length: pageCount }, (_, i) => i);
            const pagesToKeep = allIndices.filter(i => !pagesToRemove.includes(i));

            if (pagesToKeep.length === 0) {
                alert("You cannot remove all pages!");
                setProcessing(false);
                return;
            }

            const copiedPages = await newPdf.copyPages(pdfDoc, pagesToKeep);
            copiedPages.forEach(p => newPdf.addPage(p));

            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            saveAs(blob, 'pages-removed.pdf');

        } catch (err) {
            console.error("Error removing pages", err);
            alert("Failed to remove pages.");
        } finally {
            setProcessing(false);
        }
    };

    // Helper: Convert array of 0-based indices to "1, 3-5" string
    const formatSelection = (indices) => {
        if (indices.length === 0) return '';
        const sorted = [...indices].sort((a, b) => a - b);
        // Convert to 1-based
        const oneBased = sorted.map(i => i + 1);

        const parts = [];
        let start = oneBased[0];
        let prev = oneBased[0];

        for (let i = 1; i < oneBased.length; i++) {
            const current = oneBased[i];
            if (current === prev + 1) {
                // contiguous
                prev = current;
            } else {
                // break
                if (start === prev) parts.push(`${start}`);
                else parts.push(`${start}-${prev}`);
                start = current;
                prev = current;
            }
        }
        // flush last
        if (start === prev) parts.push(`${start}`);
        else parts.push(`${start}-${prev}`);

        return parts.join(', ');
    };

    const togglePage = (pageIdx) => {
        let newSelection;
        if (pagesToRemove.includes(pageIdx)) {
            newSelection = pagesToRemove.filter(p => p !== pageIdx);
        } else {
            newSelection = [...pagesToRemove, pageIdx].sort((a, b) => a - b);
        }
        setPagesToRemove(newSelection);
        setInputVal(formatSelection(newSelection));
    };

    const handleInputChange = (val) => {
        setInputVal(val);
        // Parse "1, 3-5"
        const parts = val.split(',').map(p => p.trim()).filter(p => p);
        const indices = new Set();

        parts.forEach(part => {
            if (part.includes('-')) {
                const [sStr, eStr] = part.split('-');
                const s = parseInt(sStr);
                const e = parseInt(eStr);
                if (!isNaN(s) && !isNaN(e) && s <= e) {
                    for (let i = s; i <= e; i++) {
                        if (i >= 1 && i <= pageCount) indices.add(i - 1);
                    }
                }
            } else {
                const p = parseInt(part);
                if (!isNaN(p) && p >= 1 && p <= pageCount) indices.add(p - 1);
            }
        });

        // Only update selection if parsing finds something valid OR if input is cleared
        // But we want to allow typing "1-" without clearing.
        // Actually, for "text -> state" we can just push whatever we parsed.
        // If user typed garbage, selection clears. That 's expected for "1-" case?
        // Let's optimize: if val ends in '-' or ',' do we sync?
        // Let's just sync.

        setPagesToRemove(Array.from(indices).sort((a, b) => a - b));
    };

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const [openFaq, setOpenFaq] = useState(null);

    const schema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Remove Pages from PDF",
        "applicationCategory": "ProductivityApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Remove unwanted pages from PDF documents online. Delete specific pages or ranges. Free and secure client-side processing.",
        "featureList": "Delete pages, Range selection, Visual page picker, Client-side processing",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.6",
            "ratingCount": "750"
        }
    };

    return (
        <>
            <SEO
                title="Remove Pages from PDF - Delete PDF Pages Online"
                description="Remove pages from PDF documents online for free. Delete specific pages or ranges instantly. Secure client-side processing."
                keywords="remove pdf pages, delete pdf pages, cut pdf pages, pdf page remover, free pdf tool"
                schema={schema}
            />
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: 500 }}>
                    <ArrowLeft size={16} /> Back to Tools
                </Link>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Remove Pages</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Delete unwanted pages from your PDF documents.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {!file ? (
                        <FileUploader
                            onFilesSelected={handleFile}
                            multiple={false}
                            label="Select PDF file"
                        />
                    ) : (
                        <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{ background: 'var(--primary)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: 'white' }}>
                                    <FileText size={32} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{file.name}</h3>
                                    <p style={{ color: 'var(--text-muted)' }}>{pageCount} pages</p>
                                </div>
                                <Button variant="secondary" onClick={() => setFile(null)} size="sm" style={{ marginLeft: 'auto' }}>Change File</Button>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>
                                    Pages to Remove
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. 1, 3-5"
                                    value={inputVal}
                                    onChange={(e) => handleInputChange(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border)',
                                        fontFamily: 'inherit',
                                        outline: 'none'
                                    }}
                                />
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                    Selected to remove: <span style={{ fontWeight: 'bold', color: '#e53e3e' }}>{pagesToRemove.map(p => p + 1).join(', ') || 'None'}</span>
                                </p>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))',
                                gap: '0.5rem',
                                marginBottom: '2rem',
                                maxHeight: '300px',
                                overflowY: 'auto',
                                padding: '1rem',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                background: '#f7fafc'
                            }}>
                                {Array.from({ length: pageCount }, (_, i) => i).map(pageIdx => {
                                    const isRemoved = pagesToRemove.includes(pageIdx);
                                    return (
                                        <div
                                            key={pageIdx}
                                            onClick={() => togglePage(pageIdx)}
                                            style={{
                                                aspectRatio: '1',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: isRemoved ? '2px solid #e53e3e' : '1px solid var(--border)',
                                                background: isRemoved ? '#FEE2E2' : 'white',
                                                color: isRemoved ? '#c53030' : 'var(--text-main)',
                                                borderRadius: 'var(--radius-sm)',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                fontWeight: isRemoved ? 'bold' : 'normal',
                                                transition: 'all 0.1s ease',
                                                userSelect: 'none'
                                            }}
                                            title={`Click to ${isRemoved ? 'keep' : 'remove'} page ${pageIdx + 1}`}
                                        >
                                            {pageIdx + 1}
                                        </div>
                                    )
                                })}
                            </div>

                            <Button onClick={handleProcess} disabled={processing || pagesToRemove.length === 0} size="lg" style={{ width: '100%' }} variant="danger">
                                {processing ? 'Processing...' : (
                                    <><Trash size={20} style={{ marginRight: '0.5rem' }} /> Remove {pagesToRemove.length} Page{pagesToRemove.length !== 1 ? 's' : ''}</>
                                )}
                            </Button>
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '4rem' }}>
                    <section style={{ marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem' }}>Why use our Remove Pages tool?</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', color: 'var(--text-main)' }}>
                            <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Quick Cleanup</h3>
                                <p style={{ color: 'var(--text-muted)' }}>Instantly remove blank pages, duplicate content, or sensitive information from your PDF documents.</p>
                            </div>
                            <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Visual Selection</h3>
                                <p style={{ color: 'var(--text-muted)' }}>Click to select pages to delete from a visual grid, or type page numbers/ranges for precision.</p>
                            </div>
                            <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>100% Secure</h3>
                                <p style={{ color: 'var(--text-muted)' }}>Files are processed in your browser. We never see your documents or the pages you remove.</p>
                            </div>
                        </div>
                    </section>

                    <section style={{ marginBottom: '3rem', padding: '2rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>How to delete pages from PDF</h2>
                        <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <li>Upload your PDF file.</li>
                            <li>Click the pages you want to remove in the grid view.</li>
                            <li>Or type page numbers (e.g. "1, 5-7") in the input box.</li>
                            <li>Click 'Remove Pages' to download your new, cleaner PDF.</li>
                        </ol>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Frequently Asked Questions</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[
                                { q: "Can I undo the deletion?", a: "Once you download the new file, the changes are permanent in that file. Your original file remains untouched on your device." },
                                { q: "Can I delete multiple ranges at once?", a: "Yes. You can enter something like '1-3, 5, 8-10' to remove all those pages in one go." },
                                { q: "Is there a file size limit?", a: "No hard limits, but very large files (500MB+) might depend on your browser's memory." },
                                { q: "Does this affect the remaining pages?", a: "No, the remaining pages stay exactly as they were, just re-numbered in the new file." }
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

export default RemovePages;
