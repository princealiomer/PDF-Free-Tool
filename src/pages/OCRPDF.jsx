import React, { useState, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import FileUploader from '../components/common/FileUploader';
import Button from '../components/common/Button';
import { ArrowLeft, Search, FileText, Copy, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';

const OCRPDF = () => {
    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('Idle');
    const [recognizedText, setRecognizedText] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleFile = (files) => {
        if (files.length > 0) {
            setFile(files[0]);
            setRecognizedText('');
            setProgress(0);
            setStatus('Ready to scan');
        }
    };

    const handleOCR = async () => {
        if (!file) return;
        setProcessing(true);
        setStatus('Initializing...');

        try {
            const { data: { text } } = await Tesseract.recognize(
                file,
                'eng',
                {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            setProgress(Math.round(m.progress * 100));
                            setStatus(`Scaning: ${Math.round(m.progress * 100)}%`);
                        } else {
                            setStatus(m.status);
                        }
                    }
                }
            );
            setRecognizedText(text);
            setStatus('Completed');
        } catch (err) {
            console.error(err);
            setStatus('Error occurred');
            alert('Failed to recognize text.');
        } finally {
            setProcessing(false);
        }
    };

    const handleDownload = () => {
        if (!recognizedText) return;
        const doc = new jsPDF();
        const splitText = doc.splitTextToSize(recognizedText, 180);
        doc.text(splitText, 15, 15);

        // Helper to ensure valid PDF filename
        const getName = (name) => {
            const lastDot = name.lastIndexOf('.');
            const base = lastDot !== -1 ? name.substring(0, lastDot) : name;
            return `${base}-ocr.pdf`;
        };

        doc.save(getName(file.name));
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(recognizedText);
        alert('Copied to clipboard!');
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: 500 }}>
                <ArrowLeft size={16} /> Back to Tools
            </Link>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>OCR PDF</h1>
                <p style={{ color: 'var(--text-muted)' }}>Extract text from scanned PDF images or image files.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                        {!file ? (
                            <FileUploader onFilesSelected={handleFile} label="Upload Image/PDF" accept="image/*,application/pdf" />
                        ) : (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ marginBottom: '1rem', background: '#f3f4f6', padding: '1rem', borderRadius: '8px' }}>
                                    <FileText size={48} color="var(--primary)" />
                                    <p style={{ marginTop: '0.5rem', fontWeight: 500 }}>{file.name}</p>
                                </div>

                                {processing && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                                            <div style={{ width: `${progress}%`, background: 'var(--primary)', height: '100%', transition: 'width 0.3s' }}></div>
                                        </div>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{status}</p>
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                    <Button onClick={handleOCR} disabled={processing} size="lg">
                                        {processing ? 'Scanning...' : <><Search size={20} style={{ marginRight: '0.5rem' }} /> Start OCR</>}
                                    </Button>
                                    <Button onClick={() => setFile(null)} variant="secondary" disabled={processing}>Change File</Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', height: '500px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h3 style={{ fontWeight: 600 }}>Extracted Text</h3>
                        {recognizedText && (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <Button size="sm" variant="secondary" onClick={handleCopy}><Copy size={14} /> Copy</Button>
                                <Button size="sm" onClick={handleDownload}><Download size={14} /> Download PDF</Button>
                            </div>
                        )}
                    </div>
                    <textarea
                        value={recognizedText}
                        readOnly
                        placeholder="Recognized text will appear here..."
                        style={{
                            flex: 1,
                            width: '100%',
                            padding: '1rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)',
                            resize: 'none',
                            fontFamily: 'inherit',
                            lineHeight: 1.6
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default OCRPDF;
