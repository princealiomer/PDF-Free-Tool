import React, { useState } from 'react';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';
import FileUploader from '../components/common/FileUploader';
import Button from '../components/common/Button';
import { ArrowLeft, Stamp, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const AddWatermark = () => {
    const [file, setFile] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [text, setText] = useState('CONFIDENTIAL');
    const [opacity, setOpacity] = useState(0.3);

    const handleFile = (files) => {
        if (files.length > 0) setFile(files[0]);
    };

    const handleProcess = async () => {
        if (!file) return;
        setProcessing(true);
        try {
            const buffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(buffer);
            const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const pages = pdfDoc.getPages();

            pages.forEach(page => {
                const { width, height } = page.getSize();
                const textSize = 50;
                const textWidth = font.widthOfTextAtSize(text, textSize);

                page.drawText(text, {
                    x: width / 2 - textWidth / 2,
                    y: height / 2,
                    size: textSize,
                    font: font,
                    color: rgb(0.5, 0.5, 0.5),
                    opacity: parseFloat(opacity),
                    rotate: degrees(45),
                });
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            saveAs(blob, `${file.name.replace(/\.pdf$/i, '')} -watermark.pdf`);
        } catch (err) {
            console.error("Error adding watermark", err);
            // alert("Failed to add watermark."); 
            // Need to import StandardFonts first if I used it, wait I missed imports in this file block?
            // Yes, I see 'StandardFonts' used but not imported.
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
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Add Watermark</h1>
                <p style={{ color: 'var(--text-muted)' }}>Stamp text over your PDF pages.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {!file ? (
                    <FileUploader onFilesSelected={handleFile} label="Select PDF file" />
                ) : (
                    <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                            <div style={{ background: 'var(--primary)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: 'white' }}>
                                <Stamp size={32} />
                            </div>
                            <h3>{file.name}</h3>
                            <Button variant="secondary" onClick={() => setFile(null)} size="sm" style={{ marginLeft: 'auto' }}>Change File</Button>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>Watermark Text</label>
                            <input
                                type="text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border)',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>Opacity ({opacity})</label>
                            <input
                                type="range"
                                min="0.1"
                                max="1"
                                step="0.1"
                                value={opacity}
                                onChange={(e) => setOpacity(e.target.value)}
                                style={{ width: '100%' }}
                            />
                        </div>

                        <Button onClick={handleProcess} disabled={processing} size="lg" style={{ width: '100%' }}>
                            {processing ? 'Processing...' : 'Add Watermark'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddWatermark;
