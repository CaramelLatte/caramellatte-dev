import React from 'react';
import { Link } from 'react-router-dom';

const SKILLS = [
    'Python', 'Flask', 'Docker', 'Linux', 'React',
    'JavaScript', 'Bash / Shell', 'Networking', 'REST APIs', 'Self-hosted Infra',
];

const PROJECTS = [
    {
        icon: 'python-logo.png',
        github: 'https://github.com/CaramelLatte/game-server',
        internalTo: '/games',
        internalLabel: 'Live Demo',
        title: 'Game Server Console',
        tags: ['Python', 'Flask', 'Docker', 'REST API'],
        description:
            'Flask-based REST API for managing dedicated game servers in Docker containers. ' +
            'Real-time status polling, player count tracking, and remote start/stop control. ' +
            'A live demo is running in the Games tab.',
    },
    {
        iconEmoji: '⌨',
        github: null,
        internalTo: '/helpdesk',
        internalLabel: 'Try It',
        title: 'IT Helpdesk Simulator',
        tags: ['React', 'Zammad API', 'Local LLM', 'Self-hosted'],
        description:
            'A custom React UI and API integration layer built on top of a self-hosted Zammad instance. ' +
            'Wraps an enterprise ticketing platform into a public-facing demo. It features scenario selection, ' +
            'AI-persona conversation, simulated shell diagnostics, and automated grading via a locally-hosted LLM.',
    },
];

function About() {
    return (
        <div className="container">
            <div className="about-bio-card">
                <div className="about-section-label">About</div>
                <p className="about-bio-text">
                    I'm <strong>Jared</strong>. I build and run my own systems including servers, containers, and self-hosted tools because that's how I actually learn. I'm working to turn that into an IT career, with a long-term interest in cybersecurity and incident response.
                </p>

                <div className="about-contacts">
                    <a className="about-contact-link" href="mailto:admin@caramellatte.dev">
                        Email me
                    </a>
                    <a
                        className="about-contact-link"
                        href="https://www.linkedin.com/in/jared-e-777348208/"
                        target="_blank"
                        rel="noreferrer"
                    >
                        LinkedIn
                    </a>
                </div>
                <div className="about-section-label" style={{ marginTop: '1.75rem' }}>
                    Tech I work with
                </div>
                <div className="skill-pills">
                    {SKILLS.map(s => <span key={s} className="skill-pill">{s}</span>)}
                </div>
            </div>

            <div className="about-section-label">Projects</div>
            <div className="card-grid" style={{ marginTop: '0.75rem', marginBottom: '2rem' }}>
                {PROJECTS.map(p => (
                    <div className="project-card" key={p.title}>
                        {p.icon
                            ? <img src={p.icon} alt={p.title} />
                            : <div className="project-icon-placeholder">{p.iconEmoji ?? '◆'}</div>
                        }
                        <div className="card-title">{p.title}</div>
                        <div className="project-card-tags">
                            {p.tags.map(t => <span key={t} className="project-tag">{t}</span>)}
                        </div>
                        <div className="card-body" style={{ flex: 1 }}>{p.description}</div>
                        <div className="project-card-links">
                            {p.github && (
                                <a href={p.github} target="_blank" rel="noreferrer" className="project-link">
                                    GitHub
                                </a>
                            )}
                            {p.internalTo && (
                                <Link to={p.internalTo} className="project-link project-link-accent">
                                    {p.internalLabel} →
                                </Link>
                            )}
                            {p.externalHref && (
                                <a href={p.externalHref} target="_blank" rel="noreferrer" className="project-link project-link-accent">
                                    {p.externalLabel} →
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default About;
