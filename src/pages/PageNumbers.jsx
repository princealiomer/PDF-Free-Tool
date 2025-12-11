import React, { useState } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';
import FileUploader from '../components/common/FileUploader';
import Button from '../components/common/Button';
import { ArrowLeft, Hash, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const PageNumbers = () => {
    const [file, setFile] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [position, setPosition] = useState('bottom-center'); // bottom-center, bottom-left, bottom-right, top...

    const handleFile = (files) => {
        if (files.length > 0) setFile(files[0]);
    };

    const handleProcess = async () => {
        if (!file) return;
        setProcessing(true);
        try {
            const buffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(buffer);
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const pages = pdfDoc.getPages();
            const count = pages.length;

            pages.forEach((page, idx) => {
                const { width, height } = page.getSize();
                const text = `${idx + 1} / ${count}`;
                const textSize = 12;
                const textWidth = font.widthOfTextAtSize(text, textSize);
                const margin = 20;

                let x, y;

                switch (position) {
                    case 'bottom-left': x = margin; y = margin; break;
                    case 'bottom-right': x = width - textWidth - margin; y = margin; break;
                    case 'top-left': x = margin; y = height - textSize - margin; break;
                    case 'top-center': x = (width - textWidth) / 2; y = height - textSize - margin; break;
                    case 'top-right': x = width - textWidth - margin; y = height - textSize - margin; break;
                    case 'bottom-center': default: x = (width - textWidth) / 2; y = margin; break;
                }

                page.drawText(text, {
                    x,
                    y,
                    size: textSize,
                    font: font,
                    color: rgb(0, 0, 0),
                });
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            saveAs(blob, `${file.name.replace(/\.pdf$/i, '')}-numbered.pdf`);
        } catch (err) {
            console.error("Error adding page numbers", err);
            alert("Failed to add page numbers.");
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
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Add Page Numbers</h1>
                <p style={{ color: 'var(--text-muted)' }}>Number PDF pages easily.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {!file ? (
                    <FileUploader onFilesSelected={handleFile} label="Select PDF file" />
                ) : (
                    <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                            <div style={{ background: 'var(--primary)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: 'white' }}>
                                <Hash size={32} />
                            </div>
                            <h3>{file.name}</h3>
                            <Button variant="secondary" onClick={() => setFile(null)} size="sm" style={{ marginLeft: 'auto' }}>Change File</Button>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>Position</label>
                            <select
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border)',
                                    fontFamily: 'inherit'
                                }}
                            >
                                <option value="bottom-center">Bottom Center</option>
                                <option value="bottom-right">Bottom Right</option>
                                <option value="bottom-left">Bottom Left</option>
                                <option value="top-center">Top Center</option>
                                <option value="top-right">Top Right</option>
                                <option value="top-left">Top Left</option>
                            </select>
                        </div>

                        <Button onClick={handleProcess} disabled={processing} size="lg" style={{ width: '100%' }}>
                            {processing ? 'Processing...' : 'Add Page Numbers'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PageNumbers;
