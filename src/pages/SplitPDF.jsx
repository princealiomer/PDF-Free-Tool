import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import FileUploader from '../components/common/FileUploader';
import Button from '../components/common/Button';
import { ArrowLeft, Scissors, Download, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

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

    return (
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
        </div>
    );
};

export default SplitPDF;
