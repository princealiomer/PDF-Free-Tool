import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import * as mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import FileUploader from '../components/common/FileUploader';
import Button from '../components/common/Button';
import { ArrowLeft, FileText, Table, Presentation, CheckCircle, AlertTriangle } from 'lucide-react';

const OfficeToPDF = () => {
    const location = useLocation();
    const [mode, setMode] = useState('word'); // word, excel, powerpoint
    const [file, setFile] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [status, setStatus] = useState('');

    useEffect(() => {
        if (location.pathname.includes('excel')) setMode('excel');
        else if (location.pathname.includes('powerpoint')) setMode('powerpoint');
        else setMode('word');

        setFile(null);
        setStatus('');
    }, [location]);

    const getTitle = () => {
        switch (mode) {
            case 'excel': return 'Excel to PDF';
            case 'powerpoint': return 'PowerPoint to PDF';
            default: return 'Word to PDF';
        }
    };

    const getDescription = () => {
        switch (mode) {
            case 'excel': return 'Convert .xlsx spreadsheets to PDF documents.';
            case 'powerpoint': return 'Convert .pptx slides to PDF (Basic).';
            default: return 'Convert .docx documents to PDF.';
        }
    };

    const getAccept = () => {
        switch (mode) {
            case 'excel': return '.xlsx, .xls';
            case 'powerpoint': return '.pptx, .ppt';
            default: return '.docx, .doc';
        }
    };

    const handleFile = (files) => {
        if (files.length > 0) setFile(files[0]);
    };

    const handleConvert = async () => {
        if (!file) return;
        setProcessing(true);
        setStatus('Processing...');

        // Helper to ensure valid PDF filename
        const getOutputName = (name) => {
            const lastDot = name.lastIndexOf('.');
            const base = lastDot !== -1 ? name.substring(0, lastDot) : name;
            return `${base}.pdf`;
        };

        try {
            if (mode === 'word') {
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.convertToHtml({ arrayBuffer });
                const doc = new jsPDF();
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = result.value;
                tempDiv.style.width = '190mm';
                tempDiv.style.padding = '10mm';
                tempDiv.style.fontFamily = 'Arial, sans-serif';
                document.body.appendChild(tempDiv);

                await doc.html(tempDiv, {
                    callback: function (doc) {
                        const pdfBytes = doc.output('blob');
                        saveAs(pdfBytes, getOutputName(file.name));
                        document.body.removeChild(tempDiv);
                        setProcessing(false);
                        setStatus('Conversion Complete!');
                    },
                    x: 0, y: 0, width: 190, windowWidth: 800
                });
            }
            else if (mode === 'excel') {
                const arrayBuffer = await file.arrayBuffer();
                const workbook = XLSX.read(arrayBuffer);
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const html = XLSX.utils.sheet_to_html(worksheet);
                const doc = new jsPDF();
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                tempDiv.style.width = '190mm';
                tempDiv.style.padding = '10mm';
                const style = document.createElement('style');
                style.innerHTML = `table { border-collapse: collapse; width: 100%; } td, th { border: 1px solid #ddd; padding: 4px; font-size: 10px; }`;
                tempDiv.appendChild(style);
                document.body.appendChild(tempDiv);

                await doc.html(tempDiv, {
                    callback: function (doc) {
                        const pdfBytes = doc.output('blob');
                        saveAs(pdfBytes, getOutputName(file.name));
                        document.body.removeChild(tempDiv);
                        setProcessing(false);
                        setStatus('Conversion Complete!');
                    },
                    x: 0, y: 0, width: 190, windowWidth: 800
                });
            }
            else if (mode === 'powerpoint') {
                const doc = new jsPDF();
                doc.setFontSize(22);
                doc.text("PowerPoint to PDF", 20, 30);
                doc.setFontSize(12);
                doc.text("Conversion of .pptx files is fully client-side and limited.", 20, 50);
                doc.text(`Original Filename: ${file.name}`, 20, 60);
                doc.text("Advanced slide rendering requires server-side processing.", 20, 80);
                const pdfBytes = doc.output('blob');
                saveAs(pdfBytes, getOutputName(file.name));
                setProcessing(false);
                setStatus('Basic PDF Generated (Stub)');
            }
        } catch (error) {
            console.error("Conversion failed", error);
            setStatus('Error: Could not convert file.');
            setProcessing(false);
            alert("Conversion failed. The file format might be too complex for client-side processing.");
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: 500 }}>
                <ArrowLeft size={16} /> Back to Tools
            </Link>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{getTitle()}</h1>
                <p style={{ color: 'var(--text-muted)' }}>{getDescription()}</p>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                {!file ? (
                    <FileUploader onFilesSelected={handleFile} label={`Select ${mode === 'word' ? 'Word' : mode === 'excel' ? 'Excel' : 'PowerPoint'} File`} accept={getAccept()} />
                ) : (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: '1rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', display: 'inline-block' }}>
                            {mode === 'word' && <FileText size={48} color="#2b579a" />}
                            {mode === 'excel' && <Table size={48} color="#217346" />}
                            {mode === 'powerpoint' && <Presentation size={48} color="#d24726" />}
                            <p style={{ marginTop: '0.5rem', fontWeight: 600 }}>{file.name}</p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{(file.size / 1024).toFixed(2)} KB</p>
                        </div>

                        {status && (
                            <div style={{ marginBottom: '1.5rem', color: status.includes('Error') ? 'red' : 'green', fontWeight: 500 }}>
                                {status}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <Button onClick={handleConvert} disabled={processing} size="lg" style={{ minWidth: '200px' }}>
                                {processing ? 'Converting...' : 'Convert to PDF'}
                            </Button>
                            <Button onClick={() => { setFile(null); setStatus(''); }} variant="secondary" disabled={processing}>
                                Change File
                            </Button>
                        </div>
                    </div>
                )}

                <div style={{ marginTop: '2rem', padding: '1rem', background: '#fffbeb', borderRadius: 'var(--radius-md)', border: '1px solid #fcd34d' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                        <AlertTriangle size={20} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <p style={{ fontSize: '0.9rem', color: '#92400e', margin: 0 }}>
                            <strong>Note:</strong> Conversions are performed entirely in your browser for privacy. Complex formatting, images, or special layouts might not be preserved perfectly.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OfficeToPDF;
