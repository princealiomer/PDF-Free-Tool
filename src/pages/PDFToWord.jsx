import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import FileUploader from '../components/common/FileUploader';
import Button from '../components/common/Button';
import { ArrowLeft, FileText, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const PDFToWord = () => {
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

    return (
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
    );
};

export default PDFToWord;
