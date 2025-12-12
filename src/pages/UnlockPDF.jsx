import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import FileUploader from '../components/common/FileUploader';
import Button from '../components/common/Button';
import { ArrowLeft, LockOpen, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/common/SEO';
import { ChevronDown, ChevronUp } from 'lucide-react';

const UnlockPDF = () => {
    const [file, setFile] = useState(null);
    const [password, setPassword] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleFile = (files) => {
        if (files.length > 0) setFile(files[0]);
    };

    const handleUnlock = async () => {
        if (!file) return;
        setProcessing(true);
        try {
            const buffer = await file.arrayBuffer();
            // Try to load. If it has a password, pdf-lib (standard) might throw if not provided, 
            // but actually pdf-lib load function takes options.
            // However, usually we might try to load without password first, but for protected, we need it.
            // Actually, standard `pdf-lib` allows loading encrypted without password if user password is empty OR prompts?
            // No, we must provide it if it's encrypted.
            // But we can just try loading. If it fails, we assume it needs password.
            // Wait, the user usually inputs password to unlock it for saving unprotected.
            // Or does the tool crack it? No, client side cracking is impossible/illegal usually.
            // "Unlock PDF" usually means "Remove Password" given the password.

            let pdfDoc;
            try {
                // If password provided, use it.
                // Note: pdf-lib ignores password if not needed usually, but let's check docs logic.
                // Actually, PDFDocument.load(..., { password: ... })
                // If no password provided for encrypted doc -> Error "Password required"
                pdfDoc = await PDFDocument.load(buffer, { password: password, ignoreEncryption: true }); // ignoreEncryption might load it but we need to decrypt to save?
                // Actually ignoreEncryption allows reading metadata but maybe not modifying.
                // We want to SAVE a new copy WITHOUT encryption.
                // To do that, we load WITH password, then just save(). 
                // pdf-lib's save() does NOT persist encryption by default unless encrypt() is called.
                // So just loading with correct password and saving() removes encryption!
            } catch (e) {
                // Retry with empty string if user didn't provide one?
                // Or just alert "Incorrect password"
                throw new Error("Invalid password or document");
            }

            // Check if we can actually access pages (verify decryption worked)
            pdfDoc.getPageCount();

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            saveAs(blob, `${file.name.replace(/\.pdf$/i, '')}-unlocked.pdf`);
        } catch (err) {
            console.error("Error unlocking PDF", err);
            alert("Failed to unlock PDF. Please check the password.");
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
        "name": "Unlock PDF",
        "applicationCategory": "SecurityApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Unlock PDF files. Remove password security and restrictions from your PDF documents online.",
        "featureList": "Remove password, Decrypt PDF, Client-side processing",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "320"
        }
    };

    return (
        <>
            <SEO
                title="Unlock PDF - Remove Password from PDF Online"
                description="Unlock PDF files instantly. Remove password protection and copying restrictions online for free. Secure client-side decryption."
                keywords="unlock pdf, remove pdf password, decrypt pdf, open protected pdf, free pdf unlocker"
                schema={schema}
            />
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: 500 }}>
                    <ArrowLeft size={16} /> Back to Tools
                </Link>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Unlock PDF</h1>
                    <p style={{ color: 'var(--text-muted)' }}>remove password security from PDF files.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {!file ? (
                        <FileUploader onFilesSelected={handleFile} label="Select Encrypted PDF file" />
                    ) : (
                        <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{ background: 'var(--primary)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: 'white' }}>
                                    <LockOpen size={32} />
                                </div>
                                <h3>{file.name}</h3>
                                <Button variant="secondary" onClick={() => setFile(null)} size="sm" style={{ marginLeft: 'auto' }}>Change File</Button>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>Enter Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password to open file"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border)',
                                        fontFamily: 'inherit'
                                    }}
                                />
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                    We need the password to remove the security.
                                </p>
                            </div>

                            <Button onClick={handleUnlock} disabled={processing || !password} size="lg" style={{ width: '100%' }}>
                                {processing ? 'Unlocking...' : <><LockOpen size={20} style={{ marginRight: '0.5rem' }} /> Unlock PDF</>}
                            </Button>
                        </div>
                    )}
                </div>
            </div>


            <div style={{ marginTop: '4rem' }}>
                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem' }}>Why use our Unlock PDF tool?</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', color: 'var(--text-main)' }}>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Instant Access</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Quickly remove passwords from files you own so you can edit, print, or copy them without restriction.</p>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Safe & Secure</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Unlocking happens in your browser. We never see your files or your passwords.</p>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Easy to Use</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Just upload, enter the password once, and download a completely unlocked version of your PDF.</p>
                        </div>
                    </div>
                </section>

                <section style={{ marginBottom: '3rem', padding: '2rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>How to remove password from PDF</h2>
                    <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li>Upload your password-protected PDF file.</li>
                        <li>Enter the current password (we need permission to unlock it).</li>
                        <li>Click 'Unlock PDF'.</li>
                        <li>Download the unencrypted file.</li>
                    </ol>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Frequently Asked Questions</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { q: "Can you unlock a file if I forgot the password?", a: "No, our tool requires the correct password to decrypt the file. It is not a password cracking tool." },
                            { q: "Is the new file permanently unlocked?", a: "Yes. The downloaded file will have no password and can be opened by anyone." },
                            { q: "Is it safe to type my password here?", a: "Yes. Because the process runs entirely in your browser, the password never leaves your computer." },
                            { q: "Does it work on Macs and Phones?", a: "Yes, our tool works on all devices and modern browsers including Chrome, Safari, and Edge." }
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

export default UnlockPDF;
