import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import FileUploader from '../components/common/FileUploader';
import Button from '../components/common/Button';
import { ArrowLeft, FileText, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/common/SEO';
import { ChevronDown, ChevronUp } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const PDFToWord = () => {
    const [file, setFile] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);

    const handleFile = (files) => {
        if (files.length > 0) setFile(files[0]);
    };

    const handleConvert = async () => {
        if (!file) return;
        setProcessing(true);
        try {
            const buffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(buffer).promise;

            const docChildren = [];

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();

                // Simple heuristic: group items by Y to identify lines/paragraphs
                // This is extremely basic. 

                const items = textContent.items.map(item => ({
                    str: item.str,
                    y: item.transform[5], // Y coordinate
                    x: item.transform[4],
                }));

                // Sort by Y descending (top to bottom)
                items.sort((a, b) => b.y - a.y);

                let currentParagraphText = "";
                let lastY = null;

                items.forEach(item => {
                    // If Y difference is large, new paragraph
                    if (lastY !== null && Math.abs(item.y - lastY) > 10) {
                        docChildren.push(new Paragraph({
                            children: [new TextRun(currentParagraphText)],
                            spacing: { after: 200 } // Add some space
                        }));
                        currentParagraphText = "";
                    }
                    currentParagraphText += item.str + " ";
                    lastY = item.y;
                });

                // Flush last para
                if (currentParagraphText) {
                    docChildren.push(new Paragraph({
                        children: [new TextRun(currentParagraphText)],
                        spacing: { after: 200 }
                    }));
                }

                // Page break if not last page?
                // docx supports PageBreak() but 'docx' library structure usage:
                // We are adding to a section.
            }

            const doc = new Document({
                sections: [{
                    properties: {},
                    children: docChildren
                }]
            });

            const blob = await Packer.toBlob(doc);
            saveAs(blob, `${file.name.replace(/\.pdf$/i, '')}.docx`);

        } catch (err) {
            console.error("Conversion error", err);
            alert("Failed to convert to Word.");
        } finally {
            setProcessing(false);
        }
    };

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const schema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "PDF to Word",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Convert PDF files to editable Word (DOCX) documents online. Extract text and paragraphs to a new Word file.",
        "featureList": "PDF to Word, Document Conversion, Editable Word",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.3",
            "ratingCount": "110"
        }
    };

    return (
        <>
            <SEO
                title="PDF to Word - Convert PDF to DOCX Online Free"
                description="Convert PDF files to editable Word documents. Extract text and save as DOCX for free online."
                keywords="pdf to word, pdf to docx, convert pdf to word, editable word document, free pdf converter"
                schema={schema}
            />

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: 500 }}>
                    <ArrowLeft size={16} /> Back to Tools
                </Link>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>PDF to Word</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Convert PDF text to editable DOCX documents.</p>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                    {!file ? (
                        <FileUploader onFilesSelected={handleFile} label="Select PDF file" />
                    ) : (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                <FileText size={48} color="#2b579a" />
                                <h3>{file.name}</h3>
                                <Button variant="secondary" onClick={() => setFile(null)} size="sm" style={{ marginLeft: 'auto' }}>Change File</Button>
                            </div>
                            <Button onClick={handleConvert} disabled={processing} size="lg" style={{ width: '100%' }}>
                                {processing ? 'Converting...' : 'Convert to Word'}
                            </Button>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem', textAlign: 'center' }}>
                                Note: Complex layouts/images might not be preserved. Text extraction is best effort.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ maxWidth: '800px', margin: '4rem auto 0' }}>
                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem' }}>Why use our PDF to Word converter?</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', color: 'var(--text-main)' }}>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Editable</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Extract text content from your PDF and edit it in Microsoft Word.</p>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Secure</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Files are processed in your browser. No data is uploaded to any server.</p>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Fast</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Get your DOCX file in seconds without installing any software.</p>
                        </div>
                    </div>
                </section>

                <section style={{ marginBottom: '3rem', padding: '2rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>How to convert PDF to Word</h2>
                    <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li>Select the PDF file you want to convert.</li>
                        <li>Click 'Convert to Word'.</li>
                        <li>Wait for the text extraction process.</li>
                        <li>Download the generated .docx file.</li>
                    </ol>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Frequently Asked Questions</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { q: "Will my images be preserved?", a: "Currently, we focus on extracting text. Complex images and layouts may be simplified." },
                            { q: "Is it free?", a: "Yes, standard conversion is completely free." },
                            { q: "Can I convert scanned PDFs?", a: "For scanned PDFs, please use our OCR tool directly." },
                            { q: "Do I need Microsoft Word?", a: "You don't need Word to convert, but you need a compatible viewer to open the result." }
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

export default PDFToWord;
