import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import FileUploader from '../components/common/FileUploader';
import Button from '../components/common/Button';
import { ArrowLeft, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';

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

    return (
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
    );
};

export default RepairPDF;
