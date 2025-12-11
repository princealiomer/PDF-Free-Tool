import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

const FileUploader = ({ onFilesSelected, multiple = false, accept = ".pdf", label = "Choose File" }) => {
    const inputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFilesSelected(e.dataTransfer.files);
        }
    };

    const handleClick = () => {
        inputRef.current.click();
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            onFilesSelected(e.target.files);
        }
    };

    return (
        <div
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
                border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-xl)',
                padding: '3rem',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: isDragging ? '#EEF2FF' : 'var(--bg-card)',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
            }}
        >
            <input
                type="file"
                ref={inputRef}
                onChange={handleChange}
                multiple={multiple}
                accept={accept}
                style={{ display: 'none' }}
            />
            <div style={{
                backgroundColor: isDragging ? 'var(--primary)' : 'var(--bg-main)',
                color: isDragging ? 'white' : 'var(--primary)',
                padding: '1rem',
                borderRadius: '50%',
                transition: 'all 0.2s ease',
            }}>
                <Upload size={32} />
            </div>
            <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {label}
                </h3>
                <p style={{ color: 'var(--text-muted)' }}>
                    or drop files here
                </p>
            </div>
        </div>
    );
};

export default FileUploader;
