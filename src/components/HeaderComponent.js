import React, { useState } from 'react';
import { Container } from 'reactstrap';
import { Link } from 'react-router-dom';
import Logo from '../logo.png';

function Header() {
    // const [state, setState] = useState(initialState);

    return (
        <div>
        <div className="jumbotron">
            {/* <img src={Logo} alt="Logo" /> */}
            <h1>placeholder</h1>
            <div className='header-bar'>
                <Link className="nav-link" to="/about">About</Link>
                <Link className="nav-link" to="/games">Games</Link>
            </div>
        </div>
        </div>
    );
}

export default Header;