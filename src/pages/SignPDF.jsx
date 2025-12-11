
import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import FileUploader from '../components/common/FileUploader';
import Button from '../components/common/Button';
import { ArrowLeft, PenTool, Type } from 'lucide-react';
import { Link } from 'react-router-dom';

const SignPDF = () => {
    const [file, setFile] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [signatureImage, setSignatureImage] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);

    // Canvas for drawing signature
    const canvasRef = useRef(null);
    const [isCanvasEmpty, setIsCanvasEmpty] = useState(true);

    const handleFile = (files) => {
        if (files.length > 0) setFile(files[0]);
    };

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
        setIsCanvasEmpty(false);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setIsCanvasEmpty(true);
        setSignatureImage(null);
    };

    const saveSignature = () => {
        const canvas = canvasRef.current;
        setSignatureImage(canvas.toDataURL('image/png'));
    };

    const handleSign = async () => {
        if (!file || !signatureImage) return;
        setProcessing(true);

        try {
            const buffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(buffer);

            // Embed the signature image
            const signatureImageBytes = await fetch(signatureImage).then(res => res.arrayBuffer());
            const signatureImageEmbed = await pdfDoc.embedPng(signatureImageBytes);

            // Get dimensions
            const { width, height } = signatureImageEmbed.scale(0.5); // Start with 50% scale

            // Place on LAST page by default, bottom right?
            // Ideally we need a UI to place it. For now, let's put it on ALL pages bottom right corner.
            const pages = pdfDoc.getPages();

            pages.forEach(page => {
                page.drawImage(signatureImageEmbed, {
                    x: page.getWidth() - width - 20,
                    y: 20,
                    width,
                    height,
                });
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            saveAs(blob, `${file.name.replace(/\.pdf$/i, '')} -signed.pdf`);
        } catch (err) {
            console.error("Error signing PDF", err);
            alert("Failed to sign PDF.");
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
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Sign PDF</h1>
                <p style={{ color: 'var(--text-muted)' }}>Draw your signature and add it to the document.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {!file ? (
                    <FileUploader onFilesSelected={handleFile} label="Select PDF file" />
                ) : (
                    <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                            <div style={{ background: 'var(--primary)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: 'white' }}>
                                <PenTool size={32} />
                            </div>
                            <h3>{file.name}</h3>
                            <Button variant="secondary" onClick={() => setFile(null)} size="sm" style={{ marginLeft: 'auto' }}>Change File</Button>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <h4 style={{ marginBottom: '0.5rem', fontWeight: 500 }}>Draw Signature</h4>
                            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'white', overflow: 'hidden' }}>
                                <canvas
                                    ref={canvasRef}
                                    width={500}
                                    height={200}
                                    style={{ width: '100%', height: '200px', cursor: 'crosshair', touchAction: 'none' }}
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                    onTouchStart={startDrawing}
                                    onTouchMove={draw}
                                    onTouchEnd={stopDrawing}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem', gap: '0.5rem' }}>
                                <Button variant="secondary" size="sm" onClick={clearSignature}>Clear</Button>
                                <Button variant="primary" size="sm" onClick={saveSignature} disabled={isCanvasEmpty}>Apply Signature</Button>
                            </div>
                        </div>

                        {signatureImage && (
                            <div style={{ marginBottom: '2rem', background: '#F0FDF4', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #BBF7D0', color: '#15803d' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontWeight: 'bold' }}>Signature Applied</span>
                                    <span>- will be placed on bottom right of all pages.</span>
                                </div>
                                <img src={signatureImage} alt="Signature Preview" style={{ height: '40px', marginTop: '0.5rem', border: '1px dashed #ccc' }} />
                            </div>
                        )}

                        <Button onClick={handleSign} disabled={processing || !signatureImage} size="lg" style={{ width: '100%' }}>
                            {processing ? 'Signing...' : 'Sign Document'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SignPDF;
