import React, { useState } from 'react';
import {
    Files, Scissors, Trash, FileInput, Scan,
    Minimize, Wrench, Search,
    Image, FileText, Presentation, Table, Globe,
    FileCheck, Shield, Lock, LockOpen, PenTool,
    RotateCw, Hash, Stamp, Crop, FileDiff, Grid, Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Define categories for filters
const CATEGORIES = [
    "All",
    "Organize PDF",
    "Optimize PDF",
    "Convert PDF",
    "Edit PDF",
    "PDF Security"
];

// Flat list of tools with categories tagged
const ALL_TOOLS = [
    { name: "Merge PDF", icon: Files, path: "/merge-pdf", desc: "Combine multiple PDFs into one unified document.", category: "Organize PDF", color: "#e53e3e" },
    { name: "Split PDF", icon: Scissors, path: "/split-pdf", desc: "Separate a PDF into individual pages or files.", category: "Organize PDF", color: "#e53e3e" },
    { name: "Compress PDF", icon: Minimize, path: "/compress-pdf", desc: "Reduce file size while optimizing for quality.", category: "Optimize PDF", color: "#38a169" },
    { name: "PDF to Word", icon: FileText, path: "/pdf-to-word", desc: "Convert PDF to editable Word documents.", category: "Convert PDF", color: "#3182ce" },
    { name: "PDF to PowerPoint", icon: Presentation, path: "/pdf-to-powerpoint", desc: "Turn your PDF files into easy to edit PPT slides.", category: "Convert PDF", color: "#dd6b20" },
    { name: "PDF to Excel", icon: Table, path: "/pdf-to-excel", desc: "Pull data straight from PDF into Excel spreadsheets.", category: "Convert PDF", color: "#38a169" },
    { name: "Word to PDF", icon: FileText, path: "/word-to-pdf", desc: "Make DOC and DOCX files easy to read by converting.", category: "Convert PDF", color: "#3182ce" },
    { name: "PowerPoint to PDF", icon: Presentation, path: "/powerpoint-to-pdf", desc: "Make PPT slides easy to view by converting to PDF.", category: "Convert PDF", color: "#dd6b20" },
    { name: "Excel to PDF", icon: Table, path: "/excel-to-pdf", desc: "Make Excel spreadsheets easy to read by converting.", category: "Convert PDF", color: "#38a169" },
    { name: "Edit PDF", icon: PenTool, path: "/edit-pdf", desc: "Add text, shapes, comments and highlights.", category: "Edit PDF", color: "#d69e2e", isNew: true },
    { name: "PDF to JPG", icon: Image, path: "/pdf-to-jpg", desc: "Convert each PDF page into a JPG or extract all images.", category: "Convert PDF", color: "#d69e2e" },
    { name: "JPG to PDF", icon: Image, path: "/jpg-to-pdf", desc: "Convert JPG images to PDF in seconds.", category: "Convert PDF", color: "#d69e2e" },
    { name: "Sign PDF", icon: PenTool, path: "/sign-pdf", desc: "Sign yourself or request electronic signatures.", category: "PDF Security", color: "#805ad5" },
    { name: "Watermark", icon: Stamp, path: "/watermark", desc: "Stamp an image or text over your PDF in seconds.", category: "Edit PDF", color: "#e53e3e" },
    { name: "Rotate PDF", icon: RotateCw, path: "/rotate-pdf", desc: "Rotate your PDFs the way you need them.", category: "Edit PDF", color: "#805ad5" },
    { name: "HTML to PDF", icon: Globe, path: "/html-to-pdf", desc: "Convert webpages in HTML to PDF.", category: "Convert PDF", color: "#3182ce" },
    { name: "Unlock PDF", icon: LockOpen, path: "/unlock-pdf", desc: "Remove PDF password security.", category: "PDF Security", color: "#718096" },
    { name: "Protect PDF", icon: Lock, path: "/protect-pdf", desc: "Protect PDF files with a password.", category: "PDF Security", color: "#718096" },
    { name: "Organize PDF", icon: Layers, path: "/organize-pdf", desc: "Sort pages of your PDF file however you like.", category: "Organize PDF", color: "#e53e3e" },
    { name: "PDF to PDF/A", icon: FileCheck, path: "/pdf-to-pdfa", desc: "Convert documents for long-term archiving.", category: "Convert PDF", color: "#e53e3e" },
    { name: "Repair PDF", icon: Wrench, path: "/repair-pdf", desc: "Repair a damaged PDF and recover data.", category: "Optimize PDF", color: "#718096" },
    { name: "Page Numbers", icon: Hash, path: "/page-numbers", desc: "Add page numbers into PDFs with ease.", category: "Edit PDF", color: "#e53e3e" },
    { name: "Scan to PDF", icon: Scan, path: "/scan-pdf", desc: "Capture document scans from your mobile device.", category: "Organize PDF", color: "#e53e3e" },
    { name: "OCR PDF", icon: Search, path: "/ocr-pdf", desc: "Convert scanned PDF into searchable documents.", category: "Optimize PDF", color: "#38a169" },
    { name: "Compare PDF", icon: FileDiff, path: "/compare-pdf", desc: "Show a side by side document comparison.", category: "PDF Security", color: "#3182ce", isNew: true },
    { name: "Redact PDF", icon: FileDiff, path: "/redact-pdf", desc: "Permanently remove sensitive information.", category: "PDF Security", color: "#3182ce", isNew: true },
    { name: "Crop PDF", icon: Crop, path: "/crop-pdf", desc: "Crop pages of PDF documents.", category: "Edit PDF", color: "#e53e3e", isNew: true },
    { name: "Remove Pages", icon: Trash, path: "/remove-pages", desc: "Delete unwanted pages from PDF.", category: "Organize PDF", color: "#e53e3e" },
    { name: "Extract Pages", icon: FileInput, path: "/extract-pages", desc: "Get specific pages from a PDF.", category: "Organize PDF", color: "#e53e3e" },
    { name: "Text to PDF", icon: FileText, path: "/text-to-pdf", desc: "Convert simple text to PDF.", category: "Convert PDF", color: "#718096" },
];

const Home = () => {
    const [activeCategory, setActiveCategory] = useState("All");

    const filteredTools = activeCategory === "All"
        ? ALL_TOOLS
        : ALL_TOOLS.filter(tool => tool.category === activeCategory);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <section style={{ textAlign: 'center', padding: '4rem 1rem 3rem' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
                    All the tools you need to work with PDFs
                </h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
                    Every tool you need to use PDFs, at your fingertips. All are 100% FREE and easy to use! Merge, split, compress, convert, rotate, unlock and watermark PDFs with just a few clicks.
                </p>
            </section>

            {/* Filter Pills */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        style={{
                            padding: '0.5rem 1.25rem',
                            borderRadius: '9999px',
                            border: 'none',
                            background: activeCategory === cat ? 'var(--text-main)' : 'white',
                            color: activeCategory === cat ? 'white' : 'var(--text-main)',
                            fontWeight: 500,
                            cursor: 'pointer',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <motion.div
                layout
                className="tool-grid"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '2.5rem',
                    padding: '1.5rem'
                }}
            >
                <AnimatePresence>
                    {filteredTools.map((tool) => (
                        <motion.div
                            key={tool.path}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Link
                                to={tool.path}
                                className="tool-card"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column', // Stack icon and text
                                    alignItems: 'flex-start',
                                    padding: '2rem',
                                    background: 'white',
                                    borderRadius: '12px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border)',
                                    textDecoration: 'none',
                                    height: '100%',
                                    position: 'relative',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-8px)';
                                    e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                                }}
                            >
                                {tool.isNew && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '1rem',
                                        right: '1rem',
                                        background: '#e53e3e',
                                        color: 'white',
                                        fontSize: '0.7rem',
                                        fontWeight: 'bold',
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '4px',
                                        textTransform: 'uppercase'
                                    }}>
                                        New!
                                    </span>
                                )}
                                <div style={{ marginBottom: '1.25rem', color: tool.color }}>
                                    <tool.icon size={42} strokeWidth={1.5} />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1a202c' }}>
                                    {tool.name}
                                </h3>
                                <p style={{ color: '#718096', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                                    {tool.desc}
                                </p>
                            </Link>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default Home;
