import React from 'react';

function Footer() {
    return (
        <footer className="site-footer">
            <div className="site-footer-inner">
                <span>© {new Date().getFullYear()} Jared Ekenstam · Self-hosted on hardware I run</span>
                <div className="site-footer-links">
                    <a href="mailto:admin@caramellatte.dev">Email</a>
                    <a href="https://www.linkedin.com/in/jared-e-777348208/" target="_blank" rel="noreferrer">LinkedIn</a>
                    <a href="https://github.com/CaramelLatte" target="_blank" rel="noreferrer">GitHub</a>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
