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
        <div className="apps-page container-fluid py-4">
            <div className="mx-auto apps-page-inner">
                <section className="apps-hero text-center">
                    <p className="apps-kicker">Labs & Sidequests</p>
                    <h2 className="display-6">Self-Hosted Cloud</h2>
                    <p className="text-muted mb-0">A planned dashboard for self-hosted Xpra sandboxes - games, productivity tools, and other experiments. The cards below are upcoming ideas; nothing is deployed here yet.</p>
                </section>

                <div className="row g-4 apps-grid">
                    {FUTURE_APPS.map((app) => (
                        <div className="col-12 col-md-6 col-xl-4" key={app.name}>
                            <div className="apps-card h-100">
                                <div className="apps-card-body">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h3 className="h5 mb-0">{app.name}</h3>
                                        <span className="apps-pill">{app.status}</span>
                                    </div>
                                    <p className="text-muted mb-3">{app.description}</p>
                                    <div className="small text-muted fst-italic">Slots open soon-ping me if you want early access.</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="apps-cta card mt-5">
                    <div className="card-body d-flex flex-column flex-md-row align-items-md-center gap-3">
                        <div>
                            <h3 className="h5 mb-1">Need something specific?</h3>
                        </div>
                        <Link className="btn btn-primary ms-md-auto" to="/about">
                            Say hello
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AppsIndex;
