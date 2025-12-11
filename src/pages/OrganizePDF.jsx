import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import FileUploader from '../components/common/FileUploader';
import Button from '../components/common/Button';
import { ArrowLeft, ArrowLeftRight, Save, LayoutGrid, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

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

    return (
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
        </div>
    );
};

export default OrganizePDF;
