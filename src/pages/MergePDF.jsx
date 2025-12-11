import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import FileUploader from '../components/common/FileUploader';
import Button from '../components/common/Button';
import { ArrowLeft, FileText, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const MergePDF = () => {
    const [files, setFiles] = useState([]);
    const [processing, setProcessing] = useState(false);

    const handleFiles = (newFiles) => {
        setFiles((prev) => [...prev, ...Array.from(newFiles)]);
    };

    const removeFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const mergePDFs = async () => {
        if (files.length === 0) return;
        setProcessing(true);
        try {
            const mergedPdf = await PDFDocument.create();

            for (const file of files) {
                const fileBuffer = await file.arrayBuffer();
                const pdf = await PDFDocument.load(fileBuffer);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }

            const mergedPdfBytes = await mergedPdf.save();
            const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });

            // Use file-saver for robust download handling
            saveAs(blob, 'merged-document.pdf');

        } catch (err) {
            console.error("Error merging PDFs", err);
            alert("Failed to merge PDFs. One of the files might be corrupted.");
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
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Merge PDF Files</h1>
                <p style={{ color: 'var(--text-muted)' }}>Combine multiple PDFs into one unified document.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {files.length === 0 ? (
                    <FileUploader
                        onFilesSelected={handleFiles}
                        multiple={true}
                        label="Select PDF files"
                    />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                            <Button variant="secondary" onClick={() => document.getElementById('add-more-input').click()}>
                                Add more files
                            </Button>
                            <input
                                id="add-more-input"
                                type="file"
                                multiple
                                accept=".pdf"
                                onChange={(e) => handleFiles(e.target.files)}
                                style={{ display: 'none' }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                            {files.map((file, idx) => (
                                <div key={idx} style={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border)',
                                    padding: '1rem',
                                    borderRadius: 'var(--radius-md)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    position: 'relative'
                                }}>
                                    <FileText size={40} color="var(--primary)" />
                                    <span style={{ fontSize: '0.875rem', textAlign: 'center', wordBreak: 'break-word', overflow: 'hidden', maxHeight: '3em' }}>{file.name}</span>
                                    <button
                                        onClick={() => removeFile(idx)}
                                        style={{
                                            position: 'absolute',
                                            top: '0.5rem',
                                            right: '0.5rem',
                                            color: 'var(--text-muted)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                            <Button onClick={mergePDFs} disabled={processing} size="lg">
                                {processing ? 'Merging...' : 'Merge PDF'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ marginTop: '4rem', padding: '2rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>How to merge PDF files</h2>
                <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <li>Select multiple PDF files and upload them to the tool.</li>
                    <li>Arrange the files in the order you want them to appear.</li>
                    <li>Click 'Merge PDF' to combine them into a single file.</li>
                    <li>Download your merged document instantly.</li>
                </ol>
            </div>
        </div>
    );
};

export default MergePDF;
