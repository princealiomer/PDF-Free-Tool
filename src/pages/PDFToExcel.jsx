import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import FileUploader from '../components/common/FileUploader';
import Button from '../components/common/Button';
import { ArrowLeft, Table, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const PDFToExcel = () => {
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

            // We'll create one sheet per page or merge? 
            // Let's create one big sheet for simplicity or iterate.

            const allRows = [];

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();

                // Sort items by Y descending
                const items = textContent.items.map(item => ({
                    str: item.str,
                    y: Math.round(item.transform[5]), // Rounding to group same-line items
                    x: Math.round(item.transform[4])
                }));
                items.sort((a, b) => b.y - a.y || a.x - b.x);

                // Group by Y row
                let currentRowY = -99999;
                let currentRow = [];
                const pageRows = [];

                items.forEach(item => {
                    // If in same row (within tolerance)
                    if (Math.abs(item.y - currentRowY) < 5) {
                        currentRow.push(item);
                    } else {
                        if (currentRow.length > 0) {
                            // Sort row by X
                            currentRow.sort((a, b) => a.x - b.x);
                            pageRows.push(currentRow.map(it => it.str));
                        }
                        currentRow = [item];
                        currentRowY = item.y;
                    }
                });
                if (currentRow.length > 0) {
                    currentRow.sort((a, b) => a.x - b.x);
                    pageRows.push(currentRow.map(it => it.str));
                }

                // Add blank row between pages?
                allRows.push(...pageRows);
                allRows.push([]);
            }

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(allRows);
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

            // Xlsx write is sync
            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([wbout], { type: 'application/octet-stream' });
            saveAs(blob, `${file.name.replace(/\.pdf$/i, '')}.xlsx`);

        } catch (err) {
            console.error("Conversion error", err);
            alert("Failed to convert to Excel.");
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
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>PDF to Excel</h1>
                <p style={{ color: 'var(--text-muted)' }}>Scrape text data from PDF into spreadsheets.</p>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                {!file ? (
                    <FileUploader onFilesSelected={handleFile} label="Select PDF file" />
                ) : (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                            <Table size={48} color="#217346" />
                            <h3>{file.name}</h3>
                            <Button variant="secondary" onClick={() => setFile(null)} size="sm" style={{ marginLeft: 'auto' }}>Change File</Button>
                        </div>
                        <Button onClick={handleConvert} disabled={processing} size="lg" style={{ width: '100%' }}>
                            {processing ? 'Converting...' : 'Convert to Excel'}
                        </Button>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem', textAlign: 'center' }}>
                            Note: Table structure detection is limited. Rows are approximated by line height.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PDFToExcel;
