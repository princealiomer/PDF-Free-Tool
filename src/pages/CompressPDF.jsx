import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import * as pdfjsLib from 'pdfjs-dist';
import FileUploader from '../components/common/FileUploader';
import Button from '../components/common/Button';
import { ArrowLeft, Minimize2, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

const CompressPDF = () => {
    const [file, setFile] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [mode, setMode] = useState('basic'); // 'basic' | 'strong'

    const handleFile = (files) => {
        if (files.length > 0) setFile(files[0]);
    };

    const handleCompress = async () => {
        if (!file) return;
        setProcessing(true);
        try {
            if (mode === 'basic') {
                // Basic: Repack with Object Streams enabled
                const buffer = await file.arrayBuffer();
                const srcPdf = await PDFDocument.load(buffer);

                // Strategy: Create new doc and copy pages. This essentially "garbage collects" unused objects
                // and repacks the file. Crucially, we MUST enable useObjectStreams.
                const newPdf = await PDFDocument.create();
                const indices = srcPdf.getPageIndices();
                const copiedPages = await newPdf.copyPages(srcPdf, indices);
                copiedPages.forEach(p => newPdf.addPage(p));

                const pdfBytes = await newPdf.save({ useObjectStreams: true });
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                saveAs(blob, `${file.name.replace(/\.pdf$/i, '')}-optimized.pdf`);

            } else {
                // Strong: Rasterize pages to JPEG (Lossy)
                const buffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument(buffer).promise;
                const newPdf = await PDFDocument.create();

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    // Scale: 1.5 standard, allow reducing for more compression? 
                    // Let's stick to 1.5 for readability but compress JPEG quality.
                    const viewport = page.getViewport({ scale: 1.5 });
                    const canvas = document.createElement('canvas');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    const ctx = canvas.getContext('2d');
                    await page.render({ canvasContext: ctx, viewport }).promise;

                    // Strong JPEG compression (0.6 quality)
                    const imgData = canvas.toDataURL('image/jpeg', 0.6);
                    const imgBytes = await fetch(imgData).then(res => res.arrayBuffer());

                    const jpgImage = await newPdf.embedJpg(imgBytes);
                    const pdfPage = newPdf.addPage([viewport.width, viewport.height]);
                    pdfPage.drawImage(jpgImage, {
                        x: 0,
                        y: 0,
                        width: viewport.width,
                        height: viewport.height
                    });
                }

                const pdfBytes = await newPdf.save({ useObjectStreams: true });
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                saveAs(blob, `${file.name.replace(/\.pdf$/i, '')}-minimized.pdf`);
            }

        } catch (err) {
            console.error("Error compressing PDF", err);
            alert("Failed to compress PDF.");
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
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Compress PDF</h1>
                <p style={{ color: 'var(--text-muted)' }}>Reduce file size while optimizing for quality.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {!file ? (
                    <FileUploader onFilesSelected={handleFile} label="Select PDF file" />
                ) : (
                    <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                            <div style={{ background: 'var(--primary)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: 'white' }}>
                                <Minimize2 size={32} />
                            </div>
                            <h3>{file.name}</h3>
                            <Button variant="secondary" onClick={() => setFile(null)} size="sm" style={{ marginLeft: 'auto' }}>Change File</Button>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                            <button
                                onClick={() => setMode('basic')}
                                style={{
                                    flex: 1,
                                    padding: '1rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: mode === 'basic' ? '2px solid var(--primary)' : '1px solid var(--border)',
                                    background: mode === 'basic' ? '#EEF2FF' : 'white',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                }}
                            >
                                <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Basic Compression</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Optimizes structure. Keeps text selectable. Good quality.</div>
                            </button>

                            <button
                                onClick={() => setMode('strong')}
                                style={{
                                    flex: 1,
                                    padding: '1rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: mode === 'strong' ? '2px solid var(--primary)' : '1px solid var(--border)',
                                    background: mode === 'strong' ? '#EEF2FF' : 'white',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                }}
                            >
                                <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Strong Compression</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Converts to images. Text NOT selectable. Smallest size.</div>
                            </button>
                        </div>

                        <Button onClick={handleCompress} disabled={processing} size="lg" style={{ width: '100%' }}>
                            {processing ? 'Compressing...' : <><Minimize2 size={20} style={{ marginRight: '0.5rem' }} /> Compress PDF</>}
                        </Button>

                        {mode === 'strong' && (
                            <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#FFF7ED', borderRadius: 'var(--radius-md)', display: 'flex', gap: '0.5rem', color: '#C05621', fontSize: '0.85rem', alignItems: 'flex-start' }}>
                                <AlertTriangle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                                Strong compression will convert this document into images. You will not be able to select or copy text in the output file.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompressPDF;
