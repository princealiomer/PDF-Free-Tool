import React, { useState, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import FileUploader from '../components/common/FileUploader';
import Button from '../components/common/Button';
import { ArrowLeft, GitCompare, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/common/SEO';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const ComparePDF = () => {
    const [file1, setFile1] = useState(null);
    const [file2, setFile2] = useState(null);
    const [page1, setPage1] = useState(1);
    const [page2, setPage2] = useState(1);
    const [numPages1, setNumPages1] = useState(0);
    const [numPages2, setNumPages2] = useState(0);
    const [openFaq, setOpenFaq] = useState(null);

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

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const schema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Compare PDF",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Compare two PDF documents side-by-side to visually scrutinize differences.",
        "featureList": "PDF Comparison, Side-by-Side View, Visual Diff",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.6",
            "ratingCount": "85"
        }
    };

    return (
        <>
            <SEO
                title="Compare PDF - Side-by-Side PDF Diff Tool"
                description="Compare two PDF files side-by-side to identify differences visually. Free online PDF comparison tool."
                keywords="compare pdf, pdf diff, side by side pdf, visual pdf comparison, compare documents"
                schema={schema}
            />

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
                    <p style={{ color: 'var(--text-muted)' }}>Use the "Visual" method to manually inspect differences.</p>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '4rem auto 0' }}>
                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem' }}>Why use our Compare PDF tool?</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', color: 'var(--text-main)' }}>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Side-by-Side</h3>
                            <p style={{ color: 'var(--text-muted)' }}>View two documents next to each other to spot changes, updates, or errors.</p>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Privacy</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Your contracts and sensitive documents are processed locally, never uploaded.</p>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Synchronized</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Easily navigate both documents independently to find corresponding pages.</p>
                        </div>
                    </div>
                </section>

                <section style={{ marginBottom: '3rem', padding: '2rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>How to compare PDFs</h2>
                    <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li>Upload the first version of the document.</li>
                        <li>Upload the second version adjacent to it.</li>
                        <li>Use page controls to align the views.</li>
                        <li>Visually scan for differences.</li>
                    </ol>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Frequently Asked Questions</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { q: "Does it highlight changes automatically?", a: "Currently, this is a side-by-side visual comparison tool. Auto-highlighting is planned for a future update." },
                            { q: "Can I scroll both at once?", a: "We kept scrolling independent to handle documents with different page counts or layouts." },
                            { q: "Is it secure?", a: "Yes, files remain on your device." }
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

export default ComparePDF;
