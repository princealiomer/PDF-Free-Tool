import React, { useState } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import { saveAs } from 'file-saver';
import FileUploader from '../components/common/FileUploader';
import Button from '../components/common/Button';
import { ArrowLeft, RotateCw, RefreshCw, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const RotatePDF = () => {
    const [file, setFile] = useState(null);
    const [rotation, setRotation] = useState(0); // 0, 90, 180, 270 relative add
    const [processing, setProcessing] = useState(false);

    const handleFile = (files) => {
        if (files.length > 0) {
            setFile(files[0]);
            setRotation(0);
        }
    };

    const rotateAll = () => {
        setRotation(prev => (prev + 90) % 360);
    };

    const handleProcess = async () => {
        if (!file) return;
        setProcessing(true);
        try {
            const buffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(buffer);
            const pages = pdfDoc.getPages();

            pages.forEach(page => {
                // Add rotation to existing rotation
                const current = page.getRotation().angle;
                page.setRotation(degrees(current + rotation));
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            saveAs(blob, `${file.name.replace(/\.pdf$/i, '')}-rotated.pdf`);
        } catch (err) {
            console.error("Error rotating PDF", err);
            alert("Failed to rotate PDF.");
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
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Rotate PDF</h1>
                <p style={{ color: 'var(--text-muted)' }}>Rotate your PDF pages permanently.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {!file ? (
                    <FileUploader onFilesSelected={handleFile} label="Select PDF file" />
                ) : (
                    <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                            <div style={{ background: 'var(--primary)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: 'white' }}>
                                <RotateCw size={32} />
                            </div>
                            <h3>{file.name}</h3>
                            <Button variant="secondary" onClick={() => setFile(null)} size="sm" style={{ marginLeft: 'auto' }}>Change File</Button>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2rem', padding: '3rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
                            <div style={{
                                transition: 'transform 0.3s ease',
                                transform: `rotate(${rotation}deg)`,
                                background: 'white',
                                width: '120px',
                                height: '160px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: 'var(--shadow-md)',
                                border: '1px solid var(--border)'
                            }}>
                                <FileText size={40} color="var(--primary)" />
                            </div>

                            <Button onClick={rotateAll}>
                                <RefreshCw size={20} style={{ marginRight: '0.5rem' }} /> Rotate +90°
                            </Button>
                        </div>

                        <Button onClick={handleProcess} disabled={processing} size="lg" style={{ width: '100%' }}>
                            {processing ? 'Saving...' : 'Save Rotated PDF'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RotatePDF;
