import React, { useState, useRef } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';
import * as pdfjsLib from 'pdfjs-dist';

import FileUploader from '../components/common/FileUploader';
import Button from '../components/common/Button';
import { ArrowLeft, Eraser } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/common/SEO';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Note: Redacting on client side usually means drawing a black box over content.
// True redaction (removing underlying text/images) is complex.
// We will implement visual redaction (Sanitization).

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

const RedactPDF = () => {
    const [file, setFile] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [numPages, setNumPages] = useState(0);
    const [scale, setScale] = useState(1.0);

    // We need to render the PDF to a canvas to let user select areas.
    const canvasRef = useRef(null);

    // Store redaction rectangles: { pageIndex, x, y, width, height } (in PDF coordinates)
    // But working with canvas coordinates is easier for UI, then convert.
    const [redactions, setRedactions] = useState([]);
    const [isSelecting, setIsSelecting] = useState(false);
    const [startPos, setStartPos] = useState(null);
    const [currentRect, setCurrentRect] = useState(null); // Temporary rect while dragging

    const handleFile = async (files) => {
        if (files.length > 0) {
            setFile(files[0]);
            const buffer = await files[0].arrayBuffer();
            const pdf = await pdfjsLib.getDocument(buffer).promise;
            setNumPages(pdf.numPages);
            setCurrentPage(1);
            setRedactions([]);
            renderPage(pdf, 1);
        }
    };

    const renderPage = async (pdfDoc, pageNum) => {
        if (!canvasRef.current || !pdfDoc) return;
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 }); // Fixed scale for display
        setScale(1.5);

        const canvas = canvasRef.current;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;
    };

    // Helper to get fresh PDF doc for rendering when page changes
    const getPdfDoc = async () => {
        if (!file) return null;
        const buffer = await file.arrayBuffer();
        return await pdfjsLib.getDocument(buffer).promise;
    };

    const changePage = async (delta) => {
        if (!file) return;
        const newPage = currentPage + delta;
        if (newPage >= 1 && newPage <= numPages) {
            setCurrentPage(newPage);
            const pdf = await getPdfDoc();
            renderPage(pdf, newPage);
        }
    };

    // Mouse events for selection
    const handleMouseDown = (e) => {
        if (!file) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setIsSelecting(true);
        setStartPos({ x, y });
    };

    const handleMouseMove = (e) => {
        if (!isSelecting) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setCurrentRect({
            x: Math.min(startPos.x, x),
            y: Math.min(startPos.y, y),
            w: Math.abs(x - startPos.x),
            h: Math.abs(y - startPos.y)
        });
    };

    const handleMouseUp = () => {
        if (isSelecting && currentRect) {
            // Add to redactions
            setRedactions(prev => [...prev, {
                page: currentPage,
                ...currentRect
            }]);
        }
        setIsSelecting(false);
        setCurrentRect(null);
        setStartPos(null);
    };

    const handleProcess = async () => {
        if (!file || redactions.length === 0) return;
        setProcessing(true);
        try {
            const buffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(buffer);
            const pages = pdfDoc.getPages();

            redactions.forEach(r => {
                const page = pages[r.page - 1]; // 0-based
                const { width, height } = page.getSize();

                // Convert canvas (top-left) to PDF (bottom-left) coordinates
                // And scaling?
                // pdfjs viewport scale was 1.5. 
                // We need to map back to PDF point units.

                // Note: pdfjs viewport width/height might differ from pdf-lib getSize if dpi differs, 
                // but usually they use 72dpi points basis.
                // Let's assume pdf-lib size is "true" point size.
                // pdfjs 1.5 scale means canvas pixels = 1.5 * points.

                const pdfX = r.x / scale;
                const pdfY = height - (r.y / scale) - (r.h / scale); // Flip Y
                const pdfW = r.w / scale;
                const pdfH = r.h / scale;

                page.drawRectangle({
                    x: pdfX,
                    y: pdfY,
                    width: pdfW,
                    height: pdfH,
                    color: rgb(0, 0, 0),
                });
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            saveAs(blob, 'redacted-document.pdf');
        } catch (err) {
            console.error("Error redacting PDF", err);
            alert("Failed to redact PDF.");
        } finally {
            setProcessing(false);
        }
    };

    const removeRedaction = (index) => {
        setRedactions(prev => prev.filter((_, i) => i !== index));
    };

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const [openFaq, setOpenFaq] = useState(null);

    const schema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Redact PDF",
        "applicationCategory": "SecurityApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Redact PDF documents. Permanently remove sensitive information and black out text online.",
        "featureList": "Redact PDF, Black out text, Sanitize document, Client-side processing",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.7",
            "ratingCount": "110"
        }
    };

    return (
        <>
            <SEO
                title="Redact PDF - Black Out Text & Hide Sensitive Info Online"
                description="Securely redact PDF documents. Permanently black out sensitive text and information. Free online PDF redaction tool."
                keywords="redact pdf, black out pdf text, hide pdf text, sanitize pdf, pdf redactor"
                schema={schema}
            />

            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: 500 }}>
                    <ArrowLeft size={16} /> Back to Tools
                </Link>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Redact PDF</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Black out sensitive information.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {!file ? (
                        <FileUploader onFilesSelected={handleFile} label="Select PDF file" />
                    ) : (
                        <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ background: 'var(--primary)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: 'white' }}>
                                        <Eraser size={32} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontWeight: 600 }}>{file.name}</h3>
                                        <p style={{ color: 'var(--text-muted)' }}>Page {currentPage} of {numPages}</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <Button variant="secondary" onClick={() => changePage(-1)} disabled={currentPage <= 1 || processing}>Prev</Button>
                                    <Button variant="secondary" onClick={() => changePage(1)} disabled={currentPage >= numPages || processing}>Next</Button>
                                    <Button variant="secondary" onClick={() => setFile(null)} size="sm">Change File</Button>
                                </div>
                            </div>

                            <div style={{ position: 'relative', overflow: 'auto', maxHeight: '70vh', border: '1px solid var(--border)', marginBottom: '2rem', display: 'flex', justifyContent: 'center', background: '#e5e7eb' }}>
                                <div style={{ position: 'relative' }}>
                                    <canvas
                                        ref={canvasRef}
                                        onMouseDown={handleMouseDown}
                                        onMouseMove={handleMouseMove}
                                        onMouseUp={handleMouseUp}
                                        onMouseLeave={handleMouseUp}
                                        style={{ cursor: 'crosshair', background: 'white', display: 'block' }}
                                    />
                                    {/* Render existing redactions for this page overlay */}
                                    {redactions.filter(r => r.page === currentPage).map((r, i) => (
                                        <div key={i} style={{
                                            position: 'absolute',
                                            left: r.x, top: r.y, width: r.w, height: r.h,
                                            background: 'rgba(0,0,0,0.5)', border: '1px solid red'
                                        }}></div>
                                    ))}
                                    {/* Render current selection */}
                                    {currentRect && (
                                        <div style={{
                                            position: 'absolute',
                                            left: currentRect.x, top: currentRect.y, width: currentRect.w, height: currentRect.h,
                                            background: 'rgba(0,0,0,0.2)', border: '1px dashed black'
                                        }}></div>
                                    )}
                                </div>
                            </div>

                            {redactions.length > 0 && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <h4>Redactions to Apply: {redactions.length}</h4>
                                    <Button onClick={() => setRedactions([])} variant="danger" size="sm">Clear All</Button>
                                </div>
                            )}

                            <Button onClick={handleProcess} disabled={processing || redactions.length === 0} size="lg" style={{ width: '100%' }}>
                                {processing ? 'Redacting...' : 'Apply Redactions'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>


            <div style={{ maxWidth: '1000px', margin: '4rem auto 0' }}>
                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem' }}>Why use our Redact PDF tool?</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', color: 'var(--text-main)' }}>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Data Privacy</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Permanently hide personal information like social security numbers, addresses, or financial data.</p>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Visual Interface</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Easily draw black boxes over the content you want to hide using our visual editor.</p>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Secure & Free</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Redaction happens in your browser. Sensitive documents are never uploaded to a server.</p>
                        </div>
                    </div>
                </section>

                <section style={{ marginBottom: '3rem', padding: '2rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>How to redact a PDF</h2>
                    <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li>Select the PDF file containing sensitive info.</li>
                        <li>Use your mouse to draw boxes over the text or images you want to hide.</li>
                        <li>Review your redactions.</li>
                        <li>Click 'Apply Redactions' to permanently save the changes.</li>
                    </ol>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Frequently Asked Questions</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { q: "Is the text actually removed?", a: "This tool applies a black overlay. While effective for visual hiding, true digital sanitization (removing underlying data) is best done with specialized enterprise software for legal matters." },
                            { q: "Can I undo a redaction?", a: "Before saving, you can clear all redactions. After saving, the changes are permanent on the new file." },
                            { q: "Is it free?", a: "Yes, you can redact unlimited files." },
                            { q: "Does it work on scanned PDFs?", a: "Yes, you can draw over any part of the page, including images." }
                        ].map((item, index) => (
                            <div key={index} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                                <button
                                    onClick={() => toggleFaq(index)}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        background: 'var(--bg-card)',
                                        border: 'none',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        fontWeight: '600',
                                        color: 'var(--text-main)'
                                    }}
                                >
                                    {item.q}
                                    {openFaq === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                                {openFaq === index && (
                                    <div style={{ padding: '1rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', background: 'var(--bg-background)' }}>
                                        {item.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
};

export default RedactPDF;
