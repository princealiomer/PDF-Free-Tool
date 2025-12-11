import React, { useState, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import FileUploader from '../components/common/FileUploader';
import Button from '../components/common/Button';
import { ArrowLeft, GitCompare } from 'lucide-react';
import { Link } from 'react-router-dom';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

const ComparePDF = () => {
    const [file1, setFile1] = useState(null);
    const [file2, setFile2] = useState(null);
    const [page1, setPage1] = useState(1);
    const [page2, setPage2] = useState(1);
    const [numPages1, setNumPages1] = useState(0);
    const [numPages2, setNumPages2] = useState(0);

    const canvas1Ref = useRef(null);
    const canvas2Ref = useRef(null);

    const renderPage = async (file, pageNum, canvasRef) => {
        if (!file || !canvasRef.current) return;

        try {
            const buffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(buffer).promise;

            // Limit page
            const count = pdf.numPages;
            if (pageNum > count) return;

            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.0 });

            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport: viewport }).promise;
        } catch (error) {
            console.error("Error rendering page", error);
        }
    };

    useEffect(() => {
        if (file1) {
            const load1 = async () => {
                const buffer = await file1.arrayBuffer();
                const pdf = await pdfjsLib.getDocument(buffer).promise;
                setNumPages1(pdf.numPages);
                renderPage(file1, page1, canvas1Ref);
            };
            load1();
        }
    }, [file1, page1]);

    useEffect(() => {
        if (file2) {
            const load2 = async () => {
                const buffer = await file2.arrayBuffer();
                const pdf = await pdfjsLib.getDocument(buffer).promise;
                setNumPages2(pdf.numPages);
                renderPage(file2, page2, canvas2Ref);
            };
            load2();
        }
    }, [file2, page2]);

    const handleFile1 = (files) => { if (files.length > 0) setFile1(files[0]); };
    const handleFile2 = (files) => { if (files.length > 0) setFile2(files[0]); };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: 500 }}>
                <ArrowLeft size={16} /> Back to Tools
            </Link>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Compare PDF</h1>
                <p style={{ color: 'var(--text-muted)' }}>Visually compare two PDF documents side-by-side.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* PDF 1 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontWeight: 600, textAlign: 'center' }}>Document 1</h3>
                    {!file1 ? (
                        <FileUploader onFilesSelected={handleFile1} label="Select First PDF" />
                    ) : (
                        <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                                <span style={{ fontWeight: 500 }}>{file1.name}</span>
                                <Button size="sm" variant="secondary" onClick={() => setFile1(null)}>Change</Button>
                            </div>
                            <div style={{ border: '1px solid #ddd', overflow: 'hidden', background: '#f9f9f9', display: 'flex', justifyContent: 'center' }}>
                                <canvas ref={canvas1Ref} style={{ maxWidth: '100%', height: 'auto' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                                <button onClick={() => setPage1(p => Math.max(1, p - 1))} disabled={page1 <= 1}>Prev</button>
                                <span>Page {page1} of {numPages1}</span>
                                <button onClick={() => setPage1(p => Math.min(numPages1, p + 1))} disabled={page1 >= numPages1}>Next</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* PDF 2 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontWeight: 600, textAlign: 'center' }}>Document 2</h3>
                    {!file2 ? (
                        <FileUploader onFilesSelected={handleFile2} label="Select Second PDF" />
                    ) : (
                        <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                                <span style={{ fontWeight: 500 }}>{file2.name}</span>
                                <Button size="sm" variant="secondary" onClick={() => setFile2(null)}>Change</Button>
                            </div>
                            <div style={{ border: '1px solid #ddd', overflow: 'hidden', background: '#f9f9f9', display: 'flex', justifyContent: 'center' }}>
                                <canvas ref={canvas2Ref} style={{ maxWidth: '100%', height: 'auto' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                                <button onClick={() => setPage2(p => Math.max(1, p - 1))} disabled={page2 <= 1}>Prev</button>
                                <span>Page {page2} of {numPages2}</span>
                                <button onClick={() => setPage2(p => Math.min(numPages2, p + 1))} disabled={page2 >= numPages2}>Next</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <p style={{ color: 'var(--text-muted)' }}>Use the "Visualize" method to manually inspect differences.</p>
            </div>
        </div>
    );
};

export default ComparePDF;
