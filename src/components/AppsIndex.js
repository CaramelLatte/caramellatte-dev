import React from 'react';
import { Link } from 'react-router-dom';

const FUTURE_APPS = [
    {
        name: 'Pixelboard',
        status: 'Prototype',
        description: 'Shared whiteboard backed by headless Chromium for multiplayer doodling sessions.'
    },
    {
        name: 'Synth Garden',
        status: 'Exploration',
        description: 'Browser-accessible audio workstation piping JACK audio into web streams.'
    },
    {
        name: 'Retro Lab',
        status: 'In R&D',
        description: 'A stable of emulator-powered sandboxes for LAN parties and cozy tournaments.'
    }
];

function AppsIndex() {
    return (
        <div className="container">
            <header className="page-header">
                <p className="eyebrow">Labs</p>
                <h1 className="page-title">Self-hosted cloud</h1>
                <p className="page-lede">
                    A planned dashboard for self-hosted Xpra sandboxes: games, productivity tools, and other
                    experiments. These are upcoming ideas. Nothing is deployed here yet.
                </p>
            </header>

            <div className="apps-grid">
                {FUTURE_APPS.map((app) => (
                    <article className="panel" key={app.name}>
                        <div className="apps-card-head">
                            <h2 className="panel-title">{app.name}</h2>
                            <span className="tag">{app.status}</span>
                        </div>
                        <p className="panel-text">{app.description}</p>
                    </article>
                ))}
            </div>

            <div className="callout apps-cta">
                <div>
                    <div className="callout-title">Want early access or have an idea?</div>
                    <p className="mb-0">I'm happy to talk through what's possible.</p>
                </div>
                <Link className="btn-ui btn-ui-primary" to="/about">Say hello</Link>
            </div>
        </div>
    );
}

export default AppsIndex;
