import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const NAV = [
    { to: '/about', label: 'About' },
    { to: '/games', label: 'Game Servers' },
    { to: '/helpdesk', label: 'Helpdesk Sim' },
];

function Header() {
    return (
        <header className="site-header">
            <div className="site-header-inner">
                <Link to="/about" className="wordmark">
                    Jared Ekenstam
                </Link>
                <nav className="site-nav" aria-label="Primary">
                    {NAV.map(({ to, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) => `site-nav-link${isActive ? ' is-active' : ''}`}
                        >
                            {label}
                        </NavLink>
                    ))}
                </nav>
            </div>
        </header>
    );
}

export default Header;
