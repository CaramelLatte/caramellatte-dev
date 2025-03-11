import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
    return (
        <div>
        <div className="jumbotron">
            <h1 className='site-title'>Will Code for Coffee</h1>
            <div className='header-bar'>
                <Link className="nav-link" to="/about">About</Link>
                <Link className="nav-link" to="/games">Games</Link>
                <Link className="nav-link" to="/rate-quote-tool">Rate Quote Tool</Link>
            </div>
        </div>
        </div>
    );
}

export default Header;