import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import Button from '../components/common/Button';
import { ArrowLeft, Download, Code } from 'lucide-react';
import { Link } from 'react-router-dom';

const HTMLToPDF = () => {
    const [htmlContent, setHtmlContent] = useState(`<h1>INVOICE</h1>
<p><strong>Date:</strong> 2023-10-25</p>
<hr />
<p>Dear Customer,</p>
<p>Thank you for your business. Please find your invoice details below.</p>
<table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
  <thead>
    <tr style="background-color: #f3f3f3; text-align: left;">
      <th style="padding: 10px; border: 1px solid #ddd;">Item</th>
      <th style="padding: 10px; border: 1px solid #ddd;">Quantity</th>
      <th style="padding: 10px; border: 1px solid #ddd;">Price</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;">Web Design Service</td>
      <td style="padding: 10px; border: 1px solid #ddd;">1</td>
      <td style="padding: 10px; border: 1px solid #ddd;">$500.00</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;">Hosting (1 Year)</td>
      <td style="padding: 10px; border: 1px solid #ddd;">1</td>
      <td style="padding: 10px; border: 1px solid #ddd;">$120.00</td>
    </tr>
  </tbody>
</table>
<h3 style="text-align: right; margin-top: 20px;">Total: $620.00</h3>
`);
    const [processing, setProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState('editor'); // For mobile if needed, though we do split on desktop
    const previewRef = useRef(null);

    const handleConvert = async () => {
        if (!htmlContent.trim()) return;
        setProcessing(true);
        try {
            const doc = new jsPDF({
                unit: 'pt',
                format: 'a4'
            });

            const element = previewRef.current;

            // jsPDF .html configuration
            await doc.html(element, {
                callback: function (doc) {
                    doc.save('document.pdf');
                    setProcessing(false);
                },
                x: 0,
                y: 0,
                html2canvas: {
                    scale: 0.75, // Crucial for mapping CSS pixels to PDF points correctly
                    logging: false,
                    useCORS: true
                },
                width: 595, // A4 width in pts
                windowWidth: 794 // 595 / 0.75 = ~793.33 px width for the canvas render
            });
        } catch (err) {
            console.error("Error converting HTML", err);
            alert("Failed to convert HTML.");
            setProcessing(false);
        }
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    <ArrowLeft size={16} /> Back to Tools
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>HTML to PDF</h1>
                    <Button onClick={handleConvert} disabled={processing} size="md">
                        {processing ? 'Generating...' : <><Download size={18} style={{ marginRight: '0.5rem' }} /> Download PDF</>}
                    </Button>
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '2rem',
                height: 'calc(100vh - 180px)',
                minHeight: '600px'
            }} className="editor-container">

                {/* Editor Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem' }}>
                        <label style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Code size={16} /> HTML / CSS
                        </label>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Type or paste HTML here</span>
                    </div>
                    <textarea
                        value={htmlContent}
                        onChange={(e) => setHtmlContent(e.target.value)}
                        style={{
                            flex: 1,
                            width: '100%',
                            padding: '1.5rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)',
                            fontFamily: '"Fira Code", monospace',
                            fontSize: '0.9rem',
                            resize: 'none',
                            outline: 'none',
                            lineHeight: 1.6,
                            background: '#1e293b',
                            color: '#e2e8f0',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                        }}
                        spellCheck="false"
                        placeholder="<h1>Hello World</h1>"
                    />
                </div>

                {/* Preview Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem' }}>
                        <label style={{ fontWeight: 600, color: 'var(--text-main)' }}>PDF Preview (A4)</label>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>What you see is what you get</span>
                    </div>

                    <div style={{
                        flex: 1,
                        background: '#e2e8f0', // Darker background for contrast
                        borderRadius: 'var(--radius-md)',
                        overflow: 'auto',
                        padding: '2rem',
                        display: 'flex',
                        justifyContent: 'center',
                        border: '1px solid var(--border)'
                    }}>
                        <div
                            style={{
                                width: '794px', // A4 width at 96 DPI (approx) or specifically scaled for our PDF export
                                // We chose 794px to match the windowWidth used in jsPDF (595 / 0.75)
                                minHeight: '1123px', // A4 height (842 / 0.75)
                                background: 'white',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                padding: '40px', // Page margins
                                color: 'black',
                                boxSizing: 'border-box'
                            }}
                        >
                            <div ref={previewRef} dangerouslySetInnerHTML={{ __html: htmlContent }} />
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 1024px) {
                    .editor-container {
                        grid-template-columns: 1fr !important;
                        height: auto !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default HTMLToPDF;
