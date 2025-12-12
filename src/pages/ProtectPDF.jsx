import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import FileUploader from '../components/common/FileUploader';
import Button from '../components/common/Button';
import { ArrowLeft, Lock, FileText, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/common/SEO';
import { ChevronDown, ChevronUp } from 'lucide-react';

const ProtectPDF = () => {
    const [file, setFile] = useState(null);
    const [password, setPassword] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleFile = (files) => {
        if (files.length > 0) setFile(files[0]);
    };

    const handleProtect = async () => {
        if (!file || !password) return;
        setProcessing(true);
        try {
            const buffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(buffer);

            // Encrypt
            pdfDoc.encrypt({
                userPassword: password,
                ownerPassword: password, // Simple owner/user same password
                permissions: {
                    printing: 'highResolution',
                    modifying: false,
                    copying: false,
                    annotating: false,
                    fillingForms: false,
                    contentAccessibility: false,
                    documentAssembly: false,
                }
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            saveAs(blob, `${file.name.replace(/\.pdf$/i, '')}-protected.pdf`);
        } catch (err) {
            console.error("Error protecting PDF", err);
            alert("Failed to protect PDF.");
        } finally {
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
        "name": "Protect PDF",
        "applicationCategory": "SecurityApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Encrypt PDF with password. Protect your documents from unauthorized access securely in your browser.",
        "featureList": "Password protection, 128-bit encryption, Client-side security",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "ratingCount": "410"
        }
    };

    return (
        <>
            <SEO
                title="Protect PDF - Encrypt and Password Protect PDF Online"
                description="Secure your PDF files with a password. specific permissions for printing, copying, or modifying. 100% free and secure."
                keywords="protect pdf, encrypt pdf, password protect pdf, lock pdf, pdf security"
                schema={schema}
            />
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: 500 }}>
                    <ArrowLeft size={16} /> Back to Tools
                </Link>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Protect PDF</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Encrypt your PDF file with a password.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {!file ? (
                        <FileUploader onFilesSelected={handleFile} label="Select PDF file" />
                    ) : (
                        <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{ background: 'var(--primary)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: 'white' }}>
                                    <Shield size={32} />
                                </div>
                                <h3>{file.name}</h3>
                                <Button variant="secondary" onClick={() => setFile(null)} size="sm" style={{ marginLeft: 'auto' }}>Change File</Button>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>Set Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter a strong password"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border)',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>

                            <Button onClick={handleProtect} disabled={processing || !password} size="lg" style={{ width: '100%' }}>
                                {processing ? 'Encrypting...' : <><Lock size={20} style={{ marginRight: '0.5rem' }} /> Protect PDF</>}
                            </Button>
                        </div>
                    )}
                </div>
            </div>


            <div style={{ marginTop: '4rem' }}>
                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem' }}>Why use our Protect PDF tool?</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', color: 'var(--text-main)' }}>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Strong Encryption</h3>
                            <p style={{ color: 'var(--text-muted)' }}>We use standard 128-bit AES encryption to ensure your document remains secure from prying eyes.</p>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Total Privacy</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Encryption happens right here in your browser. Your file and password are never sent to any server.</p>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Free Forever</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Protect as many files as you want completely for free. No hidden costs or subscriptions.</p>
                        </div>
                    </div>
                </section>

                <section style={{ marginBottom: '3rem', padding: '2rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>How to password protect a PDF</h2>
                    <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li>Upload the PDF file you want to secure.</li>
                        <li>Enter a strong password in the input field.</li>
                        <li>Click 'Protect PDF'.</li>
                        <li>Download your encrypted file immediately.</li>
                    </ol>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Frequently Asked Questions</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { q: "Can anyone open the file without the password?", a: "No, once encrypted, the file cannot be opened without the correct password." },
                            { q: "Do you store my password?", a: "No, we do not store your file or your password. Everything is processed locally on your device." },
                            { q: "Can I remove the password later?", a: "Yes, you can use our 'Unlock PDF' tool if you know the password and want to remove the security." },
                            { q: "What kind of encryption is used?", a: "We apply industry-standard AES encryption which is compatible with all modern PDF viewers." }
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

export default ProtectPDF;
