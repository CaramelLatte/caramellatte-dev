import React, { useState, useEffect, useRef, useCallback } from 'react';

const POLL_INTERVAL = 5000;

function Helpdesk() {
    const [phase, setPhase] = useState('pick');       // 'pick' | 'active' | 'graded'
    const [scenarios, setScenarios] = useState([]);
    const [selected, setSelected] = useState(null);
    const [ticketId, setTicketId] = useState(null);
    const [thread, setThread] = useState([]);
    const [shellLog, setShellLog] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [commandInput, setCommandInput] = useState('');
    const [closeNotes, setCloseNotes] = useState('');
    const [resolutionMode, setResolutionMode] = useState('close');  // 'close' | 'escalate'
    const [escalateGroup, setEscalateGroup] = useState('');
    const [grade, setGrade] = useState(null);
    const [error, setError] = useState(null);
    const [starting, setStarting] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [sendingMsg, setSendingMsg] = useState(false);
    const [showCmdRef, setShowCmdRef] = useState(false);
    const [availableCommands, setAvailableCommands] = useState([]);

    const threadEndRef = useRef(null);
    const shellEndRef = useRef(null);
    const pollThreadRef = useRef(null);
    const pollShellRef = useRef(null);

    // Load scenarios
    useEffect(() => {
        fetch('/api/scenarios')
            .then(r => r.json())
            .then(data => {
                // API may return a bare array or a wrapped object
                if (Array.isArray(data)) {
                    setScenarios(data);
                } else if (data && typeof data === 'object') {
                    const list = data.scenarios ?? data.items ?? data.data ?? data.results ?? Object.values(data);
                    setScenarios(Array.isArray(list) ? list : []);
                } else {
                    setScenarios([]);
                }
            })
            .catch(() => setError('Could not reach the ticketing sim! Is it running?'));
    }, []);

    const fetchThread = useCallback((id) => {
        fetch(`/api/tickets/${id}/thread`)
            .then(r => r.json())
            .then(data => setThread(Array.isArray(data) ? data : (data.messages ?? [])))
            .catch(() => {});
    }, []);

    const fetchShellLog = useCallback((id) => {
        fetch(`/api/shell/${id}/log`)
            .then(r => r.json())
            .then(data => setShellLog(Array.isArray(data) ? data : (data.command_log ?? [])))
            .catch(() => {});
    }, []);

    // Start polling when active
    useEffect(() => {
        if (phase !== 'active' || !ticketId) return;
        fetchThread(ticketId);
        fetchShellLog(ticketId);
        pollThreadRef.current = setInterval(() => fetchThread(ticketId), POLL_INTERVAL);
        pollShellRef.current = setInterval(() => fetchShellLog(ticketId), POLL_INTERVAL);
        return () => {
            clearInterval(pollThreadRef.current);
            clearInterval(pollShellRef.current);
        };
    }, [phase, ticketId, fetchThread, fetchShellLog]);

    // Scroll to bottom of thread/shell when updated
    useEffect(() => {
        threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [thread]);

    useEffect(() => {
        shellEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [shellLog]);

    const startSession = async () => {
        if (!selected) return;
        setStarting(true);
        setError(null);
        try {
            const res = await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scenario_id: selected }),
            });
            if (!res.ok) throw new Error('Bad response');
            const data = await res.json();
            const id = data.ticket_id;
            setTicketId(id);

            fetch(`/api/shell/${id}/commands`)
                .then(r => r.json())
                .then(d => setAvailableCommands(Array.isArray(d.available_commands) ? d.available_commands : []))
                .catch(() => {});

            setPhase('active');
        } catch {
            setError('Failed to start session. Check that the ticketing sim is running.');
        } finally {
            setStarting(false);
        }
    };

    const sendMessage = async () => {
        const msg = messageInput.trim();
        if (!msg || sendingMsg) return;
        setSendingMsg(true);
        setMessageInput('');
        try {
            await fetch(`/api/tickets/${ticketId}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg }),
            });
            fetchThread(ticketId);
        } catch {
            setError('Failed to send message.');
        } finally {
            setSendingMsg(false);
        }
    };

    const runCommand = async () => {
        const cmd = commandInput.trim();
        if (!cmd) return;
        setCommandInput('');
        try {
            await fetch(`/api/shell/${ticketId}/command`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: cmd }),
            });
            fetchShellLog(ticketId);
        } catch {
            setError('Failed to run command.');
        }
    };

    const submitResolution = async () => {
        setSubmitting(true);
        setError(null);
        try {
            const stateBody = resolutionMode === 'close'
                ? { state: 'closed' }
                : { group: escalateGroup };

            await fetch(`/api/tickets/${ticketId}/state`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(stateBody),
            });

            const res = await fetch(`/api/tickets/${ticketId}/close`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes: closeNotes }),
            });
            if (!res.ok) throw new Error('Close failed');
            const data = await res.json();
            clearInterval(pollThreadRef.current);
            clearInterval(pollShellRef.current);
            setGrade(data);
            setPhase('graded');
        } catch {
            setError('Failed to submit resolution.');
        } finally {
            setSubmitting(false);
        }
    };

    const reset = () => {
        setPhase('pick');
        setSelected(null);
        setTicketId(null);
        setThread([]);
        setShellLog([]);
        setMessageInput('');
        setCommandInput('');
        setCloseNotes('');
        setResolutionMode('close');
        setEscalateGroup('');
        setGrade(null);
        setError(null);
    };

    // ─── Render ───────────────────────────────────────────────────────────────

    if (phase === 'pick') {
        return (
            <div className="hd-page container-fluid py-4">
                <div className="hd-inner mx-auto">
                    <section className="hd-hero text-center mb-4">
                        <p className="hd-kicker">IT Helpdesk Simulator</p>
                        <h2 className="display-6 mb-2">Choose a Scenario</h2>
                        <p className="text-muted mb-0">
                            Pick a ticket to work. Diagnose the issue, communicate with the user, run diagnostics, then resolve or escalate.
                        </p>
                    </section>

                    {error && <div className="hd-error mb-3">{error}</div>}

                    {scenarios.length === 0 && !error && (
                        <p className="text-center text-muted">Loading scenarios…</p>
                    )}

                    <div className="row g-3">
                        {scenarios.map((s, i) => (
                            <div className="col-12 col-md-6" key={s.id ?? i}>
                                <div
                                    className={`hd-scenario-card ${selected === s ? 'hd-scenario-selected' : ''}`}
                                    onClick={() => setSelected(s)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={e => e.key === 'Enter' && setSelected(s)}
                                >
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <h3 className="h5 mb-0">
                                            {typeof s === 'string'
                                                ? s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                                                : (s.name ?? s.title ?? `Scenario ${i + 1}`)}
                                        </h3>
                                        {selected === s && (
                                            <span className="hd-pill hd-pill-selected">Selected</span>
                                        )}
                                    </div>
                                    <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                                        {typeof s === 'string' ? '' : (s.description ?? s.summary ?? '')}
                                    </p>
                                    {s.difficulty && (
                                        <div className="mt-2">
                                            <span className="hd-pill">{s.difficulty}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="hd-howto mt-4">
                        <div className="hd-howto-steps">
                            <div className="hd-howto-step">
                                <span className="hd-howto-num">1</span>
                                <span>Read the user's opening message to understand the issue.</span>
                            </div>
                            <div className="hd-howto-step">
                                <span className="hd-howto-num">2</span>
                                <span>Run diagnostic commands in the Shell panel to investigate.</span>
                            </div>
                            <div className="hd-howto-step">
                                <span className="hd-howto-num">3</span>
                                <span>Reply to the user in the Conversation panel - the AI persona responds automatically.</span>
                            </div>
                            <div className="hd-howto-step">
                                <span className="hd-howto-num">4</span>
                                <span>When resolved, write your notes and submit for grading.</span>
                            </div>
                        </div>
                    </div>

                    <div className="hd-notice mt-3">
                        <span className="hd-notice-icon">⚡</span>
                        <span>
                            This sim runs on personal self-hosted hardware using a local LLM.
                            Persona replies and grading may take <strong>15–45 seconds</strong>, this is normal.
                        </span>
                    </div>

                    <div className="text-center mt-4">
                        <button
                            className="btn btn-primary btn-lg px-5"
                            disabled={!selected || starting}
                            onClick={startSession}
                        >
                            {starting ? 'Starting…' : 'Start Session'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (phase === 'graded') {
        return (
            <div className="hd-page container-fluid py-4">
                <div className="hd-inner mx-auto">
                    <section className="hd-hero text-center mb-4">
                        <p className="hd-kicker">Session Complete</p>
                        <h2 className="display-6 mb-2">Grading Report</h2>
                        <p className="text-muted">Ticket #{ticketId} · {typeof selected === 'string'
                                                ? selected.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                                                : (selected?.name ?? selected?.title ?? '')}</p>
                    </section>

                    <div className="hd-grade-card">
                        <GradeReport data={grade} />
                    </div>

                    <div className="text-center mt-4">
                        <button className="btn btn-primary px-5" onClick={reset}>
                            Try Another Scenario
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // phase === 'active'
    return (
        <div className="hd-active container-fluid py-3">
            {/* Ticket info bar */}
            <div className="hd-ticketbar mb-3 mx-auto">
                <div className="d-flex align-items-center gap-3 flex-wrap">
                    <span className="hd-kicker mb-0" style={{ fontSize: '0.7rem' }}>Ticket #{ticketId}</span>
                    <span className="hd-ticketbar-name">{typeof selected === 'string'
                                                ? selected.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                                                : (selected?.name ?? selected?.title ?? '')}</span>
                    {selected?.difficulty && <span className="hd-pill ms-auto">{selected.difficulty}</span>}
                </div>
            </div>

            <div className="hd-notice hd-notice-sm mb-3 mx-auto hd-active-inner">
                <span className="hd-notice-icon">⚡</span>
                <span>Running on self-hosted hardware with a local LLM. Persona replies and grading may take 15–45 seconds.</span>
            </div>

            {error && <div className="hd-error mb-3 mx-auto hd-active-inner">{error}</div>}

            <div className="row g-3 hd-active-inner mx-auto">
                {/* Thread panel */}
                <div className="col-12 col-lg-7 d-flex flex-column">
                    <div className="hd-panel hd-thread-panel flex-grow-1 d-flex flex-column">
                        <div className="hd-panel-label">Conversation</div>
                        <div className="hd-thread flex-grow-1">
                            {thread.length === 0 && (
                                <p className="text-muted text-center" style={{ fontSize: '0.85rem', marginTop: '2rem' }}>
                                    Waiting for the first message…
                                </p>
                            )}
                            {thread.map((msg, i) => (
                                <ThreadMessage key={msg.article_id ?? i} msg={msg} />
                            ))}
                            <div ref={threadEndRef} />
                        </div>
                        <div className="hd-reply">
                            <textarea
                                className="hd-textarea"
                                rows={3}
                                placeholder="Type your response…"
                                value={messageInput}
                                onChange={e => setMessageInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) sendMessage();
                                }}
                            />
                            <div className="d-flex justify-content-between align-items-center mt-2">
                                <small className="text-muted">Ctrl+Enter to send</small>
                                <button
                                    className="btn btn-primary btn-sm px-4"
                                    onClick={sendMessage}
                                    disabled={!messageInput.trim() || sendingMsg}
                                >
                                    {sendingMsg ? 'Sending…' : 'Send'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shell + Resolution panels */}
                <div className="col-12 col-lg-5 d-flex flex-column gap-3">
                    {/* Shell panel */}
                    <div className="hd-panel hd-shell-panel d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <div className="hd-panel-label mb-0">Shell / Diagnostics</div>
                            <button
                                className="hd-cmdref-toggle"
                                onClick={() => setShowCmdRef(v => !v)}
                            >
                                {showCmdRef ? 'Hide commands' : 'Available commands'}
                            </button>
                        </div>
                        {showCmdRef && <CommandReference commands={availableCommands} />}
                        <div className="hd-shell-log flex-grow-1">
                            {shellLog.length === 0 && (
                                <span className="hd-shell-placeholder">No commands run yet.</span>
                            )}
                            {shellLog.map((entry, i) => (
                                <ShellEntry key={i} entry={entry} />
                            ))}
                            <div ref={shellEndRef} />
                        </div>
                        <div className="hd-shell-input-row">
                            <span className="hd-shell-prompt">$</span>
                            <input
                                className="hd-shell-input"
                                type="text"
                                placeholder="ping 192.168.1.1"
                                value={commandInput}
                                onChange={e => setCommandInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && runCommand()}
                            />
                            <button className="btn btn-sm hd-btn-run" onClick={runCommand}>Run</button>
                        </div>
                    </div>

                    {/* Resolution panel */}
                    <div className="hd-panel hd-resolution-panel">
                        <div className="hd-panel-label">Resolution</div>
                        <div className="hd-resolution-toggle mb-3">
                            <button
                                className={`hd-toggle-btn ${resolutionMode === 'close' ? 'active' : ''}`}
                                onClick={() => setResolutionMode('close')}
                            >
                                Close ticket
                            </button>
                            <button
                                className={`hd-toggle-btn ${resolutionMode === 'escalate' ? 'active' : ''}`}
                                onClick={() => setResolutionMode('escalate')}
                            >
                                Escalate
                            </button>
                        </div>

                        {resolutionMode === 'escalate' && (
                            <input
                                className="hd-input mb-3"
                                type="text"
                                placeholder="Group name (e.g. Network Team)"
                                value={escalateGroup}
                                onChange={e => setEscalateGroup(e.target.value)}
                            />
                        )}

                        <textarea
                            className="hd-textarea mb-3"
                            rows={3}
                            placeholder="Resolution notes (what you did, what you found)…"
                            value={closeNotes}
                            onChange={e => setCloseNotes(e.target.value)}
                        />

                        <button
                            className="btn btn-success w-100 d-flex align-items-center justify-content-center gap-2"
                            onClick={submitResolution}
                            disabled={submitting || (resolutionMode === 'escalate' && !escalateGroup.trim())}
                        >
                            {submitting && <span className="hd-spinner" />}
                            {submitting
                                ? 'Grading... this may take a moment…'
                                : resolutionMode === 'close' ? 'Submit & Grade' : 'Escalate & Grade'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ThreadMessage({ msg }) {
    const isOperator = msg.role === 'operator';
    return (
        <div className={`hd-msg ${isOperator ? 'hd-msg-operator' : 'hd-msg-user'}`}>
            <div className="hd-msg-meta">
                <span className="hd-msg-role">{isOperator ? 'You' : 'User'}</span>
                {msg.timestamp && (
                    <span className="hd-msg-time">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                )}
            </div>
            <div className="hd-msg-body">{msg.body}</div>
        </div>
    );
}

function ShellEntry({ entry }) {
    if (typeof entry === 'string') {
        return <pre className="hd-shell-line">{entry}</pre>;
    }
    return (
        <div className="hd-shell-entry">
            {entry.command && <div className="hd-shell-cmd">$ {entry.command}</div>}
            {entry.output && <pre className="hd-shell-out">{entry.output}</pre>}
        </div>
    );
}

function GradeReport({ data }) {
    if (!data) return null;

    // If the API returns a structured object with known fields, render nicely.
    // Otherwise, fall back to a formatted JSON dump.
    if (typeof data === 'object' && !Array.isArray(data)) {
        const { score, grade, rubric, feedback, items, ...rest } = data;
        return (
            <div className="hd-grade-body">
                {(score !== undefined || grade !== undefined) && (
                    <div className="hd-grade-score">
                        <span className="hd-grade-label">Score</span>
                        <span className="hd-grade-value">{score ?? grade}</span>
                    </div>
                )}
                {feedback && (
                    <div className="mb-3">
                        <div className="hd-grade-section-label">Feedback</div>
                        <p className="text-muted" style={{ fontSize: '0.9rem' }}>{feedback}</p>
                    </div>
                )}
                {(rubric || items) && (
                    <div>
                        <div className="hd-grade-section-label">Rubric</div>
                        <RubricList items={rubric ?? items} />
                    </div>
                )}
                {Object.keys(rest).length > 0 && (
                    <pre className="hd-grade-json">{JSON.stringify(rest, null, 2)}</pre>
                )}
            </div>
        );
    }

    return <pre className="hd-grade-json">{JSON.stringify(data, null, 2)}</pre>;
}

function RubricList({ items }) {
    if (!items) return null;
    if (Array.isArray(items)) {
        return (
            <ul className="hd-rubric-list">
                {items.map((item, i) => {
                    if (typeof item === 'string') return <li key={i}>{item}</li>;
                    const { criterion, passed, points, earned, note, ...rest } = item;
                    return (
                        <li key={i} className={`hd-rubric-item ${passed === false ? 'hd-rubric-fail' : passed ? 'hd-rubric-pass' : ''}`}>
                            <span className="hd-rubric-criterion">{criterion ?? JSON.stringify(rest)}</span>
                            {(points !== undefined || earned !== undefined) && (
                                <span className="hd-rubric-pts">{earned ?? '–'}/{points ?? '–'}</span>
                            )}
                            {note && <span className="hd-rubric-note">{note}</span>}
                        </li>
                    );
                })}
            </ul>
        );
    }
    return <pre className="hd-grade-json">{JSON.stringify(items, null, 2)}</pre>;
}

function CommandReference({ commands }) {
    if (!commands.length) return null;
    return (
        <div className="hd-cmdref">
            {commands.map((entry, i) => {
                const cmd = typeof entry === 'string' ? entry : (entry.command ?? entry.cmd ?? JSON.stringify(entry));
                const desc = typeof entry === 'object' ? (entry.description ?? entry.desc ?? '') : '';
                return (
                    <div key={i} className="hd-cmdref-row">
                        <code className="hd-cmdref-cmd">{cmd}</code>
                        {desc && <span className="hd-cmdref-desc">{desc}</span>}
                    </div>
                );
            })}
        </div>
    );
}

export default Helpdesk;
