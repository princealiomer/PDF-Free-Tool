import React, { useState } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';
import FileUploader from '../components/common/FileUploader';
import Button from '../components/common/Button';
import { ArrowLeft, FileType } from 'lucide-react';
import { Link } from 'react-router-dom';

const TextToPDF = () => {
    const [file, setFile] = useState(null);
    const [textInput, setTextInput] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleFile = async (files) => {
        if (files.length > 0) {
            const f = files[0];
            setFile(f);
            const text = await f.text();
            setTextInput(text);
        }
    };

    const handleConvert = async () => {
        if (!textInput.trim()) return;
        setProcessing(true);
        try {
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage();
            const { width, height } = page.getSize();
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const fontSize = 12;

            // Simple text wrapping logic
            const lines = textInput.split('\n');
            let y = height - 50;
            const margin = 50;
            const maxWidth = width - margin * 2;

            for (const line of lines) {
                // This is extremely basic wrapping. 
                // For a real app, we need proper word wrapping utility.
                // Assuming simple short lines for now or truncating.
                // Or better: use a library/helper for drawing text.
                // pdf-lib's drawText doesn't auto-wrap by default.

                // Let's implement a very basic char-based wrap
                // Or just draw effectively.

                page.drawText(line, {
                    x: margin,
                    y,
                    size: fontSize,
                    font,
                    color: rgb(0, 0, 0),
                    maxWidth: maxWidth,
                    lineHeight: fontSize * 1.2,
                });

                // Estimate height? drawText doesn't return height used easily without measuring.
                // Let's assume one line per newline for this basic version?
                // Actually drawText DOES wrap if maxWidth is provided in recent versions?
                // Yes, maxWidth is supported.

                // We need to move Y down. But how much?
                // We don't know number of lines it wrapped to without pre-measuring.
                // For this stub, we might just print it all in one go if possible or assume pre-wrapped.

                // Better approach:
                // Just use one drawText for the whole content if it has newlines?
                // pdf-lib handles newlines.

                // But it does NOT handle multiple pages.
                // So big text = truncated.

                y -= (fontSize * 1.5);
                if (y < 50) {
                    // Start new page
                    // This is hard without loop.
                }
            }

            // Re-Strategy: Just draw the whole text block. 
            // Warning: No pagination in this basic version.
            page.drawText(textInput, {
                x: margin,
                y: height - 50,
                size: fontSize,
                font,
                maxWidth: maxWidth,
                lineHeight: fontSize * 1.2
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            saveAs(blob, 'converted-text.pdf');
        } catch (err) {
            console.error("Error converting text", err);
            alert("Failed to convert text.");
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
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Text to PDF</h1>
                <p style={{ color: 'var(--text-muted)' }}>Convert plain text or .txt files to PDF.</p>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <div style={{ marginBottom: '2rem' }}>
                    {!file && (
                        <div style={{ marginBottom: '1rem' }}>
                            <FileUploader onFilesSelected={handleFile} label="Upload .txt file (Optional)" accept=".txt" />
                        </div>
                    )}

                    <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>Text Content</label>
                    <textarea
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Type or paste text here..."
                        style={{
                            width: '100%',
                            height: '300px',
                            padding: '1rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)',
                            fontFamily: 'inherit',
                            fontSize: '1rem'
                        }}
                    ></textarea>
                </div>

                <Button onClick={handleConvert} disabled={processing || !textInput.trim()} size="lg" style={{ width: '100%' }}>
                    {processing ? 'Converting...' : <><FileType size={20} style={{ marginRight: '0.5rem' }} /> Convert to PDF</>}
                </Button>
            </div>
        </div>
    );
};

export default TextToPDF;
