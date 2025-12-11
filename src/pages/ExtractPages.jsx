import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import FileUploader from '../components/common/FileUploader';
import Button from '../components/common/Button';
import { ArrowLeft, FileInput, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const ExtractPages = () => {
    const [file, setFile] = useState(null);
    const [pdfDoc, setPdfDoc] = useState(null);
    const [pagesToExtract, setPagesToExtract] = useState([]);
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
            setPagesToExtract([]);
            setInputVal('');
        } catch (err) {
            console.error("Error loading PDF", err);
            alert("Invalid PDF file");
            setFile(null);
        }
    };

    const handleProcess = async () => {
        if (!pdfDoc || pagesToExtract.length === 0) return;
        setProcessing(true);

        try {
            const newPdf = await PDFDocument.create();
            // Extract allows reordering if we just iterate InputVal parts, but here we use sorted unique indices for simplicity, 
            // or we can strictly follow user order. 
            // Let's use the pagesToExtract array which is currently sorted unique.

            const copiedPages = await newPdf.copyPages(pdfDoc, pagesToExtract);
            copiedPages.forEach(p => newPdf.addPage(p));

            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            saveAs(blob, `${file.name.replace(/\.pdf$/i, '')}-extracted.pdf`);

        } catch (err) {
            console.error("Error extracting pages", err);
            alert("Failed to extract pages.");
        } finally {
            setProcessing(false);
        }
    };

    const parseInput = (val) => {
        setInputVal(val);
        const parts = val.split(',').map(p => p.trim()).filter(p => p);
        const indices = []; // Allow duplicates and order if user wants specific order? 
        // Typical "Extract" UI allows creating a new PDF with specific pages.
        // Let's stick to Set for now to avoid complexity of "1,1,1" unless requested.
        const indicesSet = new Set();

        for (const part of parts) {
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(n => parseInt(n));
                if (!isNaN(start) && !isNaN(end) && start <= end) {
                    for (let i = start; i <= end; i++) {
                        if (i >= 1 && i <= pageCount) indicesSet.add(i - 1);
                    }
                }
            } else {
                const page = parseInt(part);
                if (!isNaN(page) && page >= 1 && page <= pageCount) {
                    indicesSet.add(page - 1);
                }
            }
        }
        setPagesToExtract(Array.from(indicesSet).sort((a, b) => a - b));
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: 500 }}>
                <ArrowLeft size={16} /> Back to Tools
            </Link>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Extract Pages</h1>
                <p style={{ color: 'var(--text-muted)' }}>Get a new PDF with only the desired pages.</p>
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

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>
                                Pages to Extract
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. 1, 3-5"
                                value={inputVal}
                                onChange={(e) => parseInput(e.target.value)}
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
                                {pagesToExtract.length > 0
                                    ? `Selected ${pagesToExtract.length} pages to extract.`
                                    : 'Enter page numbers to extract.'}
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))', gap: '0.5rem', marginBottom: '2rem', maxHeight: '200px', overflowY: 'auto', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                            {Array.from({ length: pageCount }, (_, i) => i).map(pageIdx => {
                                const isSelected = pagesToExtract.includes(pageIdx);
                                return (
                                    <div
                                        key={pageIdx}
                                        onClick={() => {
                                            if (isSelected) {
                                                setPagesToExtract(prev => prev.filter(p => p !== pageIdx));
                                            } else {
                                                setPagesToExtract(prev => [...prev, pageIdx].sort((a, b) => a - b));
                                            }
                                        }}
                                        style={{
                                            aspectRatio: '1',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '1px solid',
                                            borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                                            backgroundColor: isSelected ? '#EEF2FF' : 'white',
                                            color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                                            borderRadius: 'var(--radius-sm)',
                                            cursor: 'pointer',
                                            fontSize: '0.75rem',
                                            fontWeight: 500
                                        }}
                                    >
                                        {pageIdx + 1}
                                    </div>
                                )
                            })}
                        </div>

                        <Button onClick={handleProcess} disabled={processing || pagesToExtract.length === 0} size="lg" style={{ width: '100%' }}>
                            {processing ? 'Processing...' : (
                                <><FileInput size={20} style={{ marginRight: '0.5rem' }} /> Extract Pages</>
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExtractPages;
