import React, { useState, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';
import FileUploader from '../components/common/FileUploader';
import Button from '../components/common/Button';
import { ArrowLeft, Type, PenTool, Image as ImageIcon, Eraser, Move, ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { Link } from 'react-router-dom';

// Use local worker from public folder for maximum stability
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const EditPDF = () => {
    const [file, setFile] = useState(null);
    const [pdfDoc, setPdfDoc] = useState(null); // Store loaded PDFJS document
    const [numPages, setNumPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [scale, setScale] = useState(1.5);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);

    // Tools: 'select', 'text', 'pen', 'image'
    const [tool, setTool] = useState('select');

    // State for annotations
    const [annotations, setAnnotations] = useState({});

    // Drawing state
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentPath, setCurrentPath] = useState([]);

    // Text state
    const [textInput, setTextInput] = useState({ visible: false, x: 0, y: 0, value: '' });

    // Refs
    const canvasRef = useRef(null); // Background PDF layer
    const overlayRef = useRef(null); // Interaction layer

    const handleFile = async (files) => {
        if (files.length > 0) {
            setFile(files[0]);
            setError(null);
            setAnnotations({});
            setPdfDoc(null);

            try {
                const buffer = await files[0].arrayBuffer();
                // Load PDF once
                const loadingTask = pdfjsLib.getDocument(buffer);
                const pdf = await loadingTask.promise;

                setPdfDoc(pdf);
                setNumPages(pdf.numPages);
                setCurrentPage(1);
            } catch (err) {
                console.error("PDF Load Error", err);
                setError(`Failed to load PDF: ${err.name} - ${err.message}`);
                setFile(null);
            }
        }
    };

    useEffect(() => {
        if (pdfDoc) {
            renderPage(currentPage);
        }
    }, [pdfDoc, currentPage]);

    const renderPage = async (pageNum) => {
        if (!pdfDoc || !canvasRef.current) return;

        try {
            const page = await pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale });

            const canvas = canvasRef.current;
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };
            await page.render(renderContext).promise;

            // Sync overlay size
            if (overlayRef.current) {
                overlayRef.current.width = viewport.width;
                overlayRef.current.height = viewport.height;
                drawOverlay();
            }
        } catch (err) {
            console.error("Render Error", err);
            setError(`Error rendering page ${pageNum}.`);
        }
    };

    const drawOverlay = () => {
        if (!overlayRef.current) return;
        const ctx = overlayRef.current.getContext('2d');
        ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);

        const pageAnnos = annotations[currentPage - 1] || [];

        pageAnnos.forEach(anno => {
            if (anno.type === 'text') {
                ctx.font = `${anno.size * scale}px Helvetica`; // Approx scaling
                ctx.fillStyle = anno.color;
                ctx.fillText(anno.content, anno.x, anno.y);
            } else if (anno.type === 'path') {
                ctx.beginPath();
                ctx.strokeStyle = anno.color;
                ctx.lineWidth = anno.width;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                if (anno.points.length > 0) {
                    ctx.moveTo(anno.points[0].x, anno.points[0].y);
                    anno.points.forEach(p => ctx.lineTo(p.x, p.y));
                }
                ctx.stroke();
            } else if (anno.type === 'image') {
                const img = new Image();
                img.src = anno.dataUrl;
                ctx.drawImage(img, anno.x, anno.y, anno.width, anno.height);
            }
        });

        // Draw current drawing path
        if (currentPath.length > 0) {
            ctx.beginPath();
            ctx.strokeStyle = 'red'; // Active drawing color
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.moveTo(currentPath[0].x, currentPath[0].y);
            currentPath.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.stroke();
        }
    };

    useEffect(() => {
        drawOverlay();
    }, [annotations, currentPath, scale]);

    // Interaction Handlers
    const getPoint = (e) => {
        const rect = overlayRef.current.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const handleMouseDown = (e) => {
        const { x, y } = getPoint(e);

        if (tool === 'pen') {
            setIsDrawing(true);
            setCurrentPath([{ x, y }]);
        } else if (tool === 'text') {
            setTextInput({ visible: true, x, y, value: '' });
            setTool('select');
        }
    };

    const handleMouseMove = (e) => {
        if (tool === 'pen' && isDrawing) {
            const point = getPoint(e);
            setCurrentPath(prev => [...prev, point]);
        }
    };

    const handleMouseUp = () => {
        if (tool === 'pen' && isDrawing) {
            setIsDrawing(false);
            if (currentPath.length > 1) {
                const newAnno = {
                    type: 'path',
                    points: currentPath,
                    color: 'red',
                    width: 3
                };
                addAnnotation(newAnno);
            }
            setCurrentPath([]);
        }
    };

    const addAnnotation = (anno) => {
        const pageIdx = currentPage - 1;
        setAnnotations(prev => ({
            ...prev,
            [pageIdx]: [...(prev[pageIdx] || []), anno]
        }));
    };

    const handleTextSubmit = () => {
        if (!textInput.value.trim()) {
            setTextInput(prev => ({ ...prev, visible: false }));
            return;
        }
        addAnnotation({
            type: 'text',
            x: textInput.x,
            y: textInput.y,
            content: textInput.value,
            color: 'black',
            size: 16 // base size (unscaled)
        });
        setTextInput(prev => ({ ...prev, visible: false }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const w = 100;
                const h = (100 / img.width) * img.height;
                addAnnotation({
                    type: 'image',
                    x: 50, // default pos
                    y: 50,
                    width: w * scale, // scale visual
                    height: h * scale,
                    dataUrl: event.target.result,
                    origW: img.width,
                    origH: img.height
                });
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        if (!file) return;
        setProcessing(true);
        try {
            const buffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(buffer);
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const pages = pdfDoc.getPages();

            // Loop through pages and apply annotations
            for (let i = 0; i < pages.length; i++) {
                const pageAnnos = annotations[i];
                if (!pageAnnos) continue;

                const page = pages[i];
                const { width, height } = page.getSize();

                const mapX = (x) => x / scale;
                const mapY = (y) => height - (y / scale);

                for (const anno of pageAnnos) {
                    if (anno.type === 'text') {
                        page.drawText(anno.content, {
                            x: mapX(anno.x),
                            y: mapY(anno.y),
                            size: anno.size,
                            font: font,
                            color: rgb(0, 0, 0),
                        });
                    } else if (anno.type === 'path') {
                        if (anno.points.length < 2) continue;
                        const pathString = anno.points.map((p, idx) =>
                            `${idx === 0 ? 'M' : 'L'} ${mapX(p.x)} ${mapY(p.y)}`
                        ).join(' ');

                        page.drawSvgPath(pathString, {
                            borderColor: rgb(1, 0, 0), // red
                            borderWidth: 2,
                        });
                    } else if (anno.type === 'image') {
                        const imgBytes = await fetch(anno.dataUrl).then(res => res.arrayBuffer());
                        const pdfImg = await pdfDoc.embedPng(imgBytes).catch(async () => await pdfDoc.embedJpg(imgBytes));

                        const pdfW = anno.width / scale;
                        const pdfH = anno.height / scale;

                        page.drawImage(pdfImg, {
                            x: mapX(anno.x),
                            y: mapY(anno.y) - pdfH,
                            width: pdfW,
                            height: pdfH
                        });
                    }
                }
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            saveAs(blob, 'edited-document.pdf');

        } catch (err) {
            console.error("Save error", err);
            alert("Failed to save PDF. See console for details.");
        } finally {
            setProcessing(false);
        }
    };

    const clearPage = () => {
        setAnnotations(prev => ({
            ...prev,
            [currentPage - 1]: []
        }));
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: 500 }}>
                <ArrowLeft size={16} /> Back to Tools
            </Link>

            <div style={{ display: 'flex', gap: '2rem', height: '80vh' }}>
                {/* Left: Toolbar */}
                <div style={{ padding: '1.5rem', background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', gap: '1rem', width: '250px' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Tools</h2>

                    <button
                        onClick={() => setTool('select')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: tool === 'select' ? '2px solid var(--primary)' : '1px solid var(--border)', background: tool === 'select' ? '#EEF2FF' : 'white', cursor: 'pointer' }}
                    >
                        <Move size={18} /> Select / View
                    </button>

                    <button
                        onClick={() => setTool('text')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: tool === 'text' ? '2px solid var(--primary)' : '1px solid var(--border)', background: tool === 'text' ? '#EEF2FF' : 'white', cursor: 'pointer' }}
                    >
                        <Type size={18} /> Add Text
                    </button>

                    <button
                        onClick={() => setTool('pen')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: tool === 'pen' ? '2px solid var(--primary)' : '1px solid var(--border)', background: tool === 'pen' ? '#EEF2FF' : 'white', cursor: 'pointer' }}
                    >
                        <PenTool size={18} /> Draw (Pen)
                    </button>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'white', cursor: 'pointer' }}>
                        <ImageIcon size={18} /> Add Image
                        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                    </label>

                    <button
                        onClick={clearPage}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #fee2e2', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', marginTop: 'auto' }}
                    >
                        <Eraser size={18} /> Clear Page
                    </button>

                    <Button onClick={handleSave} disabled={processing} size="lg" style={{ marginTop: '1rem' }}>
                        {processing ? 'Saving...' : <><Save size={18} style={{ marginRight: '0.5rem' }} /> Save PDF</>}
                    </Button>
                </div>

                {/* Center: Canvas Area */}
                <div style={{ flex: 1, background: 'var(--bg-main)', borderRadius: 'var(--radius-lg)', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'auto', position: 'relative' }}>
                    {error ? (
                        <div style={{ color: 'red', marginTop: '4rem' }}>{error} - Try refreshing the page.</div>
                    ) : !file ? (
                        <div style={{ width: '100%', maxWidth: '400px', marginTop: '4rem' }}>
                            <FileUploader onFilesSelected={handleFile} label="Open PDF to Edit" />
                        </div>
                    ) : (
                        <div style={{ position: 'relative', boxShadow: 'var(--shadow-lg)' }}>
                            <canvas ref={canvasRef} style={{ display: 'block', borderRadius: '2px' }} />
                            <canvas
                                ref={overlayRef}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                style={{
                                    position: 'absolute',
                                    top: 0, left: 0,
                                    cursor: tool === 'pen' ? 'crosshair' : tool === 'text' ? 'text' : 'default',
                                    touchAction: 'none'
                                }}
                            />

                            {/* Text Input Overlay */}
                            {textInput.visible && (
                                <div style={{ position: 'absolute', left: textInput.x, top: textInput.y, padding: '4px', background: 'white', borderRadius: '4px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                                    <input
                                        autoFocus
                                        value={textInput.value}
                                        onChange={(e) => setTextInput(prev => ({ ...prev, value: e.target.value }))}
                                        onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
                                        onBlur={handleTextSubmit} // Confirm on blur
                                        style={{ border: '1px solid #ccc', padding: '4px', outline: 'none' }}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Navigation */}
            </div>
            {file && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                    <Button variant="secondary" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage <= 1}>
                        <ChevronLeft size={20} /> Prev
                    </Button>
                    <span style={{ fontWeight: 600 }}>Page {currentPage} of {numPages}</span>
                    <Button variant="secondary" onClick={() => setCurrentPage(prev => Math.min(numPages, prev + 1))} disabled={currentPage >= numPages}>
                        Next <ChevronRight size={20} />
                    </Button>
                </div>
            )}
        </div>
    );
};

export default EditPDF;
