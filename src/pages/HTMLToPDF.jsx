import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import Button from '../components/common/Button';
import { ArrowLeft, Download, Code } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/common/SEO';
import { ChevronDown, ChevronUp } from 'lucide-react';

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

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const [openFaq, setOpenFaq] = useState(null);

    const schema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "HTML to PDF",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Convert HTML code to PDF. Create PDF invoices, reports, and documents from HTML/CSS online.",
        "featureList": "HTML to PDF, CSS support, Real-time preview",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "165"
        }
    };

    return (
        <>
            <SEO
                title="HTML to PDF - Convert HTML Code to PDF Online"
                description="Convert HTML and CSS to PDF. Ideal for generating invoices, reports, and formatted documents. Free real-time preview and download."
                keywords="html to pdf, convert html to pdf, css to pdf, html converter, free pdf generator"
                schema={schema}
            />

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


            <div style={{ maxWidth: '1400px', margin: '4rem auto 0' }}>
                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem' }}>Why use our HTML to PDF converter?</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', color: 'var(--text-main)' }}>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Instant Render</h3>
                            <p style={{ color: 'var(--text-muted)' }}>See your changes in real-time. What you see in the preview is exactly what you get in the PDF.</p>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>CSS Support</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Supports inline styles and basic CSS for beautiful invoices, tickets, and reports.</p>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Client-Side</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Your HTML is rendered directly in your browser. No server-side processing.</p>
                        </div>
                    </div>
                </section>

                <section style={{ marginBottom: '3rem', padding: '2rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>How to convert HTML to PDF</h2>
                    <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li>Paste your HTML code into the editor on the left.</li>
                        <li>Adjust the code and watch the real-time preview on the right.</li>
                        <li>Click 'Download PDF' to save your document.</li>
                    </ol>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Frequently Asked Questions</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { q: "Does it support external CSS?", a: "For best results, use inline styles or internal <style> blocks. External links might be blocked by browser security." },
                            { q: "Can I use images?", a: "Yes, use base64 encoded strings or public URLs for images to ensure they appear correctly." },
                            { q: "What is the page format?", a: "The default format is A4." },
                            { q: "Is it free?", a: "Yes, completely free with no limits." }
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

export default HTMLToPDF;
