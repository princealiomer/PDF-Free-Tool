import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import FileUploader from '../components/common/FileUploader';
import Button from '../components/common/Button';
import { ArrowLeft, Scissors, Download, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/common/SEO';
import { ChevronDown, ChevronUp } from 'lucide-react';

const SplitPDF = () => {
    const [file, setFile] = useState(null);
    const [pageCount, setPageCount] = useState(0);
    const [processing, setProcessing] = useState(false);
    const [splitMode, setSplitMode] = useState('all'); // 'all' | 'range'
    const [ranges, setRanges] = useState(''); // "1-5, 8, 10-12"

    const handleFile = async (files) => {
        if (files.length === 0) return;
        const selectedFile = files[0];
        setFile(selectedFile);

        // Load PDF to get page count
        try {
            const buffer = await selectedFile.arrayBuffer();
            const pdf = await PDFDocument.load(buffer);
            setPageCount(pdf.getPageCount());
        } catch (err) {
            console.error("Error loading PDF", err);
            alert("Invalid PDF file");
            setFile(null);
        }
    };

    const parseRanges = (rangeStr, maxPages) => {
        // Basic parser for "1, 3-5, 7" format
        // Returns array of arrays of 0-based page indices: [[0], [2,3,4], [6]]
        const parts = rangeStr.split(',').map(p => p.trim()).filter(p => p);
        const result = [];

        for (const part of parts) {
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(n => parseInt(n));
                if (!isNaN(start) && !isNaN(end) && start <= end && start >= 1 && end <= maxPages) {
                    const range = [];
                    for (let i = start; i <= end; i++) range.push(i - 1);
                    result.push(range);
                }
            } else {
                const page = parseInt(part);
                if (!isNaN(page) && page >= 1 && page <= maxPages) {
                    result.push([page - 1]);
                }
            }
        }
        return result;
    };

    const splitPDF = async () => {
        if (!file) return;
        setProcessing(true);

        try {
            const fileBuffer = await file.arrayBuffer();
            const srcPdf = await PDFDocument.load(fileBuffer);
            const zip = new JSZip();

            let splitGroups = [];

            if (splitMode === 'all') {
                const indices = srcPdf.getPageIndices();
                for (const idx of indices) {
                    splitGroups.push([idx]);
                }
            } else {
                // Range mode
                splitGroups = parseRanges(ranges, pageCount);
                if (splitGroups.length === 0) {
                    alert("Invalid page ranges. Please check your input.");
                    setProcessing(false);
                    return;
                }
            }

            // Create new PDFs for each group
            for (let i = 0; i < splitGroups.length; i++) {
                const group = splitGroups[i];
                const newPdf = await PDFDocument.create();
                const copiedPages = await newPdf.copyPages(srcPdf, group);
                copiedPages.forEach(page => newPdf.addPage(page));

                const pdfBytes = await newPdf.save();
                const suffix = splitMode === 'all' ? `page-${i + 1}` : `part-${i + 1}`;
                zip.file(`${file.name.replace(/\.pdf$/i, '')}-${suffix}.pdf`, pdfBytes);
            }

            // Generate Zip
            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, "split-documents.zip");

        } catch (err) {
            console.error("Error splitting PDF", err);
            alert("An error occurred while splitting the PDF.");
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
        "name": "Split PDF",
        "applicationCategory": "ProductivityApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Split PDF files online. Extract pages or save every page as a separate PDF. Free and secure.",
        "featureList": "Split by range, Extract all pages, Range parsing, Client-side processing",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "1020"
        }
    };

    return (
        <>
            <SEO
                title="Split PDF - Extract Pages from PDF Online"
                description="Split PDF files online for free. Extract specific pages or split entire document into separate files. Secure and easy to use."
                keywords="split pdf, extract pdf pages, separate pdf, cut pdf, free pdf splitter"
                schema={schema}
            />
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: 500 }}>
                    <ArrowLeft size={16} /> Back to Tools
                </Link>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Split PDF</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Separate PDF pages or extract pages into new documents.</p>
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
                                    <FileText size={32} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{file.name}</h3>
                                    <p style={{ color: 'var(--text-muted)' }}>{pageCount} pages</p>
                                </div>
                                <Button variant="secondary" onClick={() => setFile(null)} size="sm" style={{ marginLeft: 'auto' }}>
                                    Change File
                                </Button>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                                <button
                                    onClick={() => setSplitMode('all')}
                                    style={{
                                        flex: 1,
                                        padding: '1rem',
                                        border: `2px solid ${splitMode === 'all' ? 'var(--primary)' : 'var(--border)'}`,
                                        borderRadius: 'var(--radius-md)',
                                        background: splitMode === 'all' ? '#EEF2FF' : 'transparent',
                                        textAlign: 'left'
                                    }}
                                >
                                    <h4 style={{ fontWeight: 'bold', marginBottom: '0.25rem', color: splitMode === 'all' ? 'var(--primary)' : 'var(--text-main)' }}>Extract all pages</h4>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Save every page as a separate PDF file.</p>
                                </button>

                                <button
                                    onClick={() => setSplitMode('range')}
                                    style={{
                                        flex: 1,
                                        padding: '1rem',
                                        border: `2px solid ${splitMode === 'range' ? 'var(--primary)' : 'var(--border)'}`,
                                        borderRadius: 'var(--radius-md)',
                                        background: splitMode === 'range' ? '#EEF2FF' : 'transparent',
                                        textAlign: 'left'
                                    }}
                                >
                                    <h4 style={{ fontWeight: 'bold', marginBottom: '0.25rem', color: splitMode === 'range' ? 'var(--primary)' : 'var(--text-main)' }}>Split by range</h4>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Enter specific page ranges to extract.</p>
                                </button>
                            </div>

                            {splitMode === 'range' && (
                                <div style={{ marginBottom: '2rem' }}>
                                    <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>Page Ranges</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 1-5, 8, 11-13"
                                        value={ranges}
                                        onChange={(e) => setRanges(e.target.value)}
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
                                        Separate ranges with commas. Example: 1-5, 8, 11-13
                                    </p>
                                </div>
                            )}

                            <Button onClick={splitPDF} disabled={processing} size="lg" style={{ width: '100%' }}>
                                {processing ? 'Processing...' : (
                                    <><Scissors size={20} style={{ marginRight: '0.5rem' }} /> Split PDF</>
                                )}
                            </Button>
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '4rem' }}>
                    <section style={{ marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem' }}>Why use our PDF Splitter?</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', color: 'var(--text-main)' }}>
                            <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Exact Precision</h3>
                                <p style={{ color: 'var(--text-muted)' }}>Extract exactly the pages you need. Use custom ranges like "1-5, 8, 11-13" or save every page individually.</p>
                            </div>
                            <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Instant Download</h3>
                                <p style={{ color: 'var(--text-muted)' }}>No waiting in queues. Processing happens instantly in your browser, and files are zipped for easy download.</p>
                            </div>
                            <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Private & Secure</h3>
                                <p style={{ color: 'var(--text-muted)' }}>Your files never leave your computer. Splitting is done locally, ensuring maximum confidentiality.</p>
                            </div>
                        </div>
                    </section>

                    <section style={{ marginBottom: '3rem', padding: '2rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>How to split a PDF file</h2>
                        <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <li>Upload the PDF file you want to split.</li>
                            <li>Choose 'Extract all pages' to get separate files for every page.</li>
                            <li>Or choose 'Split by range' and enter specific page numbers (e.g. 1-5, 10).</li>
                            <li>Click 'Split PDF' and download your new documents.</li>
                        </ol>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Frequently Asked Questions</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[
                                { q: "Can I extract just one page?", a: "Yes, simply select 'Split by range' and enter the page number you want (e.g., '5') to extract just that single page." },
                                { q: "How do I format page ranges?", a: "You can use dashes for ranges and commas for separate sections. For example, '1-5, 8, 10-12' will extract pages 1 through 5, page 8, and pages 10 through 12." },
                                { q: "Is the splitter free?", a: "Yes, our Split PDF tool is completely free to use with no limits on file size or number of uses." },
                                { q: "Do I need to install any software?", a: "No, everything works directly in your web browser. No plugins or downloads required." }
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

export default SplitPDF;
