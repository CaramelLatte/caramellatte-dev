import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Header() {
    const { pathname } = useLocation();
    const navLink = (to, label) => (
        <Link className={`nav-link${pathname === to ? ' nav-link-active' : ''}`} to={to}>
            {label}
        </Link>
    );

    return (
        <header className="site-hero">
            <div className="hero-inner">
                <div className="hero-brand">
                    {/* <p className="hero-kicker">Will Code for Coffee</p> */}
                    <h1 className="site-title">Jared Ekenstam</h1>
                    <p className="hero-subtitle">
                        Tech enthusiast building backend systems, containerized infrastructure, and hands-on IT tooling.
                    </p>
                </div>
                <nav className="hero-nav">
                    {navLink('/about', 'About')}
                    {navLink('/games', 'Games')}
                    {navLink('/helpdesk', 'Helpdesk')}
                </nav>
            </div>
        </header>
    );
}

export default Header;
