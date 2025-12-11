import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Construction } from 'lucide-react';
import Button from '../components/common/Button';

const ComingSoon = ({ title = "Coming Soon", description = "We are currently working on this feature. Please check back later!" }) => {
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: '4rem 1rem' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '2rem', fontWeight: 500 }}>
                <ArrowLeft size={16} /> Back to Tools
            </Link>

            <div style={{ background: 'var(--bg-card)', padding: '3rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'inline-flex', padding: '1.5rem', borderRadius: '50%', background: '#fff7ed', color: '#ea580c', marginBottom: '1.5rem' }}>
                    <Construction size={48} />
                </div>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-main)' }}>{title}</h1>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '500px', marginInline: 'auto' }}>
                    {description}
                </p>
                <Link to="/">
                    <Button size="lg">Explore Other Tools</Button>
                </Link>
            </div>
        </div>
    );
};

export default ComingSoon;
