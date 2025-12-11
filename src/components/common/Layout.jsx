import React from 'react';
import Header from './Header';
import Footer from './Footer';
import SEO from './SEO';
import { Outlet } from 'react-router-dom';

const Layout = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <SEO />
            <Header />
            <main style={{ flex: 1, padding: '2rem 0' }}>
                <div className="container">
                    <Outlet />
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
