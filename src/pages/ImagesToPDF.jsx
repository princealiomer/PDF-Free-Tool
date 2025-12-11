import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import FileUploader from '../components/common/FileUploader';
import Button from '../components/common/Button';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const ImagesToPDF = () => {
    const [files, setFiles] = useState([]);
    const [processing, setProcessing] = useState(false);

    const handleFiles = (newFiles) => {
        setFiles(prev => [...prev, ...Array.from(newFiles)]);
    };

    const processImages = async () => {
        if (files.length === 0) return;
        setProcessing(true);

        try {
            const doc = new jsPDF();

            // Helper to load image
            const loadImage = (file) => new Promise((resolve) => {
                const img = new Image();
                img.src = URL.createObjectURL(file);
                img.onload = () => resolve({ w: img.width, h: img.height, url: img.src });
            });

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (i > 0) doc.addPage();

                // Get dimensions
                const imgParams = await loadImage(file);

                // Fit to page (A4 usually: 210 x 297 mm)
                const pdfWidth = doc.internal.pageSize.getWidth();
                const pdfHeight = doc.internal.pageSize.getHeight();

                const ratio = Math.min(pdfWidth / imgParams.w, pdfHeight / imgParams.h);
                const w = imgParams.w * ratio;
                const h = imgParams.h * ratio;
                const x = (pdfWidth - w) / 2;
                const y = (pdfHeight - h) / 2;

                doc.addImage(imgParams.url, 'JPEG', x, y, w, h);
            }

            // Save robustly
            const pdfBytes = doc.output('blob');
            saveAs(pdfBytes, 'images-combined.pdf');

        } catch (err) {
            console.error("Error converting images", err);
            alert("Failed to convert images.");
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
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>JPG to PDF</h1>
                <p style={{ color: 'var(--text-muted)' }}>Convert images to a single PDF file.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {files.length === 0 ? (
                    <FileUploader
                        onFilesSelected={handleFiles}
                        multiple={true}
                        accept="image/*"
                        label="Select Images"
                    />
                ) : (
                    <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            {files.map((f, i) => (
                                <img key={i} src={URL.createObjectURL(f)} style={{ width: '100%', borderRadius: 'var(--radius-md)', aspectRatio: '1', objectFit: 'cover' }} />
                            ))}
                        </div>
                        <Button onClick={processImages} disabled={processing} size="lg" style={{ width: '100%' }}>
                            {processing ? 'Converting...' : 'Convert to PDF'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImagesToPDF;
