import React from 'react';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    ...props
}) => {
    const baseStyles = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-md)',
        fontWeight: 500,
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        border: 'none',
        outline: 'none',
    };

    const variants = {
        primary: {
            backgroundColor: 'var(--primary)',
            color: 'white',
            boxShadow: 'var(--shadow-sm)',
        },
        secondary: {
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-main)',
            border: '1px solid var(--border)',
        },
        danger: {
            backgroundColor: '#EF4444',
            color: 'white',
        },
    };

    const sizes = {
        sm: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
        md: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
        lg: { padding: '1rem 2rem', fontSize: '1.125rem' },
    };

    const style = {
        ...baseStyles,
        ...variants[variant],
        ...sizes[size],
        ...props.style,
    };

    return (
        <button style={style} {...props} className={className}>
            {children}
        </button>
    );
};

export default Button;
