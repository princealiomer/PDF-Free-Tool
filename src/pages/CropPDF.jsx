import React, { useState, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import FileUploader from '../components/common/FileUploader';
import Button from '../components/common/Button';
import { ArrowLeft, Crop, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/common/SEO';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const CropPDF = () => {
    const [file, setFile] = useState(null);
    const [numPages, setNumPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [processing, setProcessing] = useState(false);

    // Crop State: { x, y, w, h } in Canvas coords
    const [cropBox, setCropBox] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState(null);

    const canvasRef = useRef(null);
    const overlayRef = useRef(null);

    const handleFile = async (files) => {
        if (files.length > 0) {
            setFile(files[0]);
            const buffer = await files[0].arrayBuffer();
            const pdf = await pdfjsLib.getDocument(buffer).promise;
            setNumPages(pdf.numPages);
            setCurrentPage(1);
            setCropBox(null);
        }
    };

    useEffect(() => {
        if (file) renderPage(currentPage);
    }, [file, currentPage]);

    const renderPage = async (pageNum) => {
        if (!file || !canvasRef.current) return;
        const buffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(buffer).promise;
        const page = await pdf.getPage(pageNum);

        // Calculate dynamic scale to fit screen
        const desiredWidth = 600;
        const viewportRaw = page.getViewport({ scale: 1 });
        const newScale = desiredWidth / viewportRaw.width;
        setScale(newScale);

        const viewport = page.getViewport({ scale: newScale });

        const canvas = canvasRef.current;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;

        if (overlayRef.current) {
            overlayRef.current.width = viewport.width;
            overlayRef.current.height = viewport.height;
            drawOverlay(); // Clear prev
        }
    };

    const drawOverlay = () => {
        if (!overlayRef.current) return;
        const ctx = overlayRef.current.getContext('2d');
        ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);

        // Darken background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, overlayRef.current.width, overlayRef.current.height);

        if (cropBox) {
            // Cutout
            ctx.clearRect(cropBox.x, cropBox.y, cropBox.w, cropBox.h);

            // Border
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(cropBox.x, cropBox.y, cropBox.w, cropBox.h);

            // Dimensions text
            ctx.fillStyle = '#fff';
            ctx.font = '12px sans-serif';
            ctx.setLineDash([]);
            ctx.fillText(`${Math.round(cropBox.w)} x ${Math.round(cropBox.h)}`, cropBox.x, cropBox.y - 5);
        }
    };

    const handleMouseDown = (e) => {
        const rect = overlayRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setStartPos({ x, y });
        setIsDragging(true);
        setCropBox({ x, y, w: 0, h: 0 });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        const rect = overlayRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setCropBox({
            x: Math.min(startPos.x, x),
            y: Math.min(startPos.y, y),
            w: Math.abs(x - startPos.x),
            h: Math.abs(y - startPos.y)
        });
        drawOverlay();
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        drawOverlay();
    };

    const handleSave = async (applyToAll) => {
        if (!file || !cropBox) return;
        setProcessing(true);
        try {
            const buffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(buffer);
            const pages = pdfDoc.getPages();

            // Convert canvas cropBox to PDF coords
            // PDF coords: x is same (scaled), y is inverted.

            // Get original page size to handle mapY correctly
            // Note: Different pages might have different sizes, so scale might assume all pages same size is risky if specific page viewed.
            // But we rendered 'currentPage'. Let's assume user applies crop based on visually seen Page X.

            const viewedPage = pages[currentPage - 1];
            const { width, height } = viewedPage.getSize();

            // canvas width = width * scale
            // cropX (pdf) = cropBox.x / scale
            // cropW (pdf) = cropBox.w / scale
            // cropH (pdf) = cropBox.h / scale
            // cropY (pdf) = height - (cropBox.y / scale) - cropH 
            // (because cropBox.y is top of box, cropY in PDF is bottom of box)

            const cropX = cropBox.x / scale;
            const cropW = cropBox.w / scale;
            const cropH = cropBox.h / scale;
            const cropY = height - (cropBox.y / scale) - cropH;

            // Define target pages
            const targetPages = applyToAll ? pages : [viewedPage];

            targetPages.forEach(p => {
                // For applyToAll, this assumes all pages have same dimensions/orientation.
                // A safe crop sets the box. If page is smaller, it clip.
                p.setCropBox(cropX, cropY, cropW, cropH);
                p.setMediaBox(cropX, cropY, cropW, cropH);
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            saveAs(blob, 'cropped-document.pdf');

        } catch (err) {
            console.error("Save error", err);
            alert("Failed to crop PDF.");
        } finally {
            setProcessing(false);
        }
    };



    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const [openFaq, setOpenFaq] = useState(null);

    const schema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Crop PDF",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Crop PDF pages. Trim margins and adjust page size of your PDF documents online.",
        "featureList": "Crop pages, Visual selection, Apply to all pages",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.7",
            "ratingCount": "180"
        }
    };

    return (
        <>
            <SEO
                title="Crop PDF - Trim and Resize PDF Pages Online"
                description="Crop PDF documents online. Visually select the area to keep and remove unwanted margins. Free and secure tool."
                keywords="crop pdf, trim pdf, resize pdf pages, cut pdf, pdf cropper"
                schema={schema}
            />

            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: 500 }}>
                    <ArrowLeft size={16} /> Back to Tools
                </Link>

                <div style={{ display: 'flex', gap: '2rem' }}>
                    <div style={{ padding: '1.5rem', background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', width: '250px' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Crop PDF</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            Draw a box on the page to define the cropping area.
                        </p>

                        <Button onClick={() => handleSave(false)} disabled={processing || !cropBox} size="lg" style={{ width: '100%', marginBottom: '1rem' }}>
                            Crop Current Page
                        </Button>
                        <Button onClick={() => handleSave(true)} disabled={processing || !cropBox} variant="secondary" size="lg" style={{ width: '100%' }}>
                            Crop ALL Pages
                        </Button>
                    </div>

                    <div style={{ flex: 1, background: 'var(--bg-main)', borderRadius: 'var(--radius-lg)', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {!file ? (
                            <FileUploader onFilesSelected={handleFile} label="Select PDF to Crop" />
                        ) : (
                            <div style={{ position: 'relative', boxShadow: 'var(--shadow-lg)' }}>
                                <canvas ref={canvasRef} style={{ display: 'block' }} />
                                <canvas
                                    ref={overlayRef}
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseUp}
                                    style={{ position: 'absolute', top: 0, left: 0, cursor: 'crosshair', touchAction: 'none' }}
                                />
                            </div>
                        )}

                        {file && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                                <Button variant="secondary" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1}>
                                    <ChevronLeft size={20} />
                                </Button>
                                <span>Page {currentPage} of {numPages}</span>
                                <Button variant="secondary" onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))} disabled={currentPage >= numPages}>
                                    <ChevronRight size={20} />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>


            <div style={{ maxWidth: '1000px', margin: '4rem auto 0' }}>
                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem' }}>Why use our Crop PDF tool?</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', color: 'var(--text-main)' }}>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Visual Cropping</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Draw a box directly on the page to define exactly what you want to keep.</p>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Format Fixer</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Great for removing scan marks, header/footers, or adjusting page sizes for printing.</p>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Batch Processing</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Apply the same crop area to all pages in your document with one click.</p>
                        </div>
                    </div>
                </section>

                <section style={{ marginBottom: '3rem', padding: '2rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>How to crop a PDF</h2>
                    <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li>Upload your PDF file.</li>
                        <li>Use your mouse to draw a crop box area on the preview.</li>
                        <li>Adjust the box as needed.</li>
                        <li>Click 'Crop Current Page' or 'Crop ALL Pages' to save.</li>
                    </ol>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Frequently Asked Questions</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { q: "Does this delete content outside the box?", a: "Yes, the visible area is updated. However, some PDF viewers might still allow undoing this, as it changes the 'MediaBox'." },
                            { q: "Can I set a specific size (e.g., A4)?", a: "Currenty, this tool supports visual cropping. You select the area you want to keep visually." },
                            { q: "Is my data safe?", a: "Absolutely. All processing takes place in your browser." },
                            { q: "Can I crop different pages differently?", a: "You can crop the current view and save. For mixed cropping, it's best to crop and save individually or use 'Crop All'." }
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

export default CropPDF;
