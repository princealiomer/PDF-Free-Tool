import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import Button from '../components/common/Button';
import { ArrowLeft, Camera, X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const ScanToPDF = () => {
    const [images, setImages] = useState([]);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [processing, setProcessing] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const startCamera = async () => {
        setIsCameraActive(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera", err);
            alert("Could not access camera. Please allow permissions.");
            setIsCameraActive(false);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
        setIsCameraActive(false);
    };

    const captureImage = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageUrl = canvas.toDataURL('image/jpeg', 0.8);
        setImages(prev => [...prev, imageUrl]);
    };

    const generatePDF = () => {
        if (images.length === 0) return;
        setProcessing(true);
        try {
            const doc = new jsPDF();

            images.forEach((imgUrl, i) => {
                if (i > 0) doc.addPage();

                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();

                // Assuming simple fit for now. For "Scan", usually full page.
                doc.addImage(imgUrl, 'JPEG', 0, 0, pageWidth, pageHeight);
            });

            const pdfBytes = doc.output('blob');
            saveAs(pdfBytes, 'scanned-document.pdf');
        } catch (err) {
            console.error("Error generating PDF", err);
            alert("Failed to create PDF");
        } finally {
            setProcessing(false);
        }
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: 500 }}>
                <ArrowLeft size={16} /> Back to Tools
            </Link>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Scan to PDF</h1>
                <p style={{ color: 'var(--text-muted)' }}>Use your camera to capture documents.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>

                    {isCameraActive ? (
                        <div style={{ position: 'relative', background: 'black', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '2rem' }}>
                            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: 'auto', display: 'block' }}></video>
                            <div style={{ position: 'absolute', bottom: '1rem', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                                <button
                                    onClick={captureImage}
                                    style={{
                                        width: '64px', height: '64px', borderRadius: '50%', background: 'white', border: '4px solid rgba(0,0,0,0.2)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >
                                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                                </button>
                                <button
                                    onClick={stopCamera}
                                    style={{
                                        position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                                        background: 'rgba(0,0,0,0.5)', color: 'white', padding: '0.5rem', borderRadius: '50%', border: 'none'
                                    }}
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
                            <Camera size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Use camera to take photos of documents</p>
                            <Button onClick={startCamera}>Start Camera</Button>
                        </div>
                    )}

                    {images.length > 0 && (
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Captured Pages ({images.length})</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem' }}>
                                {images.map((img, i) => (
                                    <div key={i} style={{ position: 'relative' }}>
                                        <img src={img} alt={`Scan ${i}`} style={{ width: '100%', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
                                        <button
                                            onClick={() => removeImage(i)}
                                            style={{
                                                position: 'absolute', top: '-0.5rem', right: '-0.5rem',
                                                background: 'red', color: 'white', borderRadius: '50%', width: '24px', height: '24px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer'
                                            }}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <Button onClick={generatePDF} disabled={images.length === 0 || processing || isCameraActive} size="lg" style={{ width: '100%' }}>
                        {processing ? 'Generating PDF...' : 'Download PDF'}
                    </Button>

                    <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                </div>
            </div>
        </div>
    );
};

export default ScanToPDF;
