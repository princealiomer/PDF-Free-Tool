import React, { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import FileUploader from '../components/common/FileUploader';
import Button from '../components/common/Button';
import { ArrowLeft, Image as ImageIcon, Archive } from 'lucide-react';
import { Link } from 'react-router-dom';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

const PDFToImages = () => {
    const [file, setFile] = useState(null);
    const [processing, setProcessing] = useState(false);

    // We can allow users to select output format (JPG/PNG) - Default JPG
    const [format, setFormat] = useState('image/jpeg');

    const handleFile = (files) => {
        if (files.length > 0) setFile(files[0]);
    };

    const convertToImages = async () => {
        if (!file) return;
        setProcessing(true);

        try {
            const buffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(buffer).promise;
            const pageCount = pdf.numPages;
            const zip = new JSZip();

            for (let i = 1; i <= pageCount; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2.0 }); // Scale 2.0 for better quality
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context, viewport: viewport }).promise;

                // Convert to blob
                const blob = await new Promise(resolve => canvas.toBlob(resolve, format, 0.9));
                const ext = format === 'image/png' ? 'png' : 'jpg';
                zip.file(`page-${i}.${ext}`, blob);
            }

            // Generate zip
            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, `${file.name.replace(/\.pdf$/i, '')}-images.zip`);

        } catch (err) {
            console.error("Error converting to images", err);
            alert("Failed to convert PDF to images.");
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
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>PDF to JPG</h1>
                <p style={{ color: 'var(--text-muted)' }}>Convert each page of your PDF to an image.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {!file ? (
                    <FileUploader onFilesSelected={handleFile} label="Select PDF file" />
                ) : (
                    <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                            <div style={{ background: 'var(--primary)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: 'white' }}>
                                <ImageIcon size={32} />
                            </div>
                            <h3>{file.name}</h3>
                            <Button variant="secondary" onClick={() => setFile(null)} size="sm" style={{ marginLeft: 'auto' }}>Change File</Button>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>Output Format</label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    onClick={() => setFormat('image/jpeg')}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        border: `2px solid ${format === 'image/jpeg' ? 'var(--primary)' : 'var(--border)'}`,
                                        borderRadius: 'var(--radius-md)',
                                        background: format === 'image/jpeg' ? '#EEF2FF' : 'white',
                                        fontWeight: 500
                                    }}
                                >JPG (Smaller)</button>
                                <button
                                    onClick={() => setFormat('image/png')}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        border: `2px solid ${format === 'image/png' ? 'var(--primary)' : 'var(--border)'}`,
                                        borderRadius: 'var(--radius-md)',
                                        background: format === 'image/png' ? '#EEF2FF' : 'white',
                                        fontWeight: 500
                                    }}
                                >PNG (Higher Quality)</button>
                            </div>
                        </div>

                        <Button onClick={convertToImages} disabled={processing} size="lg" style={{ width: '100%' }}>
                            {processing ? 'Converting...' : <><Archive size={20} style={{ marginRight: '0.5rem' }} /> Convert to Images</>}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PDFToImages;
