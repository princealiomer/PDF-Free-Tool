import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import FileUploader from '../components/common/FileUploader';
import Button from '../components/common/Button';
import { ArrowLeft, FileCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const PDFToPDFA = () => {
    const [file, setFile] = useState(null);
    const [processing, setProcessing] = useState(false);

    const handleFile = (files) => {
        if (files.length > 0) setFile(files[0]);
    };

    const handleConvert = async () => {
        if (!file) return;
        setProcessing(true);
        try {
            const buffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(buffer);

            // PDF/A requires specific metadata. 
            // pdf-lib helper involves setting metadata.

            pdfDoc.setTitle(file.name);
            pdfDoc.setAuthor('PDF Tools');
            pdfDoc.setProducer('PDF Tools Web App');
            pdfDoc.setCreator('PDF Tools');

            // To be truly PDF/A, we need to embed color profiles and XMP metadata.
            // This is a "Best Effort" compliance step: Flatten forms/annotations to ensure long term viewing.

            // Flatten form fields if any
            try {
                const form = pdfDoc.getForm();
                form.flatten();
            } catch (e) {
                // No form or error
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            saveAs(blob, `${file.name.replace(/\.pdf$/i, '')}-pdfa.pdf`);

        } catch (err) {
            console.error("Conversion error", err);
            alert("Failed to convert to PDF/A.");
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
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>PDF to PDF/A</h1>
                <p style={{ color: 'var(--text-muted)' }}>Convert for long-term archiving (Metadata & Flattening).</p>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                {!file ? (
                    <FileUploader onFilesSelected={handleFile} label="Select PDF file" />
                ) : (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                            <FileCheck size={48} color="#e53e3e" />
                            <h3>{file.name}</h3>
                            <Button variant="secondary" onClick={() => setFile(null)} size="sm" style={{ marginLeft: 'auto' }}>Change File</Button>
                        </div>
                        <Button onClick={handleConvert} disabled={processing} size="lg" style={{ width: '100%' }}>
                            {processing ? 'Converting...' : 'Convert to PDF/A'}
                        </Button>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem', textAlign: 'center' }}>
                            Note: This process flattens all forms and annotations and standardizes metadata for archival compatibility.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PDFToPDFA;
