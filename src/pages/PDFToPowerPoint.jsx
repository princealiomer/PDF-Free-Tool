import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pptxgen from 'pptxgenjs';
import FileUploader from '../components/common/FileUploader';
import Button from '../components/common/Button';
import { ArrowLeft, Presentation } from 'lucide-react';
import { Link } from 'react-router-dom';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const PDFToPowerPoint = () => {
    const [file, setFile] = useState(null);
    const [processing, setProcessing] = useState(false);

    const handleFile = (files) => {
        if (files.length > 0) setFile(files[0]);
    };

    const handleConvert = async () => {
        if (!file) return;
        setProcessing(true);
        try {
            const buffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(buffer).promise;

            const pres = new pptxgen();

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const slide = pres.addSlide();

                // Strategy: Render PDF page as an image to ensure formatting (Best fidelity)
                // Text extraction is hard to position perfectly in PPT.
                // Slides are visual aids, so image is often acceptable for "View" but not "Edit".
                // Let's do Image-based for robustness.

                // Render to canvas
                const viewport = page.getViewport({ scale: 2 }); // 2x for quality
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext('2d');
                await page.render({ canvasContext: ctx, viewport }).promise;

                const imgData = canvas.toDataURL('image/png');

                // PPT slide size default is 10x5.625 inches (16:9). 
                // We should fit image to slide.
                slide.addImage({ data: imgData, x: 0, y: 0, w: '100%', h: '100%' });
            }

            pres.writeFile({ fileName: `${file.name.replace(/\.pdf$/i, '')}.pptx` });

        } catch (err) {
            console.error("Conversion error", err);
            alert("Failed to convert to PowerPoint.");
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
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>PDF to PowerPoint</h1>
                <p style={{ color: 'var(--text-muted)' }}>Convert PDF slides to PPTX presentation.</p>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                {!file ? (
                    <FileUploader onFilesSelected={handleFile} label="Select PDF file" />
                ) : (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                            <Presentation size={48} color="#d24726" />
                            <h3>{file.name}</h3>
                            <Button variant="secondary" onClick={() => setFile(null)} size="sm" style={{ marginLeft: 'auto' }}>Change File</Button>
                        </div>
                        <Button onClick={handleConvert} disabled={processing} size="lg" style={{ width: '100%' }}>
                            {processing ? 'Converting...' : 'Convert to PowerPoint'}
                        </Button>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem', textAlign: 'center' }}>
                            Note: Slides are generated as high-quality images to preserve exact layout. They are not editable text blocks.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PDFToPowerPoint;
