import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
    return (
        <header className="site-hero">
            <div className="hero-inner">
                <div className="hero-brand">
                    <p className="hero-kicker">Indie tinkering & espresso-fueled experiments</p>
                    <h1 className="site-title">Will Code for Coffee</h1>
                    <p className="hero-subtitle">
                        A hub for servers, prototypes, and whatever else keeps me entertained.
                    </p>
                </div>
                <nav className="hero-nav">
                    <Link className="nav-link" to="/about">
                        About
                    </Link>
                    <Link className="nav-link" to="/games">
                        Games
                    </Link>
                    <Link className="nav-link" to="/apps">
                        Apps
                    </Link>
                </nav>
            </div>
        </header>
    );
}

export default Header;
