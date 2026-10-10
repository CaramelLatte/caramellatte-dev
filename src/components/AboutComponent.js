import React from 'react';
import { Link } from 'react-router-dom';

const SKILL_GROUPS = [
    { label: 'Languages', items: ['Python', 'JavaScript', 'Bash / Shell'] },
    { label: 'Frameworks', items: ['Flask', 'React', 'REST APIs'] },
    { label: 'Infrastructure', items: ['Docker', 'Linux', 'Networking', 'Self-hosted infra'] },
];

const PROJECTS = [
    {
        title: 'Game Server Console',
        kind: 'Infrastructure · API',
        github: 'https://github.com/CaramelLatte/game-server',
        internalTo: '/games',
        internalLabel: 'Open live console',
        tags: ['Python', 'Flask', 'Docker', 'REST API'],
        description:
            'Flask REST API that manages dedicated game servers running in Docker containers. ' +
            'It polls server status in real time, tracks player counts, and starts or stops servers remotely. ' +
            'The console on this site talks to the production instance.',
    },
    {
        title: 'IT Helpdesk Simulator',
        kind: 'Full-stack · AI',
        github: null,
        internalTo: '/helpdesk',
        internalLabel: 'Try a scenario',
        tags: ['React', 'Zammad API', 'Local LLM', 'Self-hosted'],
        description:
            'A custom React UI and API layer on top of a self-hosted Zammad instance, turning an enterprise ' +
            'ticketing platform into a public training sim. It includes scenario selection, an AI persona for the ' +
            'end user, simulated shell diagnostics, and automated grading from a locally hosted LLM.',
    },
];

function About() {
    return (
        <div className="container">
            <section className="intro">
                <p className="eyebrow">IT &amp; Infrastructure</p>
                <h1 className="intro-title">
                    Backend systems, containerized infrastructure, and hands-on IT tooling.
                </h1>
                <p className="intro-lede">
                    I'm <strong>Jared</strong>. I build and run my own systems, including servers, containers, and
                    self-hosted tools, because that's how I actually learn. I'm working to turn that into an IT career,
                    with a long-term interest in cybersecurity and incident response.
                </p>
                <div className="intro-actions">
                    <a className="btn-ui btn-ui-primary" href="mailto:admin@caramellatte.dev">
                        Get in touch
                    </a>
                    <a
                        className="btn-ui"
                        href="https://www.linkedin.com/in/jared-e-777348208/"
                        target="_blank"
                        rel="noreferrer"
                    >
                        LinkedIn
                    </a>
                    <a
                        className="btn-ui"
                        href="https://github.com/CaramelLatte"
                        target="_blank"
                        rel="noreferrer"
                    >
                        GitHub
                    </a>
                </div>
            </section>

            <section className="section">
                <div className="section-head">
                    <h2 className="section-title">Selected projects</h2>
                    <p className="section-note">Both run on hardware I host and are live on this site.</p>
                </div>
                <div className="project-list">
                    {PROJECTS.map(p => (
                        <article className="project" key={p.title}>
                            <div className="project-aside">
                                <span className="project-kind">{p.kind}</span>
                                <span className="live-badge"><span className="live-dot" />Live</span>
                            </div>
                            <div className="project-main">
                                <h3 className="project-title">{p.title}</h3>
                                <p className="project-desc">{p.description}</p>
                                <ul className="tag-list" aria-label="Technologies">
                                    {p.tags.map(t => <li key={t} className="tag">{t}</li>)}
                                </ul>
                                <div className="project-links">
                                    {p.internalTo && (
                                        <Link to={p.internalTo} className="text-link text-link-strong">
                                            {p.internalLabel} <span aria-hidden="true">→</span>
                                        </Link>
                                    )}
                                    {p.github && (
                                        <a href={p.github} target="_blank" rel="noreferrer" className="text-link">
                                            Source on GitHub <span aria-hidden="true">↗</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section className="section">
                <div className="section-head">
                    <h2 className="section-title">Tools I work with</h2>
                </div>
                <dl className="skill-groups">
                    {SKILL_GROUPS.map(g => (
                        <div className="skill-group" key={g.label}>
                            <dt>{g.label}</dt>
                            <dd>{g.items.join(' · ')}</dd>
                        </div>
                    ))}
                </dl>
            </section>
        </div>
    );
}

export default About;
