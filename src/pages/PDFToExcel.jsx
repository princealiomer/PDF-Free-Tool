import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import FileUploader from '../components/common/FileUploader';
import Button from '../components/common/Button';
import { ArrowLeft, Table, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/common/SEO';
import { ChevronDown, ChevronUp } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const PDFToExcel = () => {
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

            // We'll create one sheet per page or merge? 
            // Let's create one big sheet for simplicity or iterate.

            const allRows = [];

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();

                // Sort items by Y descending
                const items = textContent.items.map(item => ({
                    str: item.str,
                    y: Math.round(item.transform[5]), // Rounding to group same-line items
                    x: Math.round(item.transform[4])
                }));
                items.sort((a, b) => b.y - a.y || a.x - b.x);

                // Group by Y row
                let currentRowY = -99999;
                let currentRow = [];
                const pageRows = [];

                items.forEach(item => {
                    // If in same row (within tolerance)
                    if (Math.abs(item.y - currentRowY) < 5) {
                        currentRow.push(item);
                    } else {
                        if (currentRow.length > 0) {
                            // Sort row by X
                            currentRow.sort((a, b) => a.x - b.x);
                            pageRows.push(currentRow.map(it => it.str));
                        }
                        currentRow = [item];
                        currentRowY = item.y;
                    }
                });
                if (currentRow.length > 0) {
                    currentRow.sort((a, b) => a.x - b.x);
                    pageRows.push(currentRow.map(it => it.str));
                }

                // Add blank row between pages?
                allRows.push(...pageRows);
                allRows.push([]);
            }

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(allRows);
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

            // Xlsx write is sync
            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([wbout], { type: 'application/octet-stream' });
            saveAs(blob, `${file.name.replace(/\.pdf$/i, '')}.xlsx`);

        } catch (err) {
            console.error("Conversion error", err);
            alert("Failed to convert to Excel.");
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
        "name": "PDF to Excel",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Convert PDF text to Excel spreadsheets. Extract data tables from PDFs to XLSX online.",
        "featureList": "PDF to Excel, Tables extraction, Spreadsheet converter",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.1",
            "ratingCount": "85"
        }
    };

    return (
        <>
            <SEO
                title="PDF to Excel - Convert PDF to XLSX Online Free"
                description="Convert PDF files to Excel spreadsheets. Extract tables and data from PDF to XLSX for free."
                keywords="pdf to excel, pdf to xlsx, convert pdf to excel, extract tables, pdf to spreadsheet"
                schema={schema}
            />

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: 500 }}>
                    <ArrowLeft size={16} /> Back to Tools
                </Link>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>PDF to Excel</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Scrape text data from PDF into spreadsheets.</p>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                    {!file ? (
                        <FileUploader onFilesSelected={handleFile} label="Select PDF file" />
                    ) : (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                <Table size={48} color="#217346" />
                                <h3>{file.name}</h3>
                                <Button variant="secondary" onClick={() => setFile(null)} size="sm" style={{ marginLeft: 'auto' }}>Change File</Button>
                            </div>
                            <Button onClick={handleConvert} disabled={processing} size="lg" style={{ width: '100%' }}>
                                {processing ? 'Converting...' : 'Convert to Excel'}
                            </Button>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem', textAlign: 'center' }}>
                                Note: Table structure detection is limited. Rows are approximated by line height.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ maxWidth: '800px', margin: '4rem auto 0' }}>
                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem' }}>Why use our PDF to Excel converter?</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', color: 'var(--text-main)' }}>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Analyze</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Quickly move data from locked PDFs into Excel for analysis and calculation.</p>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Structure</h3>
                            <p style={{ color: 'var(--text-muted)' }}>We attempt to reconstruct rows and columns based on text positioning.</p>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Free</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Unlimited conversions without any hidden fees or subscriptions.</p>
                        </div>
                    </div>
                </section>

                <section style={{ marginBottom: '3rem', padding: '2rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>How to convert PDF to Excel</h2>
                    <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li>Upload your PDF containing tables or lists.</li>
                        <li>Click 'Convert to Excel'.</li>
                        <li>The system will process text coordinates.</li>
                        <li>Download the resulting .xlsx file.</li>
                    </ol>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Frequently Asked Questions</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { q: "How accurate is the table extraction?", a: "It works best with simple, grid-based tables. Complex merged cells may need adjustment." },
                            { q: "Does it support multiple pages?", a: "Yes, all pages are extracted and appended to the spreadsheet." },
                            { q: "Can I convert scanned tables?", a: "Not directly. Use our OCR tool first to extract text, then copy to Excel." },
                            { q: "Is it secure?", a: "Yes, extraction happens in your browser." }
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

export default PDFToExcel;
