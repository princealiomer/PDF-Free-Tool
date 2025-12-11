import React from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';

const Header = () => {
  return (
    <header style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-card)', position: 'sticky', top: 0, zIndex: 10 }}>
      <div className="container" style={{ height: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--primary)' }}>
          <div style={{ background: 'var(--primary)', padding: '0.25rem', borderRadius: 'var(--radius-md)', color: 'white', display: 'flex' }}>
            <FileText size={20} />
          </div>
          <span style={{ color: 'var(--text-main)' }}>PDF Tools</span>
        </Link>
        <nav style={{ display: 'flex', gap: '1.5rem' }}>
          <Link to="/" style={{ fontWeight: 500, color: 'var(--text-main)' }}>All Tools</Link>
          <a href="#" style={{ fontWeight: 500, color: 'var(--text-muted)' }}>Pricing</a>
          <a href="#" style={{ fontWeight: 500, color: 'var(--text-muted)' }}>Help</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
